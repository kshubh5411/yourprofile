import React, { useRef } from 'react';
import { Biodata, CustomizationOptions } from '../../types';
import { TranslationLabels } from '../../constants/translations';
import clsx from 'clsx';
import { getGodLogoAsset } from '../../constants/godLogos';
import Draggable from 'react-draggable';

interface TemplateProps {
  data: Biodata;
  labels: TranslationLabels;
  className?: string;
  updateCustomization: (field: keyof CustomizationOptions, value: any) => void;
}

export const IndianTemplate: React.FC<TemplateProps> = ({ data, labels, className, updateCustomization }) => {
  const { personal, family, education, professional, partnerPreferences, customization } = data;
  const {
    primaryColor,
    fontFamily,
    sectionVisibility,
    godLogo,
    selectedGodLogos,
    godLogoPosition,
    godLogoPositions,
    godLogoSize,
    godLogoOpacity = 0.75,
  } = customization;
  const fontClass = fontFamily === 'mono' ? 'font-doc-mono' : fontFamily === 'sans' ? 'font-doc-sans' : 'font-doc-serif';
  const logoNodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  const logosToRender = selectedGodLogos && selectedGodLogos.length > 0
    ? selectedGodLogos
    : (godLogo && godLogo !== 'None' ? [godLogo] : []);

  const getLogoNodeRef = (instanceKey: string) => {
    if (!logoNodeRefs.current[instanceKey]) {
      logoNodeRefs.current[instanceKey] = React.createRef<HTMLDivElement>();
    }
    return logoNodeRefs.current[instanceKey];
  };

  return (
    <div className={clsx('w-full h-full bg-white p-8 text-gray-900 border-4 border-double relative', fontClass, className)} style={{ borderColor: primaryColor }}>
      {logosToRender.map((logo, index) => {
        const logoAsset = getGodLogoAsset(logo);
        if (!logoAsset) return null;
        const instanceKey = `${logo}-${index}`;
        const nodeRef = getLogoNodeRef(instanceKey);
        const fallback = godLogoPosition || { x: 30 + index * (godLogoSize + 8), y: 24 };
        const position = godLogoPositions?.[instanceKey] || fallback;
        return (
          <Draggable
            key={instanceKey}
            nodeRef={nodeRef}
            position={position}
            onStop={(_, dragData) => {
              updateCustomization('godLogoPositions', {
                ...(godLogoPositions || {}),
                [instanceKey]: { x: dragData.x, y: dragData.y },
              });
            }}
          >
            <div
              ref={nodeRef}
              className="absolute cursor-move"
              style={{ width: godLogoSize, height: godLogoSize, opacity: godLogoOpacity }}
            >
              <img src={logoAsset} alt="Symbol" className="w-full h-full object-contain" />
            </div>
          </Draggable>
        );
      })}
      <div className="flex items-center mb-8 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
        {data.profileImage && (
          <div className="flex-shrink-0">
            <img 
              src={data.profileImage} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 shadow-sm"
              style={{ borderColor: primaryColor }}
            />
          </div>
        )}
        <div className="ml-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>{labels.biodata}</h1>
          <h2 className="text-2xl font-semibold text-gray-800">{personal.fullName || "Your Name"}</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        {sectionVisibility.personal && (
          <section>
            <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>{labels.personalDetails}</h3>
            <div className="grid grid-cols-3 gap-y-2 text-sm">
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
          </section>
        )}

        {/* Family Background */}
        {sectionVisibility.family && (
          <section>
            <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>{labels.familyBackground}</h3>
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
            <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>{labels.educationCareer}</h3>
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
            <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>
              {labels.partnerPreferences || 'Partner Preferences'}
            </h3>
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
          <h3 className="text-xl font-bold border-b border-gray-300 mb-3 uppercase" style={{ color: primaryColor }}>{labels.contact}</h3>
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
