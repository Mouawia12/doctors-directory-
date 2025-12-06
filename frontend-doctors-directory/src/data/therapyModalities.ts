export interface TherapyModalityOption {
  code: string
  ar: string
  en: string
}

export const therapyModalityOptions: TherapyModalityOption[] = [
  { code: 'cbt', ar: 'العلاج المعرفي السلوكي', en: 'Cognitive Behavioral Therapy (CBT)' },
  { code: 'dbt', ar: 'العلاج الجدلي السلوكي', en: 'Dialectical Behavior Therapy (DBT)' },
  { code: 'psychodynamic', ar: 'العلاج النفسي الدينامي', en: 'Psychodynamic Therapy' },
  { code: 'psychoanalytic', ar: 'العلاج التحليلي', en: 'Psychoanalytic Therapy' },
  { code: 'humanistic', ar: 'العلاج الإنساني', en: 'Humanistic Therapy' },
  { code: 'existential', ar: 'العلاج الوجودي', en: 'Existential Therapy' },
  { code: 'gestalt', ar: 'العلاج الجشطالتي', en: 'Gestalt Therapy' },
  { code: 'person_centered', ar: 'العلاج متمحور حول الشخص', en: 'Person-Centered Therapy' },
  { code: 'act', ar: 'العلاج بالقبول والالتزام', en: 'Acceptance and Commitment Therapy (ACT)' },
  { code: 'schema', ar: 'العلاج بالمخططات', en: 'Schema Therapy' },
  { code: 'emdr', ar: 'العلاج بالاستثارة الثنائية (EMDR)', en: 'Eye Movement Desensitization and Reprocessing (EMDR)' },
  { code: 'behavioral', ar: 'العلاج السلوكي', en: 'Behavioral Therapy' },
  { code: 'aba', ar: 'العلاج السلوكي التحليلي (ABA)', en: 'Applied Behavior Analysis (ABA)' },
  { code: 'narrative', ar: 'العلاج السردي', en: 'Narrative Therapy' },
  { code: 'family', ar: 'العلاج الأسري', en: 'Family Therapy' },
  { code: 'couples', ar: 'علاج الأزواج', en: 'Couples Therapy' },
  { code: 'eft', ar: 'العلاج الوجداني المركّز', en: 'Emotion-Focused Therapy (EFT)' },
  { code: 'mbct', ar: 'العلاج المعرفي المعتمد على اليقظة', en: 'Mindfulness-Based Cognitive Therapy (MBCT)' },
  { code: 'pe', ar: 'علاج الحدث المطوّل', en: 'Prolonged Exposure Therapy (PE)' },
  { code: 'cpt', ar: 'علاج معالجة العمليات المعرفية', en: 'Cognitive Processing Therapy (CPT)' },
  { code: 'mindfulness', ar: 'العلاج باليقظة الذهنية', en: 'Mindfulness-Based Therapy' },
  { code: 'somatic', ar: 'العلاج السوماتي/الجسدي', en: 'Somatic Therapy' },
  { code: 'integrative', ar: 'العلاج بالتكامل النفسي', en: 'Integrative Therapy' },
  { code: 'eclectic', ar: 'العلاج الانتقائي', en: 'Eclectic Therapy' },
  { code: 'sfbtt', ar: 'العلاج القصير المدى الموجّه للحلول', en: 'Solution-Focused Brief Therapy (SFBT)' },
  { code: 'play', ar: 'العلاج باللعب', en: 'Play Therapy' },
  { code: 'sandplay', ar: 'العلاج بالرمل', en: 'Sandplay Therapy' },
  { code: 'art', ar: 'العلاج بالفنون', en: 'Art Therapy' },
  { code: 'music', ar: 'العلاج بالموسيقى', en: 'Music Therapy' },
  { code: 'drama_movement', ar: 'العلاج بالدراما والحركة', en: 'Drama / Movement Therapy' },
  { code: 'mbt', ar: 'العلاج العقلي القائم على الذهننة', en: 'Mentalization-Based Therapy (MBT)' },
  { code: 'ifs', ar: 'العلاج بالحوار الداخلي', en: 'Internal Family Systems (IFS)' },
]

export const therapyModalityLabels = therapyModalityOptions.map((option) => `${option.ar} / ${option.en}`)
