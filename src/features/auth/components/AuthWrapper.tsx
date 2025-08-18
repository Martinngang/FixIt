import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => (
  <div className="max-w-md mx-auto">{children}</div>
);

export default AuthWrapper;