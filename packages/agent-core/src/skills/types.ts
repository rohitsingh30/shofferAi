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
