export interface SkillParam {
  name: string;
  required: boolean;
  hint: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  triggers: string[];
  siteUrl: string;
  requiresAuth: boolean;
  params: SkillParam[];
  instructions: string; // full markdown body (everything after frontmatter)
}

export interface LessonEntry {
  id: string;
  skillId: string;
  errorPattern: string;
  resolution: string;
  source: 'auto' | 'user';
  confidence: number;
  successCount: number;
  failureCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface LessonStore {
  loadForSkill(skillId: string, limit?: number): Promise<LessonEntry[]>;
  save(lesson: Omit<LessonEntry, 'id'>): Promise<LessonEntry>;
  recordOutcome(lessonId: string, success: boolean): Promise<void>;
  findMatching(skillId: string, errorText: string): Promise<LessonEntry[]>;
}
