import React from 'react';
import { Biodata } from '../types';
import { TranslationLabels } from '../constants/translations';
import { Palette, Type, Eye } from 'lucide-react';

interface CustomizationPanelProps {
  data: Biodata;
  labels: TranslationLabels;
  onUpdateCustomization: (field: keyof Biodata['customization'], value: any) => void;
  onToggleVisibility: (section: keyof Biodata['customization']['sectionVisibility']) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  data,
  labels,
  onUpdateCustomization,
  onToggleVisibility,
}) => {
  const [showAllFrames, setShowAllFrames] = React.useState(false);
  const sectionLabelMap: Record<string, string> = {
    personal: labels.personalDetails,
    family: labels.familyBackground,
    education: labels.education,
    professional: labels.professional,
    partnerPreferences: labels.partnerPreferences || 'Partner Preferences',
  };

  const fontClassMap: Record<string, string> = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  const fonts = [
    { name: 'Serif (Classic)', value: 'serif' },
    { name: 'Sans (Modern)', value: 'sans' },
    { name: 'Mono (Technical)', value: 'mono' },
  ];

  const colors = [
    { name: 'Amber', value: '#92400e' },
    { name: 'Slate', value: '#0f172a' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Indigo', value: '#4338ca' },
    { name: 'Rose', value: '#be123c' },
    { name: 'Black', value: '#000000' },
  ];

  const classicFrames = [
    { value: 'royal', name: 'Royal' },
    { value: 'minimal', name: 'Minimal' },
    { value: 'floral', name: 'Floral' },
    { value: 'mandala', name: 'Mandala' },
    { value: 'premium-gold', name: 'Premium Gold' },
    { value: 'temple-classic', name: 'Temple Classic' },
    { value: 'modern-luxe', name: 'Modern Luxe' },
    { value: 'royal-maroon', name: 'Royal Maroon' },
    { value: 'ivory-floral', name: 'Ivory Floral' },
    { value: 'navy-heritage', name: 'Navy Heritage' },
    { value: 'pastel-wedding', name: 'Pastel Wedding' },
    { value: 'traditional-scroll', name: 'Traditional Scroll' },
    { value: 'emerald-regal', name: 'Emerald Regal' },
    { value: 'mono-executive', name: 'Mono Executive' },
    { value: 'saffron-sacred', name: 'Saffron Sacred' },
    { value: 'ruby-classic', name: 'Ruby Classic' },
    { value: 'pearl-elegance', name: 'Pearl Elegance' },
    { value: 'charcoal-modern', name: 'Charcoal Modern' },
    { value: 'lotus-heritage', name: 'Lotus Heritage' },
  ];
  const framePreviewStyles: Record<string, { outer: string; inner: string; base: string; watermark?: string; pill: string }> = {
    royal: {
      outer: 'border-[3px] border-amber-700',
      inner: 'border border-amber-700/70',
      base: 'bg-[#f8f8f6]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(146,64,14,0.12) 0 35%, transparent 35% 100%)',
      pill: 'bg-amber-700 text-white',
    },
    minimal: {
      outer: 'border border-gray-400',
      inner: 'border border-gray-300',
      base: 'bg-white',
      pill: 'bg-gray-700 text-white',
    },
    floral: {
      outer: 'border-[3px] border-orange-700',
      inner: 'border border-orange-600/70',
      base: 'bg-[#fffdfa]',
      watermark: 'radial-gradient(circle at 78% 28%, rgba(194,65,12,0.12) 0 30%, transparent 30% 100%)',
      pill: 'bg-orange-700 text-white',
    },
    mandala: {
      outer: 'border-[3px] border-yellow-800',
      inner: 'border border-yellow-800/70',
      base: 'bg-[#fbfbfb]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(133,77,14,0.12) 0 33%, transparent 33% 100%)',
      pill: 'bg-yellow-800 text-white',
    },
    'premium-gold': {
      outer: 'border-[3px] border-yellow-700',
      inner: 'border border-yellow-700/70',
      base: 'bg-[#fdf9ef]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(161,98,7,0.14) 0 30%, transparent 30% 100%)',
      pill: 'bg-yellow-700 text-white',
    },
    'temple-classic': {
      outer: 'border-[3px] border-amber-800',
      inner: 'border border-amber-700/70',
      base: 'bg-[#fcf8ef]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(120,53,15,0.13) 0 31%, transparent 31% 100%)',
      pill: 'bg-amber-800 text-white',
    },
    'modern-luxe': {
      outer: 'border-[2px] border-slate-600',
      inner: 'border border-slate-400',
      base: 'bg-white',
      pill: 'bg-slate-700 text-white',
    },
    'royal-maroon': {
      outer: 'border-[3px] border-rose-900',
      inner: 'border border-rose-800/70',
      base: 'bg-[#fff8f8]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(136,19,55,0.12) 0 30%, transparent 30% 100%)',
      pill: 'bg-rose-900 text-white',
    },
    'ivory-floral': {
      outer: 'border-[3px] border-amber-600',
      inner: 'border border-amber-500/70',
      base: 'bg-[#fffdf6]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(217,119,6,0.1) 0 28%, transparent 28% 100%)',
      pill: 'bg-amber-600 text-white',
    },
    'navy-heritage': {
      outer: 'border-[3px] border-blue-900',
      inner: 'border border-blue-800/70',
      base: 'bg-[#f7faff]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(30,58,138,0.12) 0 31%, transparent 31% 100%)',
      pill: 'bg-blue-900 text-white',
    },
    'pastel-wedding': {
      outer: 'border-[3px] border-pink-500',
      inner: 'border border-rose-400/70',
      base: 'bg-[#fff7fb]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(244,114,182,0.12) 0 30%, transparent 30% 100%)',
      pill: 'bg-pink-500 text-white',
    },
    'traditional-scroll': {
      outer: 'border-[3px] border-orange-900',
      inner: 'border border-orange-700/70',
      base: 'bg-[#fffaf0]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(154,52,18,0.12) 0 31%, transparent 31% 100%)',
      pill: 'bg-orange-900 text-white',
    },
    'emerald-regal': {
      outer: 'border-[3px] border-emerald-800',
      inner: 'border border-emerald-700/70',
      base: 'bg-[#f7fffb]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(6,95,70,0.12) 0 31%, transparent 31% 100%)',
      pill: 'bg-emerald-800 text-white',
    },
    'mono-executive': {
      outer: 'border-[3px] border-zinc-800',
      inner: 'border border-zinc-700/70',
      base: 'bg-[#fcfcfc]',
      pill: 'bg-zinc-800 text-white',
    },
    'saffron-sacred': {
      outer: 'border-[3px] border-orange-700',
      inner: 'border border-orange-600/70',
      base: 'bg-[#fff9f2]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(194,65,12,0.12) 0 31%, transparent 31% 100%)',
      pill: 'bg-orange-700 text-white',
    },
    'ruby-classic': {
      outer: 'border-[3px] border-red-800',
      inner: 'border border-red-700/70',
      base: 'bg-[#fff9f9]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(153,27,27,0.12) 0 31%, transparent 31% 100%)',
      pill: 'bg-red-800 text-white',
    },
    'pearl-elegance': {
      outer: 'border-[3px] border-stone-400',
      inner: 'border border-stone-300/80',
      base: 'bg-[#fffefc]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(120,113,108,0.10) 0 30%, transparent 30% 100%)',
      pill: 'bg-stone-500 text-white',
    },
    'charcoal-modern': {
      outer: 'border-[3px] border-slate-800',
      inner: 'border border-slate-600/70',
      base: 'bg-[#f8fafc]',
      pill: 'bg-slate-800 text-white',
    },
    'lotus-heritage': {
      outer: 'border-[3px] border-fuchsia-800',
      inner: 'border border-fuchsia-700/70',
      base: 'bg-[#fff8ff]',
      watermark: 'radial-gradient(circle at 80% 25%, rgba(162,28,175,0.12) 0 30%, transparent 30% 100%)',
      pill: 'bg-fuchsia-800 text-white',
    },
  };

  return (
    <div className="customization-panel p-4 space-y-6">
      {/* Colors */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-gray-700">
          <Palette size={16} />
          <span>Theme Color</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdateCustomization('primaryColor', color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                data.customization.primaryColor === color.value
                  ? 'border-gray-900 ring-2 ring-gray-200'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={data.customization.primaryColor}
            onChange={(e) => onUpdateCustomization('primaryColor', e.target.value)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-0 p-0"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Fonts */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-gray-700">
          <Type size={16} />
          <span>Typography</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onUpdateCustomization('fontFamily', font.value)}
              className={`px-3 py-2.5 text-[14px] text-left rounded-lg border transition-colors ${
                data.customization.fontFamily === font.value
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className={fontClassMap[font.value] || 'font-serif'}>{font.name}</span>
            </button>
          ))}
        </div>
      </div>

      {data.templateId === 'classic' && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-gray-700">
            <Type size={16} />
            <span>Frame Style</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(showAllFrames ? classicFrames : classicFrames.slice(0, 4)).map((frame) => (
              <button
                key={frame.value}
                onClick={() => onUpdateCustomization('classicFrameStyle', frame.value)}
                className={`text-left rounded-xl border p-2 transition-all ${
                  (data.customization.classicFrameStyle || 'royal') === frame.value
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div
                  className={`relative h-20 rounded-md overflow-hidden p-1.5 ${framePreviewStyles[frame.value].base} ${framePreviewStyles[frame.value].outer}`}
                >
                  <div className={`h-full w-full rounded-sm ${framePreviewStyles[frame.value].inner}`} />
                  {framePreviewStyles[frame.value].watermark && (
                    <div
                      className="absolute inset-0"
                      style={{ background: framePreviewStyles[frame.value].watermark }}
                    />
                  )}
                  <div className="absolute left-3 top-3 text-[9px] font-bold text-gray-700">HEADER</div>
                  <div className={`absolute left-3 top-8 text-[9px] px-2 py-0.5 rounded-full ${framePreviewStyles[frame.value].pill}`}>
                    SECTION
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{frame.name}</span>
                  {(data.customization.classicFrameStyle || 'royal') === frame.value && (
                    <span className="text-[10px] font-semibold text-indigo-700">Active</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          {classicFrames.length > 4 && (
            <button
              onClick={() => setShowAllFrames((prev) => !prev)}
              className="mt-2 text-[13px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {showAllFrames ? 'Show less' : 'See more'}
            </button>
          )}
        </div>
      )}

      {/* Section Visibility */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-gray-700">
          <Eye size={16} />
          <span>Visible Sections</span>
        </div>
        <div className="space-y-2">
          {Object.entries(data.customization.sectionVisibility).map(([key, isVisible]) => (
            <label key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <span className="text-[15px] text-gray-700">{sectionLabelMap[key] || key}</span>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => onToggleVisibility(key as any)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
