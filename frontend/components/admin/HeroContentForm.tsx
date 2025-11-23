"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HeroSettings, getHeroSettings, updateHeroSettings } from '../../services/staticContentService';
import { toast } from 'react-toastify'; // Assuming toast notifications are available

// Dynamically import SimpleMdeReact as it's a client-side component
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });
import "easymde/dist/easymde.min.css"; // Import the SimpleMDE stylesheet

const HeroContentForm: React.FC = () => {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      setLoading(true);
      const data = await getHeroSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hero settings.");
      toast.error(err.message || "Failed to load hero settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleMdeChange = (value: string) => {
    setSettings(prev => prev ? { ...prev, hero_bio_content: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const token = localStorage.getItem('authToken'); // Get token from local storage
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedSettings = await updateHeroSettings(settings, token);
      setSettings(updatedSettings);
      toast.success("Hero settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update hero settings.");
      toast.error(err.message || "Failed to update hero settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading hero settings...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="text-center text-gray-500">No hero settings available.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Hero Section Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="hero_main_title" className="block text-gray-300 text-sm font-bold mb-2">Main Title:</label>
          <input
            type="text"
            id="hero_main_title"
            name="hero_main_title"
            value={settings.hero_main_title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="hero_subtitle" className="block text-gray-300 text-sm font-bold mb-2">Subtitle:</label>
          <input
            type="text"
            id="hero_subtitle"
            name="hero_subtitle"
            value={settings.hero_subtitle}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="hero_background_image_url" className="block text-gray-300 text-sm font-bold mb-2">Background Image URL:</label>
          <input
            type="text"
            id="hero_background_image_url"
            name="hero_background_image_url"
            value={settings.hero_background_image_url || ''}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="hero_personal_photo_url" className="block text-gray-300 text-sm font-bold mb-2">Personal Photo URL:</label>
          <input
            type="text"
            id="hero_personal_photo_url"
            name="hero_personal_photo_url"
            value={settings.hero_personal_photo_url || ''}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="hero_bio_content" className="block text-gray-300 text-sm font-bold mb-2">Bio Content (Markdown):</label>
          <SimpleMdeReact
            value={settings.hero_bio_content}
            onChange={handleMdeChange}
            options={{
              spellChecker: false,
              hideIcons: ["guide", "fullscreen", "side-by-side"],
              placeholder: "Write your biography here with Markdown...",
            }}
          />
        </div>
        <div>
          <label htmlFor="hero_button_1_label" className="block text-gray-300 text-sm font-bold mb-2">Button 1 Label:</label>
          <input
            type="text"
            id="hero_button_1_label"
            name="hero_button_1_label"
            value={settings.hero_button_1_label}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="hero_button_2_label" className="block text-gray-300 text-sm font-bold mb-2">Button 2 Label:</label>
          <input
            type="text"
            id="hero_button_2_label"
            name="hero_button_2_label"
            value={settings.hero_button_2_label}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          {submitting ? 'Saving...' : 'Save Hero Settings'}
        </button>
      </form>
    </div>
  );
};

export default HeroContentForm;
