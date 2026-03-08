import React, { useRef, useState, useEffect } from 'react';
import { Biodata, CustomizationOptions, SectionOrderKey } from '../../types';
import { TranslationLabels } from '../../constants/translations';
import clsx from 'clsx';
import Draggable from 'react-draggable';
import { getGodLogoAsset } from '../../constants/godLogos';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
  const headerShellRef = useRef<HTMLDivElement>(null);

  const topHeaderIcon = getGodLogoAsset(classicHeaderIcon || 'ganesha-4');
  const defaultHeaderPosition =
    classicVariant === 'photo-left' ? { x: 250, y: 0 } : { x: 300, y: 0 };
  const normalizedHeaderPosition = {
    x: Math.max(0, (classicHeaderPosition || defaultHeaderPosition).x),
    y: Math.min(40, Math.max(0, (classicHeaderPosition || defaultHeaderPosition).y)),
  };

  useEffect(() => {
    const shell = headerShellRef.current;
    const header = headerNodeRef.current;
    if (!shell || !header) return;
    const maxX = Math.max(0, shell.clientWidth - header.offsetWidth);
    if (normalizedHeaderPosition.x > maxX) {
      updateCustomization('classicHeaderPosition', { x: maxX, y: normalizedHeaderPosition.y });
    }
  }, [normalizedHeaderPosition.x, normalizedHeaderPosition.y, updateCustomization]);
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
  const defaultSectionOrder: SectionOrderKey[] = ['personal', 'family', 'educationCareer', 'partnerPreferences', 'contact'];
  const rawSectionOrder = customization.sectionOrder?.length ? customization.sectionOrder : defaultSectionOrder;
  const orderedSectionKeys = [
    ...rawSectionOrder.filter((key): key is SectionOrderKey => defaultSectionOrder.includes(key)),
    ...defaultSectionOrder.filter((key) => !rawSectionOrder.includes(key)),
  ];
  const [draggingSection, setDraggingSection] = useState<SectionOrderKey | null>(null);

  const moveSection = (source: SectionOrderKey, target: SectionOrderKey) => {
    if (source === target) return;
    const next = [...orderedSectionKeys];
    const fromIndex = next.indexOf(source);
    const toIndex = next.indexOf(target);
    if (fromIndex < 0 || toIndex < 0) return;
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, source);
    updateCustomization('sectionOrder', next);
  };

  const renderSectionTitle = (title: string) => {
    if (!framePreset.sectionPill) {
      return (
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-xl font-bold uppercase leading-none" style={{ color: primaryColor }}>
            {title}
          </h3>
          <div className="h-px flex-1 bg-gray-300" />
        </div>
      );
    }

    const pillText = title.toUpperCase().trim();

    return (
      <div className="mb-3 flex justify-start">
        <div
          className="pdf-safe-pill inline-flex h-11 items-center justify-center gap-2 px-5 rounded-full text-base font-extrabold text-white whitespace-nowrap"
          style={{
            backgroundColor: primaryColor,
            fontFamily: 'Arial, Helvetica, sans-serif',
            letterSpacing: '0',
            textTransform: 'none',
          }}
          data-pill-text={pillText}
        >
          <span className="relative top-[1px] block leading-none text-center">{pillText}</span>
        </div>
      </div>
    );
  };
  const detailsGridClass = 'grid grid-cols-[minmax(150px,0.95fr)_minmax(0,1.5fr)] gap-x-6 gap-y-1.5 text-sm items-start';
  const detailLabelClass = 'font-semibold text-gray-600 text-left leading-tight';
  const detailValueClass = 'text-left leading-tight break-words';

  return (
    <div
      data-export-template="classic"
      className={clsx(
        'relative w-full min-h-[297mm] p-6 text-gray-900 overflow-hidden print:min-h-[297mm] print:overflow-visible',
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
      <div ref={headerShellRef} className="classic-header-shell relative z-10 mb-4 pt-1 min-h-[96px]">
        <Draggable
          nodeRef={headerNodeRef}
          bounds="parent"
          position={normalizedHeaderPosition}
          onStop={(_, dragData) => {
            updateCustomization('classicHeaderPosition', {
              x: Math.max(0, dragData.x),
              y: Math.min(40, Math.max(0, dragData.y)),
            });
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
        <div className="absolute left-0 right-0 bottom-0 border-b-2" style={{ borderColor: primaryColor }} />
      </div>

      <div className="relative z-10 space-y-4">
        {orderedSectionKeys.map((sectionKey) => {
          const sectionDnDProps = {
            draggable: true,
            onDragStart: () => setDraggingSection(sectionKey),
            onDragOver: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
            onDrop: () => {
              if (draggingSection) moveSection(draggingSection, sectionKey);
              setDraggingSection(null);
            },
            onDragEnd: () => setDraggingSection(null),
            className: clsx(
              'group relative rounded-lg transition-colors',
              draggingSection === sectionKey && 'bg-amber-50/60'
            ),
          };

          const sectionIndex = orderedSectionKeys.indexOf(sectionKey);
          const hoverControls = (
            <div className="absolute -top-2 right-0 flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (sectionIndex > 0) moveSection(sectionKey, orderedSectionKeys[sectionIndex - 1]);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                disabled={sectionIndex === 0}
                title="Move up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (sectionIndex < orderedSectionKeys.length - 1) moveSection(sectionKey, orderedSectionKeys[sectionIndex + 1]);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                disabled={sectionIndex === orderedSectionKeys.length - 1}
                title="Move down"
              >
                <ArrowDown size={12} />
              </button>
            </div>
          );

          if (sectionKey === 'personal' && sectionVisibility.personal) {
            return (
              <section key="personal" {...sectionDnDProps}>
                {hoverControls}
                {renderSectionTitle(labels.personalDetails)}
                <div data-export-personal-layout="true" className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
                  <div data-export-details-grid="true" className={detailsGridClass}>
                    {personal.fullName && (
                      <>
                        <div className={detailLabelClass}>{labels.fullName}:</div>
                        <div className={detailValueClass}>{personal.fullName}</div>
                      </>
                    )}
                    {personal.dob && (
                      <>
                        <div className={detailLabelClass}>{labels.dob}:</div>
                        <div className={detailValueClass}>{personal.dob}</div>
                      </>
                    )}
                    {personal.gender && (
                      <>
                        <div className={detailLabelClass}>{labels.gender}:</div>
                        <div className={detailValueClass}>{personal.gender}</div>
                      </>
                    )}
                    {personal.height && (
                      <>
                        <div className={detailLabelClass}>{labels.height}:</div>
                        <div className={detailValueClass}>{personal.height}</div>
                      </>
                    )}
                    {personal.complexion && (
                      <>
                        <div className={detailLabelClass}>{labels.complexion}:</div>
                        <div className={detailValueClass}>{personal.complexion}</div>
                      </>
                    )}
                    {personal.maritalStatus && (
                      <>
                        <div className={detailLabelClass}>{labels.maritalStatus}:</div>
                        <div className={detailValueClass}>{personal.maritalStatus}</div>
                      </>
                    )}
                    {personal.languages && (
                      <>
                        <div className={detailLabelClass}>{labels.languages}:</div>
                        <div className={detailValueClass}>{personal.languages}</div>
                      </>
                    )}
                    {personal.hobbies && (
                      <>
                        <div className={detailLabelClass}>{labels.hobbies}:</div>
                        <div className={detailValueClass}>{personal.hobbies}</div>
                      </>
                    )}
                    {personal.customFields && personal.customFields.map((field) => (
                      <React.Fragment key={field.id}>
                        <div className={detailLabelClass}>{field.label}:</div>
                        <div className={detailValueClass}>{field.value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                  {data.profileImage && (
                    <div data-export-profile-image-wrap="true" className="justify-self-end self-start">
                      <img
                        src={data.profileImage}
                        alt="Profile"
                        className={clsx(
                          "object-cover shadow-sm",
                          classicPersonalPhotoShape === 'circle'
                            ? "w-32 h-32 rounded-full"
                            : classicPersonalPhotoShape === 'square'
                              ? "w-32 h-32 rounded-md"
                              : "w-32 h-40 rounded-sm"
                        )}
                      />
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (sectionKey === 'family' && sectionVisibility.family) {
            return (
              <section key="family" {...sectionDnDProps}>
                {hoverControls}
                {renderSectionTitle(labels.familyBackground)}
                <div data-export-details-grid="true" className={detailsGridClass}>
                  {family.fatherName && (
                    <>
                      <div className={detailLabelClass}>{labels.fatherName}:</div>
                      <div className={detailValueClass}>{family.fatherName}</div>
                    </>
                  )}
                  {family.fatherOccupation && (
                    <>
                      <div className={detailLabelClass}>{labels.fatherOccupation}:</div>
                      <div className={detailValueClass}>{family.fatherOccupation}</div>
                    </>
                  )}
                  {family.motherName && (
                    <>
                      <div className={detailLabelClass}>{labels.motherName}:</div>
                      <div className={detailValueClass}>{family.motherName}</div>
                    </>
                  )}
                  {family.motherOccupation && (
                    <>
                      <div className={detailLabelClass}>{labels.motherOccupation}:</div>
                      <div className={detailValueClass}>{family.motherOccupation}</div>
                    </>
                  )}
                  {family.siblings && (
                    <>
                      <div className={detailLabelClass}>{labels.siblings}:</div>
                      <div className={detailValueClass}>{family.siblings}</div>
                    </>
                  )}
                  {family.familyType && (
                    <>
                      <div className={detailLabelClass}>{labels.familyType}:</div>
                      <div className={detailValueClass}>{family.familyType}</div>
                    </>
                  )}
                  {family.nativePlace && (
                    <>
                      <div className={detailLabelClass}>{labels.nativePlace}:</div>
                      <div className={detailValueClass}>{family.nativePlace}</div>
                    </>
                  )}
                  {family.customFields && family.customFields.map((field) => (
                    <React.Fragment key={field.id}>
                      <div className={detailLabelClass}>{field.label}:</div>
                      <div className={detailValueClass}>{field.value}</div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'educationCareer' && (sectionVisibility.education || sectionVisibility.professional)) {
            return (
              <section key="educationCareer" {...sectionDnDProps}>
                {hoverControls}
                {renderSectionTitle(labels.educationCareer)}
                <div data-export-details-grid="true" className={detailsGridClass}>
                  {sectionVisibility.education && (
                    <>
                      {education.highestQualification && (
                        <>
                          <div className={detailLabelClass}>{labels.qualification}:</div>
                          <div className={detailValueClass}>{education.highestQualification}</div>
                        </>
                      )}
                      {education.college && (
                        <>
                          <div className={detailLabelClass}>{labels.college}:</div>
                          <div className={detailValueClass}>{education.college}</div>
                        </>
                      )}
                      {education.customFields && education.customFields.map((field) => (
                        <React.Fragment key={field.id}>
                          <div className={detailLabelClass}>{field.label}:</div>
                          <div className={detailValueClass}>{field.value}</div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {sectionVisibility.professional && (
                    <>
                      {professional.occupation && (
                        <>
                          <div className={detailLabelClass}>{labels.occupation}:</div>
                          <div className={detailValueClass}>{professional.occupation}</div>
                        </>
                      )}
                      {professional.company && (
                        <>
                          <div className={detailLabelClass}>{labels.company}:</div>
                          <div className={detailValueClass}>{professional.company}</div>
                        </>
                      )}
                      {professional.income && (
                        <>
                          <div className={detailLabelClass}>{labels.income}:</div>
                          <div className={detailValueClass}>{professional.income}</div>
                        </>
                      )}
                      {professional.customFields && professional.customFields.map((field) => (
                        <React.Fragment key={field.id}>
                          <div className={detailLabelClass}>{field.label}:</div>
                          <div className={detailValueClass}>{field.value}</div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </div>
              </section>
            );
          }

          if (sectionKey === 'partnerPreferences' && sectionVisibility.partnerPreferences && partnerPreferences.summary) {
            return (
              <section key="partnerPreferences" {...sectionDnDProps}>
                {hoverControls}
                {renderSectionTitle(labels.partnerPreferences || 'Partner Preferences')}
                <p className="text-sm leading-relaxed text-gray-700">{partnerPreferences.summary}</p>
                {partnerPreferences.customFields && partnerPreferences.customFields.length > 0 && (
                  <div data-export-details-grid="true" className={`${detailsGridClass} mt-3`}>
                    {partnerPreferences.customFields.map((field) => (
                      <React.Fragment key={field.id}>
                        <div className={detailLabelClass}>{field.label}:</div>
                        <div className={detailValueClass}>{field.value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          if (sectionKey === 'contact') {
            return (
              <section key="contact" {...sectionDnDProps}>
                {hoverControls}
                {renderSectionTitle(labels.contact)}
                <div data-export-details-grid="true" className={detailsGridClass}>
                  {personal.address && (
                    <>
                      <div className={detailLabelClass}>{labels.address}:</div>
                      <div className={detailValueClass}>{personal.address}</div>
                    </>
                  )}
                  {personal.contact && (
                    <>
                      <div className={detailLabelClass}>{labels.phone}:</div>
                      <div className={detailValueClass}>{personal.contact}</div>
                    </>
                  )}
                  {personal.email && (
                    <>
                      <div className={detailLabelClass}>{labels.email}:</div>
                      <div className={detailValueClass}>{personal.email}</div>
                    </>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
