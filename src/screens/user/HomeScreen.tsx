import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button/Button';

const HomeScreen: React.FC = () => {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">{translations.title}</h2>
      <p className="mb-4">{translations.homeWelcome}</p>
      <Link to="/report">
        <Button className="bg-green-500 text-white">{translations.reportIssue}</Button>
      </Link>
      <Link to="/status" className="ml-4">
        <Button className="bg-blue-500 text-white">{translations.myReports}</Button>
      </Link>
    </div>
  );
};

export default HomeScreen;