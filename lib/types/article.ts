export type ArticleTopic = {
  country: string;
  title: string;
  body: string;
  impact?: string;
  validity?: string;
  source: { name: string; url: string };
};

export type Article = {
  slug: string;
  title: string;
  dateRange: string;
  lead?: string;
  topics: ArticleTopic[];
  checklist?: string[];
  draft?: boolean;
};
