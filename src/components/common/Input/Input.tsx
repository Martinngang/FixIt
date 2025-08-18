import React from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="mt-4">
    <label className="block mb-2">{label}</label>
    <input
      type={type}
      className="w-full p-2 border rounded"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;