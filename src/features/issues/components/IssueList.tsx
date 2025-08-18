import React from 'react';
import { Issue } from '../../../types/issue';
import IssueCard from '../../../components/features/IssueCard/IssueCard';

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => (
  <div className="space-y-4">
    {issues.map(issue => (
      <IssueCard key={issue.id} issue={issue} />
    ))}
  </div>
);

export default IssueList;