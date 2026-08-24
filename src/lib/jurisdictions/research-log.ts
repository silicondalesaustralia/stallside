export type ResearchLog = {
  jurisdiction: string;
  started: string;
  completed: string;
  researcher: string;
  queries_run: string[];
  pages_fetched: {
    url: string;
    tier: 1 | 2;
    fetched_at: string;
    regulator_last_updated: string;
  }[];
  fields_populated: number;
  fields_not_published: {
    field: string;
    searches_attempted: string[];
  }[];
  escalations: {
    field: string;
    reason: string;
    contact_method: string;
    status: "open" | "resolved";
  }[];
  information_gain_candidates: string[];
  schema_notes: string[];
};
