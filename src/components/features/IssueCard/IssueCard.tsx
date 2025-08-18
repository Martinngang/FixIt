import React, { useContext } from 'react';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { Issue } from '../../../types/issue';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="bg-white p-4 rounded shadow">
      <p><strong>{translations.description}:</strong> {issue.description}</p>
      <p><strong>{translations.category}:</strong> {issue.category}</p>
      <p><strong>{translations.location}:</strong> {issue.location}</p>
      <p><strong>{translations.status}:</strong> {issue.status}</p>
    </div>
  );
};

export default IssueCard;