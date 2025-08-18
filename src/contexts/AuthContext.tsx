import React, { createContext, useState } from 'react';

interface AuthContextType {
  user: { role: string } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ role: string } | null>(null);

  const login = (email: string, password: string) => {
    console.log('Login:', email, password);
    setUser({ role: 'user' }); // Mock login
  };

  const logout = () => {
    console.log('Logout');
    setUser(null);
  };

  const register = (email: string, password: string) => {
    console.log('Register:', email, password);
    setUser({ role: 'user' }); // Mock register
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};