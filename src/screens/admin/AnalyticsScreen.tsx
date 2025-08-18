import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';

const AnalyticsScreen: React.FC = () => {
  const { translations } = useContext(LanguageContext);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
      <p>{translations.notFound} (Analytics not implemented yet)</p>
      {/* TODO: Add Chart.js for visualizing issue statistics */}
    </div>
  );
};

export default AnalyticsScreen;