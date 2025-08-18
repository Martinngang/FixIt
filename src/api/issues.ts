import { Issue } from '../types/issue';

// Mock API for issues
export const submitIssue = async (issue: Omit<Issue, 'id' | 'status'>): Promise<Issue> => {
  // TODO: Replace with real API call
  return { ...issue, id: Date.now(), status: 'Received' }; // Use Date.now() for unique ID
};

export const fetchIssues = async (): Promise<Issue[]> => {
  // TODO: Replace with real API call
  return [
    { id: 1, description: 'Pothole on Main St', category: 'Road', location: '4.0511, 9.7085', status: 'Received', image: null },
    { id: 2, description: 'Broken streetlight', category: 'Electricity', location: '4.0522, 9.7090', status: 'In Progress', image: null },
  ];
};

export const updateIssueStatus = async (id: number, status: Issue['status']): Promise<Issue> => {
  // TODO: Replace with real API call
  // Fetch the existing issue to preserve its fields
  const issues = await fetchIssues();
  const issue = issues.find(i => i.id === id) || {
    id,
    description: 'Unknown',
    category: 'Unknown',
    location: 'Unknown',
    status: status as Issue['status'],
    image: null,
  };
  return { ...issue, status };
};