import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { addIssue } from '../../../store/slices/issuesSlice';
import { LanguageContext } from '../../../contexts/LanguageContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';

const ReportForm: React.FC = () => {
  const { translations } = useContext(LanguageContext);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ description: '', category: '', location: '' });

  const handleSubmit = () => {
    dispatch(addIssue({ ...form, status: 'Received', image: null }));
    setForm({ description: '', category: '', location: '' });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{translations.reportIssue}</h2>
      <Input
        label={translations.description}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder={translations.description}
      />
      <div className="mt-4">
        <label className="block mb-2">{translations.category}</label>
        <select
          className="w-full p-2 border rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">{translations.category}</option>
          <option value="Road">Road</option>
          <option value="Drainage">Drainage</option>
          <option value="Electricity">Electricity</option>
        </select>
      </div>
      <Input
        label={translations.location}
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="Latitude, Longitude or Address"
      />
      <Button onClick={handleSubmit} className="mt-4 bg-green-500 text-white">
        {translations.submit}
      </Button>
    </div>
  );
};

export default ReportForm;