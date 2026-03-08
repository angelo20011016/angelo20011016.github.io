"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../services/authService';

// Import the new Markdown editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Sub-component for handling image uploads (copied for now, consider sharing later)
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


// Interface for Blog Post Item - derived from backend model
interface BlogPostItem {
    id?: string;
    title: string;
    subtitle?: string;
    content?: string;
    cover_image?: string;
    tags: string[];
    is_published: boolean;
    published_at?: string; // Using string for simplicity in form, convert to Date when sending
    created_at?: string;
    updated_at?: string;
}

interface BlogFormProps {
  itemToEdit?: BlogPostItem | null;
  onSave: (item: BlogPostItem) => void;
  onCancel: () => void;
}

export default function BlogForm({ itemToEdit, onSave, onCancel }: BlogFormProps) {
  const [item, setItem] = useState<BlogPostItem>({
    title: '',
    subtitle: '',
    content: '',
    cover_image: '',
    tags: [],
    is_published: false,
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setItem({
        ...itemToEdit,
        // Ensure published_at is a string if it exists for the form, then convert on save
        published_at: itemToEdit.published_at ? new Date(itemToEdit.published_at).toISOString().split('T')[0] : ''
      });
      setTagsInput(itemToEdit.tags.join(', '));
    } else {
      // Reset form for creation
      setItem({
        title: '',
        subtitle: '',
        content: '',
        cover_image: '',
        tags: [],
        is_published: false,
      });
      setTagsInput('');
    }
  }, [itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (name: string, url: string) => {
    setItem(prev => ({ ...prev, [name]: url }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setItem(prev => ({ ...prev, [name]: checked }));
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
    const dataToSend = { ...item };
    // Explicitly remove id, as it's handled by URL param for updates and generated by backend for creates
    if (dataToSend.id) {
        delete dataToSend.id;
    }
    // Adjust published_at for backend if needed
    if (dataToSend.is_published && dataToSend.published_at) {
        // Convert YYYY-MM-DD to ISO string if it's not already
        dataToSend.published_at = new Date(dataToSend.published_at).toISOString();
    } else if (dataToSend.is_published && !dataToSend.published_at) {
        // If published but no date set, set to now
        dataToSend.published_at = new Date().toISOString();
    } else {
        dataToSend.published_at = undefined; // Ensure not sent if unpublished
    }

    onSave(dataToSend);
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
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-400">Subtitle</label>
        <input
          type="text"
          name="subtitle"
          id="subtitle"
          value={item.subtitle || ''}
          onChange={handleChange}
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
        label="Cover Image URL"
        name="cover_image"
        value={item.cover_image}
        onUrlChange={handleUrlChange}
      />

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
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="is_published"
          id="is_published"
          checked={item.is_published}
          onChange={handleCheckboxChange}
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-gray-400">Published</label>
      </div>
      {item.is_published && (
        <div>
          <label htmlFor="published_at" className="block text-sm font-medium text-gray-400">Published At</label>
          <input
            type="date"
            name="published_at"
            id="published_at"
            value={item.published_at || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
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