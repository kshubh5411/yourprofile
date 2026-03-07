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

  return (
    <div className="customization-panel p-4 space-y-6">
      {/* Colors */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <Palette size={16} />
          <span>Theme Color</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdateCustomization('primaryColor', color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
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
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Fonts */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <Type size={16} />
          <span>Typography</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onUpdateCustomization('fontFamily', font.value)}
              className={`px-3 py-2 text-sm text-left rounded-lg border transition-colors ${
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

      {/* Section Visibility */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <Eye size={16} />
          <span>Visible Sections</span>
        </div>
        <div className="space-y-2">
          {Object.entries(data.customization.sectionVisibility).map(([key, isVisible]) => (
            <label key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-700">{sectionLabelMap[key] || key}</span>
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
