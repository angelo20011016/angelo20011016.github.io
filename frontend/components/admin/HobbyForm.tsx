"use client";

import { useState, useEffect } from 'react';
import { Hobby } from '../../services/hobbyService';

interface HobbyFormProps {
  itemToEdit?: Hobby | null;
  onSave: (item: Omit<Hobby, 'id' | '_id'>) => void;
  onCancel: () => void;
}

export default function HobbyForm({ itemToEdit, onSave, onCancel }: HobbyFormProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setIcon(itemToEdit.icon);
      setDescription(itemToEdit.description || '');
    } else {
      setName('');
      setIcon('');
      setDescription('');
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, icon, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white p-4 bg-gray-900 rounded-lg">
      <h3 className="text-xl font-semibold">{itemToEdit ? 'Edit Hobby' : 'Add New Hobby'}</h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400">Hobby Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-white"
        />
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-400">Icon Name (FontAwesome)</label>
        <input
          type="text"
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g., faRunning, faCoffee"
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-white"
        />
        <p className="text-xs text-gray-500 mt-1">Use FontAwesome icon names like faRunning, faCoffee, faMusic, faDumbbell.</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-white"
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
          Save Hobby
        </button>
      </div>
    </form>
  );
}
