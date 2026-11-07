export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id?: number | null;
}

/** Category enriched with its children for tree rendering */
export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
  /** Full path string, e.g. "Anime > Dragon Ball > Figuras" */
  path: string;
}
