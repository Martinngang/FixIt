export interface AdminStats {
  totalIssues: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}