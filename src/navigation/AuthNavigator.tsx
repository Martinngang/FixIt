import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const AuthNavigator: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/register" element={<RegisterScreen />} />
  </Routes>
);

export default AuthNavigator;