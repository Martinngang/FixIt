import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import AuthWrapper from '../../features/auth/components/AuthWrapper';

const LoginScreen: React.FC = () => {
  const { login } = useContext(AuthContext);
  const { translations } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login(email, password);
    setTimeout(() => navigate('/'), 0); // Avoid context routing errors
  };

  if (!translations) return null;

  return (
    <AuthWrapper>
      <h2 className="text-xl font-semibold mb-4">{translations.login}</h2>
      <Input
        label={translations.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={translations.email}
      />
      <Input
        label={translations.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={translations.password}
        type="password"
      />
      <Button onClick={handleLogin} className="mt-4 bg-blue-500 text-white">
        {translations.login}
      </Button>
      <p className="mt-4">
        Don't have an account? <a href="/register" className="text-blue-500">Register</a>
      </p>
    </AuthWrapper>
  );
};

export default LoginScreen;
