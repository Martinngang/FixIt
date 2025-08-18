import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import AuthWrapper from '../../features/auth/components/AuthWrapper';

const RegisterScreen: React.FC = () => {
  const { register } = useContext(AuthContext);
  const { translations } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    register(email, password);
    setTimeout(() => navigate('/'), 0); // Avoid context routing errors
  };

  if (!translations) return null;

  return (
    <AuthWrapper>
      <h2 className="text-xl font-semibold mb-4">{translations.register}</h2>
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
      <Button onClick={handleRegister} className="mt-4 bg-blue-500 text-white">
        {translations.register}
      </Button>
      <p className="mt-4">
        Already have an account? <a href="/login" className="text-blue-500">Login</a>
      </p>
    </AuthWrapper>
  );
};

export default RegisterScreen;
