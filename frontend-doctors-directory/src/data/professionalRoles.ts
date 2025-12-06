export interface ProfessionalRoleOption {
  id: string
  ar: string
  en: string
}

export const professionalRoles: ProfessionalRoleOption[] = [
  { id: 'psychologist', ar: 'عالم نفس', en: 'Psychologist' },
  { id: 'clinical_psychologist', ar: 'أخصائي نفسي إكلينيكي', en: 'Clinical Psychologist' },
  { id: 'counseling_psychologist', ar: 'أخصائي نفسي إرشادي', en: 'Counseling Psychologist' },
  { id: 'family_therapist', ar: 'معالج زواجي وأسري', en: 'Marriage & Family Therapist' },
  { id: 'licensed_family_therapist', ar: 'معالج زواجي وأسري مُرخّص', en: 'Licensed Marriage & Family Therapist' },
  { id: 'licensed_professional_counselor', ar: 'مستشار مهني مُرخّص', en: 'Licensed Professional Counselor' },
  { id: 'licensed_mental_health_counselor', ar: 'مستشار صحة نفسية مُرخّص', en: 'Licensed Mental Health Counselor' },
  { id: 'licensed_professional_clinical_counselor', ar: 'مستشار مهني–إكلينيكي مُرخّص', en: 'Licensed Professional Clinical Counselor' },
  { id: 'licensed_clinical_social_worker', ar: 'أخصائي خدمة اجتماعية إكلينيكي مُرخّص', en: 'Licensed Clinical Social Worker' },
  { id: 'clinical_social_worker', ar: 'أخصائي خدمة اجتماعية إكلينيكي', en: 'Clinical Social Worker' },
  { id: 'psychotherapist', ar: 'معالج نفسي', en: 'Psychotherapist' },
  { id: 'mental_health_counselor', ar: 'مستشار صحة نفسية', en: 'Mental Health Counselor' },
]

export const professionalRoleLabels = professionalRoles.map((role) => `${role.ar} / ${role.en}`)
