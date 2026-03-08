import React from 'react';
import { Biodata, CustomizationOptions } from '../types';
import { TranslationLabels } from '../constants/translations';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';

interface PreviewProps {
  data: Biodata;
  templateId: string;
  labels: TranslationLabels;
  updateCustomization: (field: keyof CustomizationOptions, value: any) => void;
}

export const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(({ data, templateId, labels, updateCustomization }, ref) => {
  const renderTemplate = () => {
    const props = { data, labels, updateCustomization };
    switch (templateId) {
      case 'creative':
        return <CreativeTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'classic':
      default:
        return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div
      className="w-full h-full p-2 sm:p-4 lg:p-8 overflow-auto flex justify-center items-start print:p-0 print:bg-white print:block"
      style={{
        backgroundColor: '#f1f5f9',
        backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.22) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }}
    >
      <div 
        ref={ref}
        data-preview-container="true"
        className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] flex-shrink-0 origin-top transition-transform duration-300 print:shadow-none print:transform-none print:w-full print:min-h-0 print:m-0"
        style={{ pageBreakAfter: 'always' }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
