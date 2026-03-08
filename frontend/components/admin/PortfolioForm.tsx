"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../services/authService';

// Import the new Markdown editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });


// Re-using the interface from the Manager component, but it could be moved to a shared types file
interface PortfolioItem {
    id?: string;
    title: string;
    description: string;
    content?: string;
    image_url?: string;
    github_url?: string;
    demo_url?: string;
    tags: string[];
}

interface PortfolioFormProps {
  itemToEdit?: PortfolioItem | null;
  onSave: (item: PortfolioItem) => void;
  onCancel: () => void;
}

// Sub-component for handling image uploads (could be moved to a shared file)
const ImageUploadField = ({ label, value, name, onUrlChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'File upload failed' }));
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      onUrlChange(name, data.file_path);
      toast.success("Image uploaded successfully!");

    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
      <div className="flex items-center gap-4 mt-1">
        <input
          type="text"
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onUrlChange(name, e.target.value)}
          className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 whitespace-nowrap"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};


export default function PortfolioForm({ itemToEdit, onSave, onCancel }: PortfolioFormProps) {
  const [item, setItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    content: '',
    image_url: '',
    github_url: '',
    demo_url: '',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');

  // Effect to sync itemToEdit to internal state
  useEffect(() => {
    if (itemToEdit) {
      setItem(itemToEdit);
      setTagsInput(itemToEdit.tags.join(', '));
    } else {
      // Reset form for creation
      setItem({
        title: '',
        description: '',
        content: '',
        image_url: '',
        github_url: '',
        demo_url: '',
        tags: [],
      });
      setTagsInput('');
    }
  }, [itemToEdit]);
  
  const handleUrlChange = (name: string, url: string) => {
    setItem(prev => ({ ...prev, [name]: url }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleMdeChange = (value: string | undefined) => {
    setItem(prev => ({ ...prev, content: value || '' }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setItem(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-400">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={item.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
       <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
        <textarea
          name="description"
          id="description"
          value={item.description}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
       <div data-color-mode="dark">
        <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">Content (Markdown)</label>
         <MDEditor
            value={item.content}
            onChange={handleMdeChange}
            preview="edit"
            height={300}
        />
      </div>
      
      <ImageUploadField
        label="Image URL"
        name="image_url"
        value={item.image_url}
        onUrlChange={handleUrlChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-gray-400">GitHub URL</label>
          <input
            type="url"
            name="github_url"
            id="github_url"
            value={item.github_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="demo_url" className="block text-sm font-medium text-gray-400">Demo URL</label>
          <input
            type="url"
            name="demo_url"
            id="demo_url"
            value={item.demo_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
       <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-400">Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          id="tags"
          value={tagsInput}
          onChange={handleTagsChange}
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
          Save
        </button>
      </div>
    </form>
  );
}
