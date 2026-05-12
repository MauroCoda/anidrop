/**
 * Row shape for `public.homepage_sections` (Supabase).
 */
export type HomepageSectionRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  anime_ids: number[];
  ai_reasoning: string | null;
  section_type: string | null;
  is_active: boolean;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
};

export type HomepageSectionUpsert = {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  anime_ids: number[];
  ai_reasoning?: string | null;
  section_type?: string | null;
  is_active?: boolean;
  month: number;
  year: number;
};
