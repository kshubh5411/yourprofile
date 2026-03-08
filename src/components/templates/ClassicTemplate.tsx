import React, { useRef } from 'react';
import { Biodata, CustomizationOptions } from '../../types';
import { TranslationLabels } from '../../constants/translations';
import clsx from 'clsx';
import Draggable from 'react-draggable';
import { getGodLogoAsset } from '../../constants/godLogos';

interface TemplateProps {
  data: Biodata;
  labels: TranslationLabels;
  className?: string;
  updateCustomization: (field: keyof CustomizationOptions, value: any) => void;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, labels, className, updateCustomization }) => {
  const { personal, family, education, professional, partnerPreferences, customization } = data;
  const {
    primaryColor,
    fontFamily,
    sectionVisibility,
    classicVariant = 'centered',
    classicFrameStyle = 'royal',
    classicHeaderText = 'ॐ श्री गणेशाय नमः',
    classicHeaderIcon = 'ganesha-4',
    classicHeaderPosition,
    classicPersonalPhotoShape = 'rectangle',
  } = customization;
  const fontClass = fontFamily === 'mono' ? 'font-doc-mono' : fontFamily === 'sans' ? 'font-doc-sans' : 'font-doc-serif';
  const headerNodeRef = useRef<HTMLDivElement>(null);

  const topHeaderIcon = getGodLogoAsset(classicHeaderIcon || 'ganesha-4');
  const defaultHeaderPosition =
    classicVariant === 'photo-left' ? { x: 250, y: 2 } : { x: 300, y: 2 };
  const makeWatermark = (borderPx: number, color: string, pattern = 'rings') => (
    <div
      className="pointer-events-none absolute right-[-95px] top-20 h-[390px] w-[390px] rounded-full opacity-10"
      style={{
        border: `${borderPx}px solid ${color}`,
        background:
          pattern === 'petal'
            ? 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0 4px, transparent 4px 100%), repeating-conic-gradient(from 0deg, rgba(0,0,0,0.12) 0 12deg, transparent 12deg 24deg)'
            : 'repeating-radial-gradient(circle at center, transparent 0 12px, rgba(0,0,0,0.13) 12px 17px)',
      }}
    />
  );

  const framePresets = {
    royal: {
      outerClass: 'border-[5px]',
      innerClass: 'border-2',
      backgroundClass: 'bg-[#f8f8f6]',
      sectionPill: true,
      watermark: makeWatermark(18, primaryColor, 'rings'),
    },
    minimal: {
      outerClass: 'border',
      innerClass: '',
      backgroundClass: 'bg-white',
      sectionPill: false,
      watermark: null,
    },
    floral: {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fffdfa]',
      sectionPill: true,
      watermark: makeWatermark(12, '#b45309', 'petal'),
    },
    mandala: {
      outerClass: 'border-[4px]',
      innerClass: 'border-2',
      backgroundClass: 'bg-[#fbfbfb]',
      sectionPill: true,
      watermark: makeWatermark(14, '#854d0e', 'rings'),
    },
    'premium-gold': {
      outerClass: 'border-[5px]',
      innerClass: 'border-2',
      backgroundClass: 'bg-[#fdf9ef]',
      sectionPill: true,
      watermark: makeWatermark(16, '#a16207', 'rings'),
    },
    'temple-classic': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fcf8ef]',
      sectionPill: true,
      watermark: makeWatermark(14, '#92400e', 'petal'),
    },
    'modern-luxe': {
      outerClass: 'border-[2px]',
      innerClass: 'border',
      backgroundClass: 'bg-white',
      sectionPill: false,
      watermark: null,
    },
    'royal-maroon': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fff8f8]',
      sectionPill: true,
      watermark: makeWatermark(14, '#881337', 'rings'),
    },
    'ivory-floral': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fffdf6]',
      sectionPill: true,
      watermark: makeWatermark(12, '#d97706', 'petal'),
    },
    'navy-heritage': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#f7faff]',
      sectionPill: true,
      watermark: makeWatermark(14, '#1e3a8a', 'rings'),
    },
    'pastel-wedding': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fff7fb]',
      sectionPill: true,
      watermark: makeWatermark(12, '#ec4899', 'petal'),
    },
    'traditional-scroll': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fffaf0]',
      sectionPill: true,
      watermark: makeWatermark(14, '#9a3412', 'rings'),
    },
    'emerald-regal': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#f7fffb]',
      sectionPill: true,
      watermark: makeWatermark(14, '#065f46', 'rings'),
    },
    'mono-executive': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fcfcfc]',
      sectionPill: false,
      watermark: null,
    },
    'saffron-sacred': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fff9f2]',
      sectionPill: true,
      watermark: makeWatermark(14, '#c2410c', 'petal'),
    },
    'ruby-classic': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fff9f9]',
      sectionPill: true,
      watermark: makeWatermark(14, '#991b1b', 'rings'),
    },
    'pearl-elegance': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fffefc]',
      sectionPill: false,
      watermark: makeWatermark(12, '#78716c', 'rings'),
    },
    'charcoal-modern': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#f8fafc]',
      sectionPill: false,
      watermark: null,
    },
    'lotus-heritage': {
      outerClass: 'border-[4px]',
      innerClass: 'border',
      backgroundClass: 'bg-[#fff8ff]',
      sectionPill: true,
      watermark: makeWatermark(14, '#a21caf', 'petal'),
    },
  };
  const framePreset = framePresets[classicFrameStyle] ?? framePresets.royal;

  const renderSectionTitle = (title: string) => {
    if (!framePreset.sectionPill) {
      return (
        <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>
          {title}
        </h3>
      );
    }

    const safeWords = title
      .toUpperCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return (
      <div className="mb-4 flex justify-start">
        <div
          className="pdf-safe-pill inline-flex items-center gap-2 px-6 py-1.5 rounded-full text-xl font-extrabold text-white leading-none whitespace-nowrap"
          style={{
            backgroundColor: primaryColor,
            fontFamily: 'Arial, Helvetica, sans-serif',
            letterSpacing: '0',
            textTransform: 'none',
          }}
        >
          {safeWords.map((word, index) => (
            <span key={`${word}-${index}`} className="pdf-safe-pill-word" style={{ lineHeight: 1 }}>
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'relative w-full h-full p-8 text-gray-900 overflow-hidden',
        fontClass,
        className,
        framePreset.backgroundClass,
        framePreset.outerClass
      )}
      style={{ borderColor: primaryColor }}
    >
      {framePreset.innerClass && (
        <div
          className={clsx('pointer-events-none absolute inset-2', framePreset.innerClass)}
          style={{ borderColor: primaryColor }}
        />
      )}
      {framePreset.watermark}
      <div className="classic-header-shell relative z-10 mb-6 border-b-2 pb-3 min-h-[108px]" style={{ borderColor: primaryColor }}>
        <Draggable
          nodeRef={headerNodeRef}
          bounds="parent"
          position={classicHeaderPosition || defaultHeaderPosition}
          onStop={(_, dragData) => {
            updateCustomization('classicHeaderPosition', { x: dragData.x, y: dragData.y });
          }}
        >
          <div ref={headerNodeRef} className="classic-header-draggable absolute cursor-move touch-none z-20 text-center min-w-[180px]">
            {topHeaderIcon && (
              <img
                src={topHeaderIcon}
                alt="Top icon"
                loading="eager"
                decoding="sync"
                crossOrigin="anonymous"
                className="w-12 h-12 object-contain mb-1 mx-auto"
              />
            )}
            {classicHeaderText?.trim() && (
              <h1 className="text-lg font-semibold tracking-wide" style={{ color: primaryColor }}>
                {classicHeaderText}
              </h1>
            )}
          </div>
        </Draggable>

      </div>

      <div className="relative z-10 space-y-6">
        {/* Personal Details */}
        {sectionVisibility.personal && (
          <section>
            {renderSectionTitle(labels.personalDetails)}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="grid grid-cols-3 gap-y-2 text-sm">
                {personal.fullName && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.fullName}:</div>
                    <div className="col-span-2">{personal.fullName}</div>
                  </>
                )}
                {personal.dob && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.dob}:</div>
                    <div className="col-span-2">{personal.dob}</div>
                  </>
                )}
                
                {personal.gender && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.gender}:</div>
                    <div className="col-span-2">{personal.gender}</div>
                  </>
                )}

                {personal.height && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.height}:</div>
                    <div className="col-span-2">{personal.height}</div>
                  </>
                )}

                {personal.complexion && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.complexion}:</div>
                    <div className="col-span-2">{personal.complexion}</div>
                  </>
                )}

                {personal.maritalStatus && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.maritalStatus}:</div>
                    <div className="col-span-2">{personal.maritalStatus}</div>
                  </>
                )}

                {personal.languages && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.languages}:</div>
                    <div className="col-span-2">{personal.languages}</div>
                  </>
                )}
                
                {personal.hobbies && (
                  <>
                    <div className="font-semibold text-gray-600">{labels.hobbies}:</div>
                    <div className="col-span-2">{personal.hobbies}</div>
                  </>
                )}

                {personal.customFields && personal.customFields.map((field) => (
                  <React.Fragment key={field.id}>
                    <div className="font-semibold text-gray-600">{field.label}:</div>
                    <div className="col-span-2">{field.value}</div>
                  </React.Fragment>
                ))}
              </div>
              {data.profileImage && (
                <div className="justify-self-end">
                  <img
                    src={data.profileImage}
                    alt="Profile"
                    className={clsx(
                      "object-cover shadow-sm",
                      classicPersonalPhotoShape === 'square'
                        ? "w-36 h-40 rounded-md"
                        : "w-36 h-48 rounded-sm"
                    )}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Family Background */}
        {sectionVisibility.family && (
          <section>
            {renderSectionTitle(labels.familyBackground)}
            <div className="grid grid-cols-3 gap-y-2 text-sm">
              {family.fatherName && (
                <>
                  <div className="font-semibold text-gray-600">{labels.fatherName}:</div>
                  <div className="col-span-2">{family.fatherName}</div>
                </>
              )}
              
              {family.fatherOccupation && (
                <>
                  <div className="font-semibold text-gray-600">{labels.fatherOccupation}:</div>
                  <div className="col-span-2">{family.fatherOccupation}</div>
                </>
              )}

              {family.motherName && (
                <>
                  <div className="font-semibold text-gray-600">{labels.motherName}:</div>
                  <div className="col-span-2">{family.motherName}</div>
                </>
              )}

              {family.motherOccupation && (
                <>
                  <div className="font-semibold text-gray-600">{labels.motherOccupation}:</div>
                  <div className="col-span-2">{family.motherOccupation}</div>
                </>
              )}

              {family.siblings && (
                <>
                  <div className="font-semibold text-gray-600">{labels.siblings}:</div>
                  <div className="col-span-2">{family.siblings}</div>
                </>
              )}

              {family.familyType && (
                <>
                  <div className="font-semibold text-gray-600">{labels.familyType}:</div>
                  <div className="col-span-2">{family.familyType}</div>
                </>
              )}

              {family.nativePlace && (
                <>
                  <div className="font-semibold text-gray-600">{labels.nativePlace}:</div>
                  <div className="col-span-2">{family.nativePlace}</div>
                </>
              )}

              {family.customFields && family.customFields.map((field) => (
                <React.Fragment key={field.id}>
                  <div className="font-semibold text-gray-600">{field.label}:</div>
                  <div className="col-span-2">{field.value}</div>
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {/* Education & Career */}
        {(sectionVisibility.education || sectionVisibility.professional) && (
          <section>
            {renderSectionTitle(labels.educationCareer)}
            <div className="grid grid-cols-3 gap-y-2 text-sm">
              {sectionVisibility.education && (
                <>
                  {education.highestQualification && (
                    <>
                      <div className="font-semibold text-gray-600">{labels.qualification}:</div>
                      <div className="col-span-2">{education.highestQualification}</div>
                    </>
                  )}
                  
                  {education.college && (
                    <>
                      <div className="font-semibold text-gray-600">{labels.college}:</div>
                      <div className="col-span-2">{education.college}</div>
                    </>
                  )}

                  {education.customFields && education.customFields.map((field) => (
                    <React.Fragment key={field.id}>
                      <div className="font-semibold text-gray-600">{field.label}:</div>
                      <div className="col-span-2">{field.value}</div>
                    </React.Fragment>
                  ))}
                </>
              )}

              {sectionVisibility.professional && (
                <>
                  {professional.occupation && (
                    <>
                      <div className="font-semibold text-gray-600">{labels.occupation}:</div>
                      <div className="col-span-2">{professional.occupation}</div>
                    </>
                  )}

                  {professional.company && (
                    <>
                      <div className="font-semibold text-gray-600">{labels.company}:</div>
                      <div className="col-span-2">{professional.company}</div>
                    </>
                  )}

                  {professional.income && (
                    <>
                      <div className="font-semibold text-gray-600">{labels.income}:</div>
                      <div className="col-span-2">{professional.income}</div>
                    </>
                  )}

                  {professional.customFields && professional.customFields.map((field) => (
                    <React.Fragment key={field.id}>
                      <div className="font-semibold text-gray-600">{field.label}:</div>
                      <div className="col-span-2">{field.value}</div>
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </section>
        )}

        {sectionVisibility.partnerPreferences && partnerPreferences.summary && (
          <section>
            {renderSectionTitle(labels.partnerPreferences || 'Partner Preferences')}
            <p className="text-sm leading-relaxed text-gray-700">{partnerPreferences.summary}</p>
            {partnerPreferences.customFields && partnerPreferences.customFields.length > 0 && (
              <div className="grid grid-cols-3 gap-y-2 text-sm mt-3">
                {partnerPreferences.customFields.map((field) => (
                  <React.Fragment key={field.id}>
                    <div className="font-semibold text-gray-600">{field.label}:</div>
                    <div className="col-span-2">{field.value}</div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Contact */}
        <section>
          {renderSectionTitle(labels.contact)}
          <div className="grid grid-cols-3 gap-y-2 text-sm">
            {personal.address && (
              <>
                <div className="font-semibold text-gray-600">{labels.address}:</div>
                <div className="col-span-2">{personal.address}</div>
              </>
            )}
            
            {personal.contact && (
              <>
                <div className="font-semibold text-gray-600">{labels.phone}:</div>
                <div className="col-span-2">{personal.contact}</div>
              </>
            )}

            {personal.email && (
              <>
                <div className="font-semibold text-gray-600">{labels.email}:</div>
                <div className="col-span-2">{personal.email}</div>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
