"use client";

import React, { useState, useEffect } from 'react';
import { SiteSettings, getSiteSettings, updateSiteSettings } from '../../services/staticContentService';
import { toast } from 'react-toastify';

const SiteSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load site settings.");
        toast.error(err.message || "Failed to load site settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedSettings = await updateSiteSettings(settings, token);
      setSettings(updatedSettings);
      toast.success("Site settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update site settings.");
      toast.error(err.message || "Failed to update site settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading site settings...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="text-center text-gray-500">No site settings available.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Site General Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <h3 className="text-xl font-bold text-white mt-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contact_email" className="block text-gray-300 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={settings.contact_email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="contact_phone" className="block text-gray-300 text-sm font-bold mb-2">Phone:</label>
            <input
              type="text"
              id="contact_phone"
              name="contact_phone"
              value={settings.contact_phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="contact_location" className="block text-gray-300 text-sm font-bold mb-2">Location:</label>
            <input
              type="text"
              id="contact_location"
              name="contact_location"
              value={settings.contact_location}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="social_github" className="block text-gray-300 text-sm font-bold mb-2">GitHub URL:</label>
            <input
              type="url"
              id="social_github"
              name="social_github"
              value={settings.social_github}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="social_instagram" className="block text-gray-300 text-sm font-bold mb-2">Instagram URL:</label>
            <input
              type="url"
              id="social_instagram"
              name="social_instagram"
              value={settings.social_instagram}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="social_youtube" className="block text-gray-300 text-sm font-bold mb-2">YouTube URL:</label>
            <input
              type="url"
              id="social_youtube"
              name="social_youtube"
              value={settings.social_youtube}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Section Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="portfolio_title" className="block text-gray-300 text-sm font-bold mb-2">Portfolio Title:</label>
            <input
              type="text"
              id="portfolio_title"
              name="portfolio_title"
              value={settings.portfolio_title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="blog_title" className="block text-gray-300 text-sm font-bold mb-2">Blog Title:</label>
            <input
              type="text"
              id="blog_title"
              name="blog_title"
              value={settings.blog_title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="portfolio_subtitle" className="block text-gray-300 text-sm font-bold mb-2">Portfolio Subtitle:</label>
            <input
              type="text"
              id="portfolio_subtitle"
              name="portfolio_subtitle"
              value={settings.portfolio_subtitle}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            {submitting ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsForm;
