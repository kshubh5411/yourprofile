import React, { useRef, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';
import { BrandLogo } from './components/BrandLogo';
import { useBioData } from './hooks/useBioData';
import { Wand2, Globe, Download, Loader2, MapPin, Share2, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { countries } from './constants/languages';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function App() {
  const { 
    data, 
    labels,
    updateField, 
    addCustomField,
    removeCustomField,
    updateCustomField,
    setTemplate, 
    setCountry,
    setLanguage, 
    handleAiEnhance, 
    handleGeneratePartnerPreferences,
    loadSampleData, 
    updateCustomization,
    toggleSectionVisibility,
    updateProfileImage,
    isGenerating, 
    isGeneratingPartnerPreferences,
    error 
  } = useBioData();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handlePrint = async () => {
    if (!componentRef.current) return;
    
    setIsPrinting(true);
    try {
      const element = componentRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // To handle images from external domains
        logging: false,
        backgroundColor: '#ffffff', // Ensure white background
        onclone: (clonedDoc) => {
          // 1. Handle print visibility classes manually
          // Hide elements with 'print:hidden'
          const printHidden = clonedDoc.querySelectorAll('.print\\:hidden');
          printHidden.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          // Show elements with 'print:block' (assuming they might be hidden)
          const printBlock = clonedDoc.querySelectorAll('.print\\:block');
          printBlock.forEach((el) => {
             (el as HTMLElement).style.display = 'block';
          });
          
           // Show elements with 'print:flex'
          const printFlex = clonedDoc.querySelectorAll('.print\\:flex');
          printFlex.forEach((el) => {
             (el as HTMLElement).style.display = 'flex';
          });

          // 2. Remove shadows from all elements to prevent color parsing issues
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const style = (el as HTMLElement).style;
            if (style) {
              style.boxShadow = 'none';
              style.textShadow = 'none';
              style.filter = 'none';
            }
          });

          // 3. Specific fix for the container
          const clonedElement = clonedDoc.querySelector('.bg-white.shadow-2xl');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
            (clonedElement as HTMLElement).style.boxShadow = 'none';
          }

          // 4. Sanitize colors (oklab/color-mix fix)
          const sanitizeElementColors = (el: HTMLElement) => {
            const style = el.style;
            const props = ['backgroundColor', 'color', 'borderColor', 'outlineColor'] as const;
            
            props.forEach(prop => {
              if (style[prop] && (style[prop].includes('oklab') || style[prop].includes('color-mix'))) {
                style[prop] = prop === 'color' || prop === 'borderColor' ? '#000000' : '#ffffff';
              }
            });
          };

          allElements.forEach((el) => {
            sanitizeElementColors(el as HTMLElement);
          });

        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidthMm = 210; // A4 width in mm
      const pageHeightMm = 297; // A4 height in mm
      const pageHeightPx = Math.floor((canvas.width * pageHeightMm) / imgWidthMm);

      let sourceY = 0;
      while (sourceY < canvas.height) {
        const remainingPx = canvas.height - sourceY;
        if (remainingPx <= 8) break;
        const sliceHeightPx = Math.min(pageHeightPx, remainingPx);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) {
          throw new Error('Failed to create canvas context for PDF slicing');
        }

        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        const sliceImgData = pageCanvas.toDataURL('image/png');
        const sliceHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;
        pdf.addImage(sliceImgData, 'PNG', 0, 0, imgWidthMm, sliceHeightMm);

        sourceY += sliceHeightPx;
        if (sourceY < canvas.height) {
          pdf.addPage();
        }
      }
      
      pdf.save('biodata.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Biodata',
          text: 'Check out my biodata created with vivahprofile!',
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy link. Please copy the URL from the browser address bar.');
      } finally {
        setIsSharing(false);
      }
    }
  };

  const availableLanguages = useMemo(() => {
    const selectedCountry = countries.find(c => c.code === data.country);
    return selectedCountry ? selectedCountry.languages : [];
  }, [data.country]);

  // Set default language when country changes if current language is not available
  React.useEffect(() => {
    const selectedCountry = countries.find(c => c.code === data.country);
    if (selectedCountry) {
      const isLanguageAvailable = selectedCountry.languages.some(l => l.name === data.language);
      if (!isLanguageAvailable && selectedCountry.languages.length > 0) {
        setLanguage(selectedCountry.languages[0].name);
      }
    }
  }, [data.country, data.language, setLanguage]);

  return (
    <div className={clsx("flex flex-col lg:flex-row min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden font-sans", isDarkMode ? 'theme-dark bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900')}>
      <div className={clsx("lg:hidden sticky top-0 z-30 border-b px-3 py-2 flex gap-2 print:hidden", isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200')}>
        <button
          onClick={() => setMobilePanel('editor')}
          className={clsx(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            mobilePanel === 'editor'
              ? 'bg-indigo-600 text-white'
              : isDarkMode
                ? 'bg-slate-800 text-slate-200'
                : 'bg-gray-100 text-gray-700'
          )}
        >
          Editor
        </button>
        <button
          onClick={() => setMobilePanel('preview')}
          className={clsx(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            mobilePanel === 'preview'
              ? 'bg-indigo-600 text-white'
              : isDarkMode
                ? 'bg-slate-800 text-slate-200'
                : 'bg-gray-100 text-gray-700'
          )}
        >
          Preview
        </button>
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={clsx(
            'rounded-lg px-3 py-2 transition-colors',
            isDarkMode ? 'bg-slate-800 text-amber-300' : 'bg-gray-100 text-slate-700'
          )}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Sidebar - Input Form */}
      <div
        className={clsx(
          'w-full lg:w-96 flex-shrink-0 lg:h-full bg-white shadow-xl z-20 overflow-hidden flex-col print:hidden border-b lg:border-b-0 lg:border-r border-gray-200',
          isDarkMode
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200',
          mobilePanel === 'editor' ? 'flex' : 'hidden lg:flex'
        )}
      >
        <div className={clsx("p-4 border-b flex items-center justify-between text-white", isDarkMode ? 'bg-indigo-700 border-indigo-500' : 'bg-indigo-600 border-gray-200')}>
          <div className="flex items-center gap-2">
            <BrandLogo size={24} variant="light" />
            <h1 className="text-xl font-bold tracking-tight">vivahprofile</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Sidebar 
            data={data} 
            labels={labels}
            isDarkMode={isDarkMode}
            onUpdate={updateField} 
            onAddCustomField={addCustomField}
            onRemoveCustomField={removeCustomField}
            onUpdateCustomField={updateCustomField}
            onLoadSample={loadSampleData}
            onGeneratePartnerPreferences={handleGeneratePartnerPreferences}
            onUpdateCustomization={updateCustomization}
            onToggleVisibility={toggleSectionVisibility}
            onUpdateProfileImage={updateProfileImage}
            isGeneratingPartnerPreferences={isGeneratingPartnerPreferences}
          />
        </div>
      </div>

      {/* Main Content - Preview & Toolbar */}
      <div
        className={clsx(
          'flex-1 flex-col min-h-0 relative',
          mobilePanel === 'preview' ? 'flex' : 'hidden lg:flex'
        )}
      >
        
        {/* Toolbar */}
        <div className={clsx("border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 px-3 sm:px-4 lg:px-6 py-3 shadow-sm z-10 print:hidden", isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200')}>
          <div className="flex flex-wrap items-center gap-3">
            <div className={clsx("flex items-center gap-1 rounded-lg p-1", isDarkMode ? 'bg-slate-800' : 'bg-gray-100')}>
              <button
                onClick={() => setTemplate('classic')}
                className={clsx(
                  "px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                  data.templateId === 'classic'
                    ? isDarkMode
                      ? "bg-slate-700 text-indigo-300 shadow-sm"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                )}
              >
                Classic
              </button>
              <button
                onClick={() => setTemplate('modern')}
                className={clsx(
                  "px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                  data.templateId === 'modern'
                    ? isDarkMode
                      ? "bg-slate-700 text-indigo-300 shadow-sm"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                )}
              >
                Modern
              </button>
              <button
                onClick={() => setTemplate('creative')}
                className={clsx(
                  "px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                  data.templateId === 'creative'
                    ? isDarkMode
                      ? "bg-slate-700 text-indigo-300 shadow-sm"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                )}
              >
                Creative
              </button>
            </div>

            <div className={clsx("hidden sm:block h-6 w-px mx-1", isDarkMode ? 'bg-slate-700' : 'bg-gray-200')} />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                <select
                  value={data.country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={clsx("bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer max-w-[120px]", isDarkMode ? 'text-slate-200 hover:text-indigo-300' : 'text-gray-700 hover:text-indigo-600')}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <Loader2 size={16} className="text-indigo-600 animate-spin" />
                ) : (
                  <Globe size={16} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                )}
                <select
                  value={data.language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                  className={clsx(
                    "bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer max-w-[120px]",
                    isDarkMode ? "text-slate-200 hover:text-indigo-300" : "text-gray-700 hover:text-indigo-600",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleAiEnhance}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm border border-indigo-200"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isGenerating ? 'Enhancing...' : 'AI Enhance'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm border border-gray-200 shadow-sm"
            >
              <Share2 size={16} />
              Share
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isPrinting ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={clsx(
                'hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-xs sm:text-sm border',
                isDarkMode
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
              )}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={clsx("absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg border text-sm flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2", isDarkMode ? 'bg-red-950 text-red-200 border-red-900' : 'bg-red-50 text-red-600 border-red-100')}>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline ml-2">Retry</button>
          </div>
        )}

        {/* Preview Area */}
        <div className={clsx("flex-1 min-h-[65vh] lg:min-h-0 overflow-hidden relative print:overflow-visible print:bg-white print:absolute print:inset-0 print:z-50", isDarkMode ? 'bg-slate-950' : 'bg-slate-100')}>
          <div className="absolute inset-0 overflow-auto py-3 sm:py-6 lg:py-8 print:static print:overflow-visible print:p-0">
             <Preview ref={componentRef} data={data} templateId={data.templateId} labels={labels} />
          </div>
        </div>
      </div>
    </div>
  );
}
