export const DEFAULT_GENERATION_ENGINES = ["الخطة", "السبورة", "الملخص", "الخريطة الذهنية", "حل التقويم"] as const;

export type LessonFormDefaults = {
  school: string;
  teacher: string;
  subject: string;
  language: string;
  aiModel: string;
};

type LessonSettings = Partial<LessonFormDefaults> & {
  generationTargets?: string | null;
};

export function getGenerationEngines(generationTargets?: string | null): string[] {
  const configuredTargets = generationTargets?.split(/[,،]/).map((target) => target.trim()).filter(Boolean);
  return configuredTargets?.length ? configuredTargets : [...DEFAULT_GENERATION_ENGINES];
}

export function applyLessonSettings<T extends LessonFormDefaults>(previous: T, settings?: LessonSettings | null): T {
  if (!settings) return previous;
  return {
    ...previous,
    school: settings.school || previous.school,
    teacher: settings.teacher || previous.teacher,
    subject: settings.subject || previous.subject,
    language: settings.language || previous.language,
    aiModel: settings.aiModel || previous.aiModel,
  } as T;
}
