export type CompanyQuery = {
  prefecture?: string;
  industry?: string;
  name?: string;
};

export type JobQuery = {
  prefecture?: string;
  occupation?: string;
  keyword?: string;
};

export type SearchTabType = "company" | "job";

export interface SearchTabsProps {
  initialTab?: SearchTabType;
  className?: string;
}
