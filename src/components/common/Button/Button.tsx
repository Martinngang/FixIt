import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded ${className || 'bg-blue-500 text-white'}`}
  >
    {children}
  </button>
);

export default Button;