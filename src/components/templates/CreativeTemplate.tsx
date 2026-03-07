import React from 'react';
import { Biodata } from '../../types';
import { TranslationLabels } from '../../constants/translations';
import clsx from 'clsx';

interface TemplateProps {
  data: Biodata;
  labels: TranslationLabels;
  className?: string;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, labels, className }) => {
  const { personal, family, education, professional, partnerPreferences, customization } = data;
  const { primaryColor, fontFamily, sectionVisibility } = customization;
  const fontClass = fontFamily === 'mono' ? 'font-mono' : fontFamily === 'sans' ? 'font-sans' : 'font-serif';

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className={clsx('w-full h-full bg-white text-gray-800 relative overflow-hidden', fontClass, className)}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full -z-0 opacity-20" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-full -z-0 opacity-10" style={{ backgroundColor: primaryColor }} />

      <div className="relative z-10 p-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-end mb-12 border-b-4 pb-6" style={{ borderColor: primaryColor }}>
          <div className="flex items-center gap-6">
            {data.profileImage && (
              <img 
                src={data.profileImage} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 shadow-sm"
                style={{ borderColor: primaryColor }}
              />
            )}
            <div>
              <h1 className="text-5xl font-black mb-2 tracking-tight" style={{ color: primaryColor }}>{personal.fullName || "Your Name"}</h1>
              <p className="text-xl font-medium opacity-80" style={{ color: primaryColor }}>{professional.occupation || "Creative Professional"}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{personal.email}</p>
            <p>{personal.contact}</p>
            <p>{personal.address}</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 flex-1">
          {/* Left Column */}
          <div className="col-span-4 space-y-8 border-r border-gray-100 pr-8">
            {sectionVisibility.personal && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: primaryColor }}>{labels.personalDetails}</h3>
                <div className="space-y-3 text-sm">
                  {personal.dob && (
                    <div>
                      <span className="block text-gray-400 text-xs">{labels.dob}</span>
                      <span className="font-medium">{personal.dob}</span>
                    </div>
                  )}
                  {personal.height && (
                    <div>
                      <span className="block text-gray-400 text-xs">{labels.height}</span>
                      <span className="font-medium">{personal.height}</span>
                    </div>
                  )}
                  {personal.maritalStatus && (
                    <div>
                      <span className="block text-gray-400 text-xs">{labels.maritalStatus}</span>
                      <span className="font-medium">{personal.maritalStatus}</span>
                    </div>
                  )}
                  {personal.languages && (
                    <div>
                      <span className="block text-gray-400 text-xs">{labels.languages}</span>
                      <span className="font-medium">{personal.languages}</span>
                    </div>
                  )}
                  {personal.customFields && personal.customFields.map((field) => (
                    <div key={field.id}>
                      <span className="block text-gray-400 text-xs">{field.label}</span>
                      <span className="font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {personal.hobbies && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: primaryColor }}>{labels.interests}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{personal.hobbies}</p>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-8 space-y-10">
            {sectionVisibility.professional && (
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 rounded-full block" style={{ backgroundColor: primaryColor }}></span>
                  {labels.professional}
                </h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  {professional.occupation && <h4 className="text-lg font-bold text-gray-800">{professional.occupation}</h4>}
                  {professional.company && <p className="font-medium mb-2" style={{ color: primaryColor }}>{professional.company}</p>}
                  {professional.experience && <p className="text-gray-600 mb-4">{professional.experience} {labels.experience}</p>}
                  {professional.income && (
                    <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-bold border shadow-sm" style={{ color: primaryColor, borderColor: hexToRgba(primaryColor, 0.125) }}>
                      {labels.income}: {professional.income}
                    </div>
                  )}
                  {professional.customFields && professional.customFields.map((field) => (
                    <div key={field.id} className="mt-2">
                      <span className="text-sm font-bold text-gray-700">{field.label}: </span>
                      <span className="text-sm text-gray-600">{field.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sectionVisibility.education && (
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 rounded-full block" style={{ backgroundColor: primaryColor }}></span>
                  {labels.education}
                </h3>
                <div className="space-y-4">
                  {(education.highestQualification || education.college) && (
                    <div className="border-l-2 pl-4 py-1" style={{ borderColor: hexToRgba(primaryColor, 0.25) }}>
                      {education.highestQualification && <h4 className="font-bold text-gray-800">{education.highestQualification}</h4>}
                      {education.college && <p className="text-gray-500 text-sm">{education.college}</p>}
                    </div>
                  )}
                  {education.school && (
                    <div className="border-l-2 pl-4 py-1" style={{ borderColor: hexToRgba(primaryColor, 0.25) }}>
                      <h4 className="font-bold text-gray-800 text-sm">{labels.school}</h4>
                      <p className="text-gray-500 text-sm">{education.school}</p>
                    </div>
                  )}
                  {education.customFields && education.customFields.map((field) => (
                    <div key={field.id} className="border-l-2 pl-4 py-1" style={{ borderColor: hexToRgba(primaryColor, 0.25) }}>
                      <h4 className="font-bold text-gray-800 text-sm">{field.label}</h4>
                      <p className="text-gray-500 text-sm">{field.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sectionVisibility.family && (
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 rounded-full block" style={{ backgroundColor: primaryColor }}></span>
                  {labels.familyBackground}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {(family.fatherName || family.fatherOccupation) && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: hexToRgba(primaryColor, 0.06) }}>
                      <span className="block text-xs font-bold uppercase mb-1" style={{ color: primaryColor }}>Father</span>
                      {family.fatherName && <p className="font-medium text-gray-900">{family.fatherName}</p>}
                      {family.fatherOccupation && <p className="text-xs text-gray-500">{family.fatherOccupation}</p>}
                    </div>
                  )}
                  {(family.motherName || family.motherOccupation) && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: hexToRgba(primaryColor, 0.06) }}>
                      <span className="block text-xs font-bold uppercase mb-1" style={{ color: primaryColor }}>Mother</span>
                      {family.motherName && <p className="font-medium text-gray-900">{family.motherName}</p>}
                      {family.motherOccupation && <p className="text-xs text-gray-500">{family.motherOccupation}</p>}
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500 flex flex-wrap gap-4">
                  {family.siblings && <span>• {family.siblings}</span>}
                  {family.nativePlace && <span>• {family.nativePlace}</span>}
                  {family.customFields && family.customFields.map((field) => (
                    <span key={field.id}>• {field.label}: {field.value}</span>
                  ))}
                </div>
              </section>
            )}

            {sectionVisibility.partnerPreferences && partnerPreferences.summary && (
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 rounded-full block" style={{ backgroundColor: primaryColor }}></span>
                  {labels.partnerPreferences || 'Partner Preferences'}
                </h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{partnerPreferences.summary}</p>
                  {partnerPreferences.customFields && partnerPreferences.customFields.map((field) => (
                    <div key={field.id}>
                      <span className="text-sm font-bold text-gray-700">{field.label}: </span>
                      <span className="text-sm text-gray-600">{field.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
