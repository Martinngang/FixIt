import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { updateIssueStatus } from '../../../store/slices/issuesSlice';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { Issue } from '../../../types/issue';
import Button from '../../../components/common/Button/Button';
import IssueCard from '../../../components/features/IssueCard/IssueCard';

interface AdminIssueCardProps {
  issue: Issue;
}

const AdminIssueCard: React.FC<AdminIssueCardProps> = ({ issue }) => {
  const { translations } = useContext(LanguageContext);
  const dispatch = useDispatch();

  return (
    <div className="bg-white p-4 rounded shadow">
      <IssueCard issue={issue} />
      {issue.status === 'Received' && (
        <Button
          onClick={() => dispatch(updateIssueStatus({ id: issue.id, status: 'In Progress' }))}
          className="mt-2 bg-yellow-500 text-white"
        >
          {translations.assign}
        </Button>
      )}
      {issue.status === 'In Progress' && (
        <Button
          onClick={() => dispatch(updateIssueStatus({ id: issue.id, status: 'Fixed' }))}
          className="mt-2 bg-green-500 text-white"
        >
          {translations.markFixed}
        </Button>
      )}
    </div>
  );
};

export default AdminIssueCard;