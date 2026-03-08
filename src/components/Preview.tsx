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
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState(1);
  const pageWidthPx = 794;
  const pageHeightPx = 1123;

  React.useEffect(() => {
    const node = shellRef.current;
    if (!node) return;

    const updateScale = () => {
      const availableWidth = node.clientWidth - 16;
      if (availableWidth <= 0) {
        setPreviewScale(1);
        return;
      }
      const next = Math.min(1, availableWidth / pageWidthPx);
      setPreviewScale(next);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

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
      ref={shellRef}
      className="w-full h-full p-2 sm:p-4 lg:p-8 overflow-auto flex justify-center items-start print:p-0 print:bg-white print:block"
      style={{
        backgroundColor: '#f1f5f9',
        backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.22) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: `${pageWidthPx * previewScale}px`,
          minHeight: `${pageHeightPx * previewScale}px`,
        }}
      >
        <div 
          ref={ref}
          data-preview-container="true"
          className="bg-white shadow-2xl origin-top-left transition-transform duration-300 print:shadow-none print:transform-none print:w-full print:min-h-0 print:m-0"
          style={{
            width: `${pageWidthPx}px`,
            minHeight: `${pageHeightPx}px`,
            pageBreakAfter: 'always',
            transform: `scale(${previewScale})`,
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
