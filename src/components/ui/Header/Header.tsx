import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import Button from '../../common/Button/Button';

const Header: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { translations, setLanguage } = useContext(LanguageContext);

  return (
    <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
      <Link to="/" className="text-xl font-bold">{translations.title}</Link>
      <div className="flex items-center">
        <select
          className="mr-4 p-2 border rounded bg-white text-black"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
        {user ? (
          <>
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/status'} className="mr-4">
              <Button className="bg-white text-blue-500">
                {user.role === 'admin' ? translations.adminDashboard : translations.myReports}
              </Button>
            </Link>
            <Button onClick={logout} className="bg-red-500">{translations.logout}</Button>
          </>
        ) : (
          <Link to="/login">
            <Button className="bg-white text-blue-500">{translations.login}</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;