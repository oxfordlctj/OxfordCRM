export type DecisionDraft = {
  title: string;
  description: string;
  review_in_days: number;
  tasks: { title: string; owner_slug: string; due_in_days: number }[];
};
