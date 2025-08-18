import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LanguageContext } from '../../contexts/LanguageContext';
import IssueList from '../../features/issues/components/IssueList';

const IssuesScreen: React.FC = () => {
  const { translations } = useContext(LanguageContext);
  const issues = useSelector((state: RootState) => state.issues.issues);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Issues</h2>
      <IssueList issues={issues} />
    </div>
  );
};

export default IssuesScreen;