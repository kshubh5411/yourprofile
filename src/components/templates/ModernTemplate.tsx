import React from 'react';
import { Biodata, CustomizationOptions } from '../../types';
import { TranslationLabels } from '../../constants/translations';
import clsx from 'clsx';

interface TemplateProps {
  data: Biodata;
  labels: TranslationLabels;
  className?: string;
  updateCustomization: (field: keyof CustomizationOptions, value: any) => void;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, labels, className, updateCustomization }) => {
  const { personal, family, education, professional, partnerPreferences, customization } = data;
  const { primaryColor, fontFamily, sectionVisibility } = customization;
  const fontClass = fontFamily === 'mono' ? 'font-doc-mono' : fontFamily === 'sans' ? 'font-doc-sans' : 'font-doc-serif';

  return (
    <div className={clsx('w-full h-full bg-white flex text-gray-800 print:h-auto print:overflow-visible', fontClass, className)}>
      {/* Sidebar */}
      <div className="w-1/3 text-white p-6 flex flex-col" style={{ backgroundColor: primaryColor }}>
        {data.profileImage && (
          <div className="mb-6 flex justify-center">
            <img 
              src={data.profileImage} 
              alt="Profile" 
              className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-sm"
            />
          </div>
        )}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{personal.fullName || "Your Name"}</h1>
          <p className="opacity-80 text-sm uppercase tracking-wider">{professional.occupation || "Professional Title"}</p>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="opacity-70 uppercase text-xs font-bold mb-2 tracking-wider">{labels.contact}</h3>
            {personal.contact && <p className="mb-1">{personal.contact}</p>}
            {personal.email && <p className="mb-1">{personal.email}</p>}
            {personal.address && <p className="leading-relaxed opacity-90">{personal.address}</p>}
          </div>

          {sectionVisibility.personal && (
            <div>
              <h3 className="opacity-70 uppercase text-xs font-bold mb-2 tracking-wider">{labels.personalDetails}</h3>
              <div className="space-y-1 opacity-90">
                {personal.dob && <p><span className="opacity-70">{labels.dob}:</span> {personal.dob}</p>}
                {personal.height && <p><span className="opacity-70">{labels.height}:</span> {personal.height}</p>}
                {personal.maritalStatus && <p><span className="opacity-70">{labels.maritalStatus}:</span> {personal.maritalStatus}</p>}
                {personal.languages && <p><span className="opacity-70">{labels.languages}:</span> {personal.languages}</p>}
                {personal.customFields && personal.customFields.map((field) => (
                  <p key={field.id}><span className="opacity-70">{field.label}:</span> {field.value}</p>
                ))}
              </div>
            </div>
          )}

          {personal.hobbies && (
            <div>
              <h3 className="opacity-70 uppercase text-xs font-bold mb-2 tracking-wider">{labels.hobbies}</h3>
              <p className="opacity-90 leading-relaxed">{personal.hobbies}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 bg-slate-50">
        <div className="space-y-8">
          
          {/* Professional Summary (Implied from Career) */}
          {sectionVisibility.professional && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">{labels.professional}</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    {professional.occupation && <h3 className="font-semibold text-lg">{professional.occupation}</h3>}
                    {professional.company && <p className="text-slate-600">{professional.company}</p>}
                    {professional.experience && <p className="text-sm text-slate-500 mt-1">{professional.experience} {labels.experience}</p>}
                  </div>
                  {professional.income && (
                    <div className="text-sm text-slate-500">
                      <span className="font-medium">{labels.income}:</span> {professional.income}
                    </div>
                  )}
                  {professional.customFields && professional.customFields.map((field) => (
                    <div key={field.id} className="text-sm text-slate-500">
                      <span className="font-medium">{field.label}:</span> {field.value}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Education */}
          {sectionVisibility.education && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">{labels.education}</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <div>
                  {education.highestQualification && <h3 className="font-semibold">{education.highestQualification}</h3>}
                  {education.college && <p className="text-slate-600">{education.college}</p>}
                </div>
                {education.school && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="font-semibold text-sm">{labels.school}</h3>
                    <p className="text-slate-600 text-sm">{education.school}</p>
                  </div>
                )}
                {education.additionalSkills && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="font-semibold text-sm">{labels.skills}</h3>
                    <p className="text-slate-600 text-sm">{education.additionalSkills}</p>
                  </div>
                )}
                {education.customFields && education.customFields.map((field) => (
                  <div key={field.id} className="pt-2 border-t border-slate-100">
                    <h3 className="font-semibold text-sm">{field.label}</h3>
                    <p className="text-slate-600 text-sm">{field.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Family Background */}
          {sectionVisibility.family && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">{labels.familyBackground}</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(family.fatherName || family.fatherOccupation) && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase">Father</p>
                      {family.fatherName && <p className="font-medium">{family.fatherName}</p>}
                      {family.fatherOccupation && <p className="text-slate-600 text-xs">{family.fatherOccupation}</p>}
                    </div>
                  )}
                  {(family.motherName || family.motherOccupation) && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase">Mother</p>
                      {family.motherName && <p className="font-medium">{family.motherName}</p>}
                      {family.motherOccupation && <p className="text-slate-600 text-xs">{family.motherOccupation}</p>}
                    </div>
                  )}
                  {family.siblings && (
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                      <p className="text-slate-500 text-xs uppercase">{labels.siblings}</p>
                      <p className="text-slate-700">{family.siblings}</p>
                    </div>
                  )}
                  {family.nativePlace && (
                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs uppercase">{labels.origin}</p>
                      <p className="text-slate-700">{family.nativePlace} {family.familyType ? `(${family.familyType})` : ''}</p>
                    </div>
                  )}
                  {family.customFields && family.customFields.map((field) => (
                    <div key={field.id} className="col-span-2">
                      <p className="text-slate-500 text-xs uppercase">{field.label}</p>
                      <p className="text-slate-700">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {sectionVisibility.partnerPreferences && partnerPreferences.summary && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">
                {labels.partnerPreferences || 'Partner Preferences'}
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <p className="text-slate-700 leading-relaxed">{partnerPreferences.summary}</p>
                {partnerPreferences.customFields && partnerPreferences.customFields.map((field) => (
                  <div key={field.id} className="pt-2 border-t border-slate-100">
                    <h3 className="font-semibold text-sm">{field.label}</h3>
                    <p className="text-slate-600 text-sm">{field.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
