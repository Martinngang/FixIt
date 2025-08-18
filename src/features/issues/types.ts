export interface IssueForm {
  description: string;
  category: string;
  location: string;
  image?: File | null;
}