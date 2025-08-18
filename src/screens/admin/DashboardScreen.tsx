import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LanguageContext } from '../../contexts/LanguageContext';
import AdminIssueCard from '../../features/admin/components/AdminIssueCard';

const DashboardScreen: React.FC = () => {
  const { translations } = useContext(LanguageContext);
  const issues = useSelector((state: RootState) => state.issues.issues);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{translations.adminDashboard}</h2>
      <div className="space-y-4">
        {issues.map(issue => (
          <AdminIssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;