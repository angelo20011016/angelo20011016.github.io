"use client";

import { useState, useEffect } from 'react';
import { Skill } from '../../services/skillService';

interface SkillFormProps {
  itemToEdit?: Skill | null;
  onSave: (item: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
}

export default function SkillForm({ itemToEdit, onSave, onCancel }: SkillFormProps) {
  const [main, setMain] = useState('');
  const [icon, setIcon] = useState('');
  const [subSkills, setSubSkills] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setMain(itemToEdit.main);
      setIcon(itemToEdit.icon);
      setSubSkills(itemToEdit.subSkills.join(', '));
    } else {
      setMain('');
      setIcon('');
      setSubSkills('');
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillData: Omit<Skill, 'id'> = {
      main,
      icon,
      subSkills: subSkills.split(',').map(s => s.trim()).filter(Boolean),
    };
    onSave(skillData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white p-4 bg-gray-900 rounded-lg">
      <h3 className="text-xl font-semibold">{itemToEdit ? 'Edit Skill' : 'Add New Skill'}</h3>
      <div>
        <label htmlFor="main" className="block text-sm font-medium text-gray-400">Main Skill</label>
        <input
          type="text"
          name="main"
          id="main"
          value={main}
          onChange={(e) => setMain(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
       <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-400">Icon Name</label>
        <input
          type="text"
          name="icon"
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          required
          placeholder="e.g., faCode, faServer"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the name of a FontAwesome Free Solid icon (e.g., faCode, faServer, faHandshake, faChartLine).
        </p>
      </div>
       <div>
        <label htmlFor="subSkills" className="block text-sm font-medium text-gray-400">Sub-Skills (comma-separated)</label>
        <textarea
          name="subSkills"
          id="subSkills"
          value={subSkills}
          onChange={(e) => setSubSkills(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Save Skill
        </button>
      </div>
    </form>
  );
}