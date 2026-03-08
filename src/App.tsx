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
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!exportMenuRef.current) return;
      if (!exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handlePrint = async () => {
    if (!componentRef.current) return;
    setIsPrinting(true);
    try {
      const source = componentRef.current;
      await document.fonts.ready;

      const rect = source.getBoundingClientRect();
      const exportTemplate = source.querySelector('[data-export-template]') as HTMLElement | null;
      const isClassicTemplate = exportTemplate?.getAttribute('data-export-template') === 'classic';
      const desktopA4WidthPx = 794; // 210mm at 96dpi
      const captureWidth = isClassicTemplate
        ? desktopA4WidthPx
        : Math.max(1, Math.round(rect.width));
      const captureHeight = isClassicTemplate
        ? Math.max(source.scrollHeight, source.offsetHeight, 1123)
        : Math.max(1, Math.round(rect.height));
      const bleed = 6;
      const sandbox = document.createElement('div');
      sandbox.setAttribute('data-pdf-sandbox', 'true');
      sandbox.style.position = 'fixed';
      sandbox.style.left = '-100000px';
      sandbox.style.top = '0';
      sandbox.style.width = `${captureWidth + bleed * 2}px`;
      sandbox.style.height = `${captureHeight + bleed * 2}px`;
      sandbox.style.background = '#ffffff';
      sandbox.style.pointerEvents = 'none';
      sandbox.style.zIndex = '-1';
      sandbox.style.padding = `${bleed}px`;

      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.width = `${captureWidth}px`;
      clone.style.minHeight = `${captureHeight}px`;
      clone.style.height = 'auto';
      clone.style.margin = '0';
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.style.background = '#ffffff';
      sandbox.appendChild(clone);
      document.body.appendChild(sandbox);

      const sourceNodes = [source, ...Array.from(source.querySelectorAll('*'))] as HTMLElement[];
      const cloneNodes = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];
      const count = Math.min(sourceNodes.length, cloneNodes.length);
      for (let i = 0; i < count; i += 1) {
        const src = sourceNodes[i];
        const dst = cloneNodes[i];
        const computed = window.getComputedStyle(src);
        for (let p = 0; p < computed.length; p += 1) {
          const prop = computed[p];
          const val = computed.getPropertyValue(prop);
          if (!val) continue;
          if (/oklab|oklch|color-mix/i.test(val)) continue;
          dst.style.setProperty(prop, val);
        }
        dst.removeAttribute('class');
      }
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'top left';

      if (isClassicTemplate) {
        const personalLayouts = Array.from(
          clone.querySelectorAll('[data-export-personal-layout="true"]')
        ) as HTMLElement[];
        personalLayouts.forEach((layout) => {
          layout.style.display = 'grid';
          layout.style.gridTemplateColumns = '1fr auto';
          layout.style.columnGap = '1rem';
          layout.style.rowGap = '0.75rem';
          layout.style.alignItems = 'start';
        });

        const detailsGrids = Array.from(
          clone.querySelectorAll('[data-export-details-grid="true"]')
        ) as HTMLElement[];
        detailsGrids.forEach((grid) => {
          grid.style.display = 'grid';
          grid.style.gridTemplateColumns = 'minmax(150px,0.95fr) minmax(0,1.5fr)';
          grid.style.columnGap = '1rem';
          grid.style.rowGap = '0.5rem';
        });

        const profileWraps = Array.from(
          clone.querySelectorAll('[data-export-profile-image-wrap="true"]')
        ) as HTMLElement[];
        profileWraps.forEach((wrap) => {
          wrap.style.justifySelf = 'end';
          wrap.style.alignSelf = 'start';
        });
      }

      // PDF-only pill rendering: SVG guarantees exact centered text.
      const clonedPills = Array.from(clone.querySelectorAll('[data-pill-text]')) as HTMLElement[];
      clonedPills.forEach((pill) => {
        const text = (pill.getAttribute('data-pill-text') || pill.textContent || '').trim();
        if (!text) return;

        const rect = pill.getBoundingClientRect();
        const width = Math.max(220, Math.round(rect.width));
        const height = Math.max(36, Math.round(rect.height));
        const bg = window.getComputedStyle(pill).backgroundColor || '#92400e';
        const radius = Math.floor(height / 2);
        const measureCanvas = document.createElement('canvas');
        const measureCtx = measureCanvas.getContext('2d');
        let fontSize = Math.max(13, Math.min(18, Math.floor(height * 0.5)));
        if (measureCtx) {
          const family = 'Arial, Helvetica, sans-serif';
          const maxTextWidth = width - 36;
          measureCtx.font = `800 ${fontSize}px ${family}`;
          while (fontSize > 11 && measureCtx.measureText(text).width > maxTextWidth) {
            fontSize -= 1;
            measureCtx.font = `800 ${fontSize}px ${family}`;
          }
        }

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.display = 'block';

        const shape = document.createElementNS(svgNS, 'rect');
        shape.setAttribute('x', '0');
        shape.setAttribute('y', '0');
        shape.setAttribute('width', String(width));
        shape.setAttribute('height', String(height));
        shape.setAttribute('rx', String(radius));
        shape.setAttribute('fill', bg);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', '50%');
        label.setAttribute('y', '50%');
        label.setAttribute('dy', '0.08em');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#ffffff');
        label.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
        label.setAttribute('font-size', String(fontSize));
        label.setAttribute('font-weight', '800');
        label.textContent = text;

        svg.appendChild(shape);
        svg.appendChild(label);
        pill.replaceWith(svg);
      });

      const images = Array.from(clone.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          });
        })
      );

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const safeMarginMm = 6;
      const usableWidthMm = pageWidthMm - safeMarginMm * 2;
      const usableHeightMm = pageHeightMm - safeMarginMm * 2;
      const fullWidthMm = usableWidthMm;
      const fullHeightMm = (canvas.height * fullWidthMm) / canvas.width;
      const fitScale = Math.min(1, usableHeightMm / fullHeightMm);
      const renderWidthMm = fullWidthMm * fitScale;
      const renderHeightMm = fullHeightMm * fitScale;
      const offsetX = safeMarginMm + (usableWidthMm - renderWidthMm) / 2;
      const offsetY = safeMarginMm + (usableHeightMm - renderHeightMm) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidthMm, renderHeightMm);
      pdf.save('biodata.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      const sandbox = document.querySelector('[data-pdf-sandbox="true"]');
      if (sandbox?.parentElement) sandbox.parentElement.removeChild(sandbox);
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
          text: 'Check out my biodata created with YourProfile!',
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
  const selectedCountryName = useMemo(
    () => countries.find((c) => c.code === data.country)?.name || data.country,
    [data.country]
  );
  const countryFlag = useMemo(() => {
    if (data.country.length !== 2) return '🌐';
    return data.country
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
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
    <div className={clsx("flex flex-col lg:flex-row min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden", isDarkMode ? 'theme-dark bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900')}>
      <div className={clsx("lg:hidden sticky top-0 z-30 border-b px-3 py-2 flex gap-2 print:hidden", isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200')}>
        <button
          onClick={() => setMobilePanel('editor')}
          className={clsx(
            'flex-1 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors',
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
            'flex-1 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors',
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
        <div
          className={clsx(
            "p-4 border-b flex items-center justify-between text-white",
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 border-indigo-500'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 border-indigo-300'
          )}
        >
          <div className="flex items-center gap-2.5">
            <BrandLogo size={24} variant="light" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight leading-none">YourProfile</h1>
              <p className="text-[11px] text-white/85 mt-0.5 tracking-wide">Profiles Crafted Beautifully</p>
            </div>
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
          'flex-1 flex-col min-h-0 relative print:flex',
          mobilePanel === 'preview' ? 'flex' : 'hidden lg:flex'
        )}
      >
        
        {/* Toolbar */}
        <div
          className={clsx(
            "border-b px-3 sm:px-4 lg:px-6 py-3 z-10 print:hidden",
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className={clsx("rounded-xl border p-1 h-12 flex items-center", isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200')}>
                <div className="flex items-center gap-1 rounded-lg">
                  <button
                    onClick={() => setTemplate('classic')}
                    className={clsx(
                      "px-3 py-2 rounded-md text-sm font-semibold transition-all h-10",
                      data.templateId === 'classic'
                        ? isDarkMode
                          ? "bg-slate-700 text-indigo-300"
                          : "bg-white text-indigo-600 shadow-sm border border-indigo-100"
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
                      "px-3 py-2 rounded-md text-sm font-semibold transition-all h-10",
                      data.templateId === 'modern'
                        ? isDarkMode
                          ? "bg-slate-700 text-indigo-300"
                          : "bg-white text-indigo-600 shadow-sm border border-indigo-100"
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
                      "px-3 py-2 rounded-md text-sm font-semibold transition-all h-10",
                      data.templateId === 'creative'
                        ? isDarkMode
                          ? "bg-slate-700 text-indigo-300"
                          : "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                        : isDarkMode
                          ? "text-slate-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Creative
                  </button>
                </div>
              </div>

              <div className={clsx("rounded-xl border px-3 h-12 flex items-center", isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none" aria-hidden="true">{countryFlag}</span>
                  <MapPin size={15} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                  <select
                    value={data.country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={clsx(
                      "bg-transparent text-sm font-semibold focus:outline-none cursor-pointer min-w-[120px]",
                      isDarkMode ? 'text-slate-200 hover:text-indigo-300' : 'text-gray-700 hover:text-indigo-600'
                    )}
                    title={`Country: ${selectedCountryName}`}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className={clsx("flex items-center gap-2 px-3 h-12 rounded-xl border", isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-200')}>
                {isGenerating ? (
                  <Loader2 size={16} className="text-indigo-600 animate-spin" />
                ) : (
                  <Wand2 size={16} className={isDarkMode ? 'text-indigo-300' : 'text-indigo-700'} />
                )}
                <button
                  onClick={handleAiEnhance}
                  disabled={isGenerating}
                  className={clsx(
                    "font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed",
                    isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
                  )}
                >
                  {isGenerating ? 'Playing...' : 'Play with AI'}
                </button>
                <div className={clsx("h-5 w-px", isDarkMode ? 'bg-slate-600' : 'bg-indigo-200')} />
                <div className="flex items-center gap-1">
                  <Globe size={14} className={isDarkMode ? 'text-slate-400' : 'text-indigo-500'} />
                  <select
                    value={data.language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isGenerating}
                    className={clsx(
                      "bg-transparent text-sm font-semibold focus:outline-none cursor-pointer max-w-[120px]",
                      isDarkMode ? "text-slate-200 hover:text-indigo-300" : "text-indigo-700 hover:text-indigo-800",
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

              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setIsExportOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-4 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Download size={16} />
                  Export
                </button>
                {isExportOpen && (
                  <div className={clsx("absolute right-0 mt-2 w-44 rounded-lg border shadow-lg overflow-hidden z-30", isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200')}>
                    <button
                      onClick={() => {
                        setIsExportOpen(false);
                        handleShare();
                      }}
                      className={clsx("w-full px-3 py-2.5 text-left text-sm font-medium flex items-center gap-2", isDarkMode ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-gray-50 text-gray-700')}
                    >
                      <Share2 size={15} />
                      Share
                    </button>
                    <button
                      onClick={() => {
                        setIsExportOpen(false);
                        handlePrint();
                      }}
                      disabled={isPrinting}
                      className={clsx("w-full px-3 py-2.5 text-left text-sm font-medium flex items-center gap-2 disabled:opacity-50", isDarkMode ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-gray-50 text-gray-700')}
                    >
                      {isPrinting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                      {isPrinting ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={clsx(
                  'hidden lg:flex items-center gap-2 px-4 h-12 rounded-xl transition-colors font-semibold text-sm border',
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
             <Preview 
              ref={componentRef} 
              data={data} 
              templateId={data.templateId} 
              labels={labels}
              updateCustomization={updateCustomization} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
