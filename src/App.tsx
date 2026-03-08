import React, { useRef, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';
import { BrandLogo } from './components/BrandLogo';
import { useBioData } from './hooks/useBioData';
import { Wand2, Globe, Download, Loader2, MapPin, Share2, Moon, Sun, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { countries } from './constants/languages';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createShareLink, getSharedBiodata } from './services/share';

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
    replaceData,
    updateCustomization,
    toggleSectionVisibility,
    updateProfileImage,
    isGenerating,
    isGeneratingPartnerPreferences,
    error
  } = useBioData();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedLoadError, setSharedLoadError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [clientIdentifier] = useState(() => {
    const key = 'yp_visitor_id';
    try {
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const created = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
        .replace(/[^a-zA-Z0-9-]/g, '')
        .slice(0, 32);
      localStorage.setItem(key, created);
      return created;
    } catch {
      return 'anonymous';
    }
  });
  const sharedPathMatch = window.location.pathname.match(/^\/shared\/([^/]+)\/?$/);
  const sharedId = sharedPathMatch?.[1] || null;
  const isSharedView = window.location.pathname.startsWith('/shared/');
  const isEditorRoute = isSharedView || window.location.pathname.startsWith('/editor');
  const readOnlyUpdateCustomization = React.useCallback(() => undefined, []);

  React.useEffect(() => {
    const origin = window.location.origin || 'https://yourprofile-production.up.railway.app';
    const path = window.location.pathname || '/';
    const absoluteUrl = `${origin}${path}`;

    const seoByRoute = isSharedView
      ? {
        title: 'Shared Biodata - View Profile | YourProfile',
        description: 'View a shared matrimonial biodata profile on YourProfile.',
        robots: 'noindex,nofollow',
        keywords: 'shared biodata, matrimonial profile',
      }
      : !isEditorRoute
        ? {
          title: 'YourProfile - Matrimonial Biodata Maker & PDF Generator',
          description:
            'Create matrimonial biodata in minutes with YourProfile. AI-powered editing, multilingual support, beautiful templates, and instant PDF download.',
          robots: 'index,follow',
          keywords:
            'matrimonial biodata maker, biodata for marriage, marriage biodata pdf, biodata format, biodata generator',
        }
        : {
          title: 'Biodata Editor - Create Matrimonial Biodata PDF | YourProfile',
          description:
            'Use the YourProfile editor to build and customize your matrimonial biodata, then export as high-quality PDF.',
          robots: 'index,follow',
          keywords:
            'biodata editor, biodata pdf maker, matrimonial biodata editor, marriage biodata creator',
        };

    document.title = seoByRoute.title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let node = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', seoByRoute.description);
    setMeta('meta[name="keywords"]', 'name', 'keywords', seoByRoute.keywords);
    setMeta('meta[name="robots"]', 'name', 'robots', seoByRoute.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', seoByRoute.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seoByRoute.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', absoluteUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seoByRoute.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seoByRoute.description);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', absoluteUrl);

    const schema = !isEditorRoute
      ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'YourProfile',
        url: origin,
        description: 'AI-powered matrimonial biodata studio with instant PDF export.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/editor`,
          'query-input': 'required name=search_term_string',
        },
      }
      : {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'YourProfile Biodata Editor',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: absoluteUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      };

    let schemaScript = document.head.querySelector('#seo-json-ld') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-json-ld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schema);
  }, [isEditorRoute, isSharedView]);

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

  React.useEffect(() => {
    if (!isSharedView) return;
    if (!sharedId || !/^[a-zA-Z0-9-]{8,64}$/.test(sharedId)) {
      setSharedLoadError('Invalid shared link.');
      return;
    }

    let cancelled = false;
    setIsLoadingShared(true);
    setSharedLoadError(null);

    getSharedBiodata(sharedId)
      .then((payload) => {
        if (cancelled) return;
        replaceData(payload.data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load shared biodata:', err);
        setSharedLoadError('Failed to load shared biodata. Please check the link.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingShared(false);
      });

    return () => {
      cancelled = true;
    };
  }, [replaceData, sharedId]);

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

    try {
      const landingRef = new URLSearchParams(window.location.search).get('ref') || undefined;
      const { shareUrl } = await createShareLink(data, { ownerId: clientIdentifier, landingRef });
      const trackedShareUrl = (() => {
        try {
          const url = new URL(shareUrl, window.location.origin);
          url.searchParams.set('ref', clientIdentifier);
          return url.toString();
        } catch {
          return `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}ref=${encodeURIComponent(clientIdentifier)}`;
        }
      })();
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Biodata',
            text: 'Check out my biodata created with YourProfile!',
            url: trackedShareUrl,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        await navigator.clipboard.writeText(trackedShareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
      alert('Failed to create share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const landingRef = new URLSearchParams(window.location.search).get('ref') || undefined;
      const { shareUrl } = await createShareLink(data, { ownerId: clientIdentifier, landingRef });
      const trackedShareUrl = (() => {
        try {
          const url = new URL(shareUrl, window.location.origin);
          url.searchParams.set('ref', clientIdentifier);
          return url.toString();
        } catch {
          return `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}ref=${encodeURIComponent(clientIdentifier)}`;
        }
      })();
      await navigator.clipboard.writeText(trackedShareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy share link:', err);
      alert('Failed to copy share link. Please try again.');
    } finally {
      setIsSharing(false);
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

  const sampleLoadedRef = useRef(false);
  React.useEffect(() => {
    if (!window.location.pathname.startsWith('/editor')) return;
    if (sampleLoadedRef.current) return;
    const sample = new URLSearchParams(window.location.search).get('sample');
    if (sample === 'classic' || sample === 'modern' || sample === 'creative') {
      setTemplate(sample);
      loadSampleData(sample);
      sampleLoadedRef.current = true;
    }
  }, [loadSampleData, setTemplate]);

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

  const showTopError = sharedLoadError || error;
  const madeByFooter = (
    <div
      className={clsx(
        "fixed bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2 py-1 rounded-md print:hidden z-40 pointer-events-none",
        isDarkMode ? "text-slate-300 bg-slate-900/80" : "text-slate-600 bg-white/90 border border-slate-200"
      )}
    >
      Made by Shubham with love ❤️
    </div>
  );

  if (isLoadingShared) {
    return (
      <div className={clsx("min-h-screen flex items-center justify-center", isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900')}>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Loader2 size={18} className="animate-spin" />
          Loading shared biodata...
        </div>
      </div>
    );
  }

  if (sharedLoadError) {
    return (
      <div className={clsx("min-h-screen flex items-center justify-center px-4", isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900')}>
        <div className={clsx("max-w-lg rounded-xl border p-4 text-sm", isDarkMode ? 'border-red-900 bg-red-950/40 text-red-200' : 'border-red-200 bg-red-50 text-red-700')}>
          {sharedLoadError}
        </div>
      </div>
    );
  }

  if (!isEditorRoute) {
    return (
      <div className={clsx("min-h-screen", isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <header className={clsx("sticky top-0 z-20 border-b backdrop-blur", isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200')}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo size={22} variant={isDarkMode ? 'light' : 'dark'} />
              <span className="text-xl font-extrabold tracking-tight">YourProfile</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/editor" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                Start Free
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </header>

        <main>
          <section className={clsx("relative overflow-hidden border-b", isDarkMode ? 'border-slate-800' : 'border-slate-200')}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: isDarkMode ? 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.20), transparent 45%), radial-gradient(circle at 85% 15%, rgba(16,185,129,0.14), transparent 40%)' : 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.12), transparent 45%), radial-gradient(circle at 85% 15%, rgba(16,185,129,0.10), transparent 40%)' }} />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
              <div className="max-w-3xl">
                <div className={clsx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-4", isDarkMode ? 'border-slate-700 text-indigo-300 bg-slate-900/80' : 'border-indigo-200 text-indigo-700 bg-indigo-50')}>
                  <Sparkles size={14} />
                  AI-powered Matrimonial Biodata Studio
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                  Create Stunning Biodata in Minutes
                </h1>
                <p className={clsx("mt-4 text-base sm:text-lg max-w-2xl", isDarkMode ? 'text-slate-300' : 'text-slate-600')}>
                  Design professional profiles with beautiful templates, multilingual support, AI enhancement, and one-click PDF export.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="/editor" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                    Start Free
                    <ArrowRight size={14} />
                  </a>
                  <a href="#templates" className={clsx("inline-flex items-center gap-2 h-11 px-5 rounded-lg text-sm font-semibold border", isDarkMode ? 'border-slate-700 hover:bg-slate-900 text-slate-200' : 'border-slate-300 hover:bg-slate-50 text-slate-700')}>
                    View Samples
                  </a>
                </div>
                <div className={clsx("mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm", isDarkMode ? 'text-slate-300' : 'text-slate-700')}>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Instant PDF Download</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 10+ Indian Languages</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> View-only Share Links</div>
                </div>
              </div>
            </div>
          </section>

          <section id="templates" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Popular Templates</h2>
              <a href="/editor" className={clsx("text-sm font-semibold", isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-700 hover:text-indigo-600')}>Customize Now</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'classic', name: 'Classic Royal', accent: '#92400e' },
                { key: 'modern', name: 'Modern Clean', accent: '#0f172a' },
                { key: 'creative', name: 'Creative Premium', accent: '#10b981' },
              ].map((sample, idx) => (
                <div key={sample.key} className={clsx("rounded-2xl border p-4", isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white')}>
                  <div className={clsx("h-44 rounded-xl border mb-3 p-3 relative overflow-hidden", isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50')}>
                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 82% 18%, ${sample.accent}, transparent 45%)` }} />
                    <div className={clsx("relative z-10 h-full rounded-md p-2 border", isDarkMode ? 'border-slate-600/80 bg-slate-900/70' : 'border-slate-300 bg-white/90')}>
                      <div className="h-2.5 w-24 rounded-full mb-1" style={{ backgroundColor: sample.accent }} />
                      <div className="h-px w-full mb-2" style={{ backgroundColor: sample.accent }} />
                      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[8px] leading-none">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Name:</span>
                        <span className={isDarkMode ? 'text-slate-100' : 'text-slate-800'}>Aarav Sharma</span>
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>DOB:</span>
                        <span className={isDarkMode ? 'text-slate-100' : 'text-slate-800'}>15/08/1995</span>
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>City:</span>
                        <span className={isDarkMode ? 'text-slate-100' : 'text-slate-800'}>New Delhi</span>
                      </div>
                      <div className="mt-2 h-2 w-16 rounded-full" style={{ backgroundColor: sample.accent }} />
                      <div className="mt-1.5 space-y-1">
                        <div className={clsx("h-1.5 rounded w-5/6", isDarkMode ? 'bg-slate-600' : 'bg-slate-300')} />
                        <div className={clsx("h-1.5 rounded w-3/4", isDarkMode ? 'bg-slate-600' : 'bg-slate-300')} />
                        <div className={clsx("h-1.5 rounded w-2/3", isDarkMode ? 'bg-slate-600' : 'bg-slate-300')} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{sample.name}</p>
                    <a
                      href={`/editor?sample=${sample.key}`}
                      className={clsx("text-xs px-2.5 py-1 rounded-full font-semibold", isDarkMode ? 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200')}
                    >
                      View Sample
                    </a>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className={clsx("text-xs", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Ready-made layout</p>
                    <span className={clsx("text-xs px-2 py-1 rounded-full", idx === 0 ? 'bg-emerald-100 text-emerald-700' : isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700')}>
                      {idx === 0 ? 'Most Used' : 'Pro'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={clsx("border-y", isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50')}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
              <h3 className="text-2xl font-extrabold tracking-tight mb-6">Why Users Choose YourProfile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[
                  ['AI Content Enhance', 'Improve biodata language instantly'],
                  ['Language Translation', 'Generate biodata in regional language'],
                  ['Smart Design Controls', 'Frame, typography, icon and color control'],
                  ['Secure Sharing', 'Send view-only link to family and prospects'],
                ].map(([title, desc]) => (
                  <div key={title} className={clsx("rounded-xl border p-4", isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white')}>
                    <p className="font-semibold mb-1">{title}</p>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <div className={clsx("rounded-2xl border p-6 sm:p-8 text-center", isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')}>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Launch Your Biodata Today</h3>
              <p className={clsx("mt-2 text-sm sm:text-base", isDarkMode ? 'text-slate-300' : 'text-slate-600')}>
                Free to start. No design skills needed.
              </p>
              <a href="/editor" className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                Open Editor
                <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </main>
        {madeByFooter}
      </div>
    );
  }

  if (isSharedView) {
    return (
      <div className={clsx("flex flex-col min-h-screen lg:h-screen overflow-x-hidden", isDarkMode ? 'theme-dark bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900')}>
        <div className={clsx("border-b px-3 sm:px-4 lg:px-6 py-3 z-10", isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <a href="/" className="flex items-center gap-2.5" aria-label="Go to home">
                <BrandLogo size={22} variant={isDarkMode ? 'light' : 'dark'} />
                <div className="text-sm font-semibold">YourProfile</div>
              </a>
              <span className={clsx("text-xs px-2 py-1 rounded-full border", isDarkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-600')}>
                View only
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={clsx("px-3 h-10 rounded-lg text-sm font-semibold border", isDarkMode ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50')}
              >
                Copy Link
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-3 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold disabled:opacity-60"
              >
                {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {isPrinting ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={clsx("px-3 h-10 rounded-lg text-sm font-semibold border", isDarkMode ? 'border-slate-700 text-amber-300 hover:bg-slate-800' : 'border-gray-200 text-slate-700 hover:bg-gray-50')}
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>

        <div className={clsx("flex-1 min-h-[65vh] lg:min-h-0 overflow-hidden relative", isDarkMode ? 'bg-slate-950' : 'bg-slate-100')}>
          <div className="absolute inset-0 overflow-auto p-0">
            <div className="pointer-events-none select-none">
              <Preview
                ref={componentRef}
                data={data}
                templateId={data.templateId}
                labels={labels}
                updateCustomization={readOnlyUpdateCustomization}
              />
            </div>
          </div>
        </div>
        {madeByFooter}
      </div>
    );
  }

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
          'group/sidebar relative w-full flex-shrink-0 lg:h-full bg-white shadow-xl z-20 overflow-hidden lg:overflow-visible flex-col print:hidden border-b lg:border-b-0 lg:border-r border-gray-200 transition-all duration-300',
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-96',
          isDarkMode
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200',
          mobilePanel === 'editor' ? 'flex' : 'hidden lg:flex'
        )}
      >
        <div
          className={clsx(
            "border-b flex items-center text-white",
            isSidebarCollapsed ? 'justify-center' : 'justify-between',
            isSidebarCollapsed ? 'px-3 py-3' : 'p-4',
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 border-indigo-500'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 border-indigo-300'
          )}
        >
          <a href="/" className="flex items-center gap-2.5" aria-label="Go to home">
            <BrandLogo size={24} variant="light" />
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight leading-none">YourProfile</h1>
                <p className="text-[11px] text-white/85 mt-0.5 tracking-wide">Profiles Crafted Beautifully</p>
              </div>
            )}
          </a>
        </div>
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className={clsx(
            "sidebar-edge-handle hidden lg:inline-flex items-center justify-center absolute top-1/2 -right-4 -translate-y-1/2 z-30 h-11 w-8 rounded-full border shadow-md transition-all",
            isDarkMode
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            isSidebarCollapsed
              ? "opacity-100"
              : "opacity-0 group-hover/sidebar:opacity-100"
          )}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={clsx("flex-1 overflow-y-auto", isSidebarCollapsed && "hidden lg:block")}>
          {!isSidebarCollapsed ? (
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
          ) : (
            <div className={clsx("hidden lg:flex h-full flex-col items-center pt-4 gap-3", isDarkMode ? 'text-slate-300' : 'text-gray-500')}>
              <div className={clsx("h-9 w-9 rounded-xl border flex items-center justify-center", isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50')}>
                <Wand2 size={16} />
              </div>
              <div className={clsx("h-9 w-9 rounded-xl border flex items-center justify-center", isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50')}>
                <Download size={16} />
              </div>
            </div>
          )}
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
                        handleCopyLink();
                      }}
                      className={clsx("w-full px-3 py-2.5 text-left text-sm font-medium flex items-center gap-2", isDarkMode ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-gray-50 text-gray-700')}
                    >
                      <Download size={15} />
                      Copy Link
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
        {showTopError && (
          <div className={clsx("absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg border text-sm flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2", isDarkMode ? 'bg-red-950 text-red-200 border-red-900' : 'bg-red-50 text-red-600 border-red-100')}>
            <span>{showTopError}</span>
            <button onClick={() => window.location.reload()} className="underline ml-2">Retry</button>
          </div>
        )}

        {/* Preview Area */}
        <div className={clsx("flex-1 min-h-[65vh] lg:min-h-0 overflow-hidden relative print:overflow-visible print:bg-white print:absolute print:inset-0 print:z-50", isDarkMode ? 'bg-slate-950' : 'bg-slate-100')}>
          <div className="absolute inset-0 overflow-auto p-0 print:static print:overflow-visible print:p-0">
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
      {madeByFooter}
    </div>
  );
}
