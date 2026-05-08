"use client";

import React, { useState, useEffect } from 'react';
import { SiteSettings, getSiteSettings, updateSiteSettings } from '../../services/staticContentService';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../services/authService';

const ImageUploadField = ({ label, value, name, onUrlChange }: { label: string, value?: string, name: string, onUrlChange: (name: string, url: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
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
        throw new Error(errorData.detail || 'File upload failed');
      }

      const data = await response.json();
      onUrlChange(name, data.file_path);
      toast.success("Image uploaded successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload image.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          id={name}
          name={name}
          value={value || ''}
          onChange={(event) => onUrlChange(name, event.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
          placeholder="/static/uploads/example.jpg"
        />
        <label className={`cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

type SiteSettingsStringKey = keyof Pick<
  SiteSettings,
  | 'nav_brand_primary'
  | 'nav_brand_secondary'
  | 'nav_mobile_caption'
  | 'nav_home_label'
  | 'nav_about_label'
  | 'nav_skills_label'
  | 'nav_portfolio_label'
  | 'nav_blog_label'
  | 'nav_contact_label'
  | 'intro_splash_keywords'
  | 'stat_1_value'
  | 'stat_1_label'
  | 'stat_2_value'
  | 'stat_2_label'
  | 'stat_3_value'
  | 'stat_3_label'
  | 'focus_1_label'
  | 'focus_1_title'
  | 'focus_1_body'
  | 'focus_2_label'
  | 'focus_2_title'
  | 'focus_2_body'
  | 'focus_3_label'
  | 'focus_3_title'
  | 'focus_3_body'
  | 'skills_eyebrow'
  | 'skills_title'
  | 'skills_stack_label'
  | 'skills_core_stack'
  | 'skills_default_description'
  | 'skills_frontend_description'
  | 'skills_backend_description'
  | 'skills_collaboration_description'
  | 'skills_analytics_description'
  | 'portfolio_kicker'
  | 'portfolio_empty_eyebrow'
  | 'portfolio_empty_title'
  | 'portfolio_empty_body'
  | 'portfolio_item_button_label'
  | 'portfolio_default_tag'
  | 'blog_subtitle'
  | 'blog_empty_eyebrow'
  | 'blog_empty_title'
  | 'blog_empty_body'
  | 'blog_item_button_label'
  | 'blog_draft_label'
  | 'detail_blog_back_label'
  | 'detail_blog_eyebrow'
  | 'detail_blog_not_found'
  | 'detail_portfolio_back_label'
  | 'detail_portfolio_eyebrow'
  | 'detail_portfolio_not_found'
  | 'contact_title'
  | 'contact_intro_label'
  | 'contact_location_label'
  | 'contact_name_label'
  | 'contact_name_placeholder'
  | 'contact_email_label'
  | 'contact_email_placeholder'
  | 'contact_message_label'
  | 'contact_message_placeholder'
  | 'contact_submit_label'
  | 'contact_submitting_label'
  | 'contact_socials_label'
  | 'contact_footer_note'
  | 'contact_footer_stack'
  | 'contact_local_time_label'
>;

type SiteSettingsBooleanKey = keyof Pick<
  SiteSettings,
  | 'section_hero_enabled'
  | 'section_about_enabled'
  | 'section_skills_enabled'
  | 'section_portfolio_enabled'
  | 'section_blog_enabled'
  | 'section_contact_enabled'
  | 'intro_splash_enabled'
>;

type SiteSettingsNumberKey = keyof Pick<
  SiteSettings,
  | 'section_hero_order'
  | 'section_about_order'
  | 'section_skills_order'
  | 'section_portfolio_order'
  | 'section_blog_order'
  | 'section_contact_order'
>;

const statGroups: Array<{ index: number; valueKey: SiteSettingsStringKey; labelKey: SiteSettingsStringKey }> = [
  { index: 1, valueKey: 'stat_1_value', labelKey: 'stat_1_label' },
  { index: 2, valueKey: 'stat_2_value', labelKey: 'stat_2_label' },
  { index: 3, valueKey: 'stat_3_value', labelKey: 'stat_3_label' },
];

const focusGroups: Array<{ index: number; labelKey: SiteSettingsStringKey; titleKey: SiteSettingsStringKey; bodyKey: SiteSettingsStringKey }> = [
  { index: 1, labelKey: 'focus_1_label', titleKey: 'focus_1_title', bodyKey: 'focus_1_body' },
  { index: 2, labelKey: 'focus_2_label', titleKey: 'focus_2_title', bodyKey: 'focus_2_body' },
  { index: 3, labelKey: 'focus_3_label', titleKey: 'focus_3_title', bodyKey: 'focus_3_body' },
];

const navFields: Array<{ key: SiteSettingsStringKey; label: string }> = [
  { key: 'nav_brand_primary', label: 'Brand Primary' },
  { key: 'nav_brand_secondary', label: 'Brand Hover / Secondary' },
  { key: 'nav_home_label', label: 'Home Label' },
  { key: 'nav_about_label', label: 'About Label' },
  { key: 'nav_skills_label', label: 'Skills Label' },
  { key: 'nav_portfolio_label', label: 'Portfolio Label' },
  { key: 'nav_blog_label', label: 'Blog Label' },
  { key: 'nav_contact_label', label: 'Contact Label' },
];

const skillsFields: Array<{ key: SiteSettingsStringKey; label: string; textarea?: boolean }> = [
  { key: 'skills_eyebrow', label: 'Skills Eyebrow' },
  { key: 'skills_title', label: 'Skills Title' },
  { key: 'skills_stack_label', label: 'Stack Label' },
  { key: 'skills_core_stack', label: 'Core Stack (comma-separated)' },
  { key: 'skills_default_description', label: 'Default Category Description', textarea: true },
  { key: 'skills_frontend_description', label: 'Frontend Description', textarea: true },
  { key: 'skills_backend_description', label: 'Backend Description', textarea: true },
  { key: 'skills_collaboration_description', label: 'Collaboration Description', textarea: true },
  { key: 'skills_analytics_description', label: 'Analytics Description', textarea: true },
];

const portfolioCopyFields: Array<{ key: SiteSettingsStringKey; label: string; textarea?: boolean }> = [
  { key: 'portfolio_kicker', label: 'Portfolio Kicker' },
  { key: 'portfolio_empty_eyebrow', label: 'Empty Eyebrow' },
  { key: 'portfolio_empty_title', label: 'Empty Title' },
  { key: 'portfolio_empty_body', label: 'Empty Body', textarea: true },
  { key: 'portfolio_item_button_label', label: 'Item Button Label' },
  { key: 'portfolio_default_tag', label: 'Default Tag' },
];

const blogCopyFields: Array<{ key: SiteSettingsStringKey; label: string; textarea?: boolean }> = [
  { key: 'blog_subtitle', label: 'Blog Subtitle', textarea: true },
  { key: 'blog_empty_eyebrow', label: 'Empty Eyebrow' },
  { key: 'blog_empty_title', label: 'Empty Title' },
  { key: 'blog_empty_body', label: 'Empty Body', textarea: true },
  { key: 'blog_item_button_label', label: 'Item Button Label' },
  { key: 'blog_draft_label', label: 'Draft Label' },
];

const detailCopyFields: Array<{ key: SiteSettingsStringKey; label: string }> = [
  { key: 'detail_blog_back_label', label: 'Blog Back Label' },
  { key: 'detail_blog_eyebrow', label: 'Blog Eyebrow' },
  { key: 'detail_blog_not_found', label: 'Blog Not Found' },
  { key: 'detail_portfolio_back_label', label: 'Portfolio Back Label' },
  { key: 'detail_portfolio_eyebrow', label: 'Portfolio Eyebrow' },
  { key: 'detail_portfolio_not_found', label: 'Portfolio Not Found' },
];

const contactCopyFields: Array<{ key: SiteSettingsStringKey; label: string }> = [
  { key: 'contact_title', label: 'Contact Title' },
  { key: 'contact_intro_label', label: 'Intro Label' },
  { key: 'contact_location_label', label: 'Location Label' },
  { key: 'contact_name_label', label: 'Name Field Label' },
  { key: 'contact_name_placeholder', label: 'Name Placeholder' },
  { key: 'contact_email_label', label: 'Email Field Label' },
  { key: 'contact_email_placeholder', label: 'Email Placeholder' },
  { key: 'contact_message_label', label: 'Message Field Label' },
  { key: 'contact_message_placeholder', label: 'Message Placeholder' },
  { key: 'contact_submit_label', label: 'Submit Label' },
  { key: 'contact_submitting_label', label: 'Submitting Label' },
  { key: 'contact_socials_label', label: 'Socials Label' },
  { key: 'contact_footer_note', label: 'Footer Note' },
  { key: 'contact_footer_stack', label: 'Footer Stack' },
  { key: 'contact_local_time_label', label: 'Local Time Label' },
];

const homepageSections: Array<{
  id: string;
  label: string;
  enabledKey: SiteSettingsBooleanKey;
  orderKey: SiteSettingsNumberKey;
}> = [
  { id: 'hero', label: 'Hero', enabledKey: 'section_hero_enabled', orderKey: 'section_hero_order' },
  { id: 'about', label: 'About', enabledKey: 'section_about_enabled', orderKey: 'section_about_order' },
  { id: 'skills', label: 'Skills', enabledKey: 'section_skills_enabled', orderKey: 'section_skills_order' },
  { id: 'portfolio', label: 'Portfolio', enabledKey: 'section_portfolio_enabled', orderKey: 'section_portfolio_order' },
  { id: 'blog', label: 'Blog', enabledKey: 'section_blog_enabled', orderKey: 'section_blog_order' },
  { id: 'contact', label: 'Contact', enabledKey: 'section_contact_enabled', orderKey: 'section_contact_order' },
];

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load site settings.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : type === 'number'
        ? Number((e.target as HTMLInputElement).value)
        : e.target.value;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleUrlChange = (name: string, value: string) => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update site settings.";
      setError(message);
      toast.error(message);
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

  const renderSettingField = ({ key, label, textarea = false }: { key: SiteSettingsStringKey; label: string; textarea?: boolean }) => (
    <div key={key} className={textarea ? 'md:col-span-2' : ''}>
      <label htmlFor={key} className="block text-gray-300 text-sm font-bold mb-2">{label}:</label>
      {textarea ? (
        <textarea
          id={key}
          name={key}
          value={settings[key] || ''}
          onChange={handleChange}
          rows={3}
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
        />
      ) : (
        <input
          type="text"
          id={key}
          name={key}
          value={settings[key] || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
        />
      )}
    </div>
  );

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

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Navigation Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navFields.map(renderSettingField)}
          <div className="md:col-span-2">
            {renderSettingField({ key: 'nav_mobile_caption', label: 'Mobile Menu Caption', textarea: true })}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Visitor Intro Splash</h3>
        <p className="text-sm text-gray-400">
          Shows a black keyword intro once per visitor per day before the public site appears.
        </p>
        <div className="grid grid-cols-1 gap-4 rounded bg-gray-900/40 p-4 md:grid-cols-[auto_1fr] md:items-start">
          <label className="flex items-center gap-3 text-sm font-bold text-gray-300">
            <input
              type="checkbox"
              name="intro_splash_enabled"
              checked={Boolean(settings.intro_splash_enabled)}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-600 bg-gray-700"
            />
            Enabled
          </label>
          <div>
            <label htmlFor="intro_splash_keywords" className="block text-gray-300 text-sm font-bold mb-2">Keywords:</label>
            <textarea
              id="intro_splash_keywords"
              name="intro_splash_keywords"
              value={settings.intro_splash_keywords || ''}
              onChange={handleChange}
              rows={2}
              placeholder="DX, 破格升職, 考績優異"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
            <p className="mt-2 text-xs text-gray-500">Separate keywords with commas. The animation uses the first few non-empty items.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Homepage Section Builder</h3>
        <p className="text-sm text-gray-400">
          Enable or hide homepage sections and set their display order. Lower numbers appear first.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {homepageSections.map((section) => (
            <div key={section.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded bg-gray-900/40 p-4 md:grid-cols-[1fr_auto_8rem]">
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">{section.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500">#{section.id}</p>
              </div>
              <label className="flex items-center gap-3 text-sm font-bold text-gray-300">
                <input
                  type="checkbox"
                  name={section.enabledKey}
                  checked={Boolean(settings[section.enabledKey])}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-600 bg-gray-700"
                />
                Enabled
              </label>
              <input
                type="number"
                min={1}
                max={99}
                name={section.orderKey}
                value={settings[section.orderKey] || 1}
                onChange={handleChange}
                className="col-span-2 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white md:col-span-1"
                aria-label={`${section.label} order`}
              />
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">About / Positioning</h3>
        <ImageUploadField
          label="About Photo:"
          name="about_image_url"
          value={settings.about_image_url}
          onUrlChange={handleUrlChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="about_eyebrow" className="block text-gray-300 text-sm font-bold mb-2">Eyebrow:</label>
            <input
              type="text"
              id="about_eyebrow"
              name="about_eyebrow"
              value={settings.about_eyebrow || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label htmlFor="about_photo_caption" className="block text-gray-300 text-sm font-bold mb-2">Photo Caption:</label>
            <input
              type="text"
              id="about_photo_caption"
              name="about_photo_caption"
              value={settings.about_photo_caption || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="about_title" className="block text-gray-300 text-sm font-bold mb-2">Positioning Title:</label>
            <input
              type="text"
              id="about_title"
              name="about_title"
              value={settings.about_title || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="about_summary" className="block text-gray-300 text-sm font-bold mb-2">Summary:</label>
            <textarea
              id="about_summary"
              name="about_summary"
              value={settings.about_summary || ''}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="about_body" className="block text-gray-300 text-sm font-bold mb-2">Body:</label>
            <textarea
              id="about_body"
              name="about_body"
              value={settings.about_body || ''}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">About Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statGroups.map(({ index, valueKey, labelKey }) => (
            <div key={index} className="grid grid-cols-1 gap-3 bg-gray-900/40 p-4 rounded">
              <label className="block text-gray-300 text-sm font-bold">Stat {index}</label>
              <input
                type="text"
                name={valueKey}
                value={settings[valueKey] || ''}
                onChange={handleChange}
                placeholder="Value"
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
              <input
                type="text"
                name={labelKey}
                value={settings[labelKey] || ''}
                onChange={handleChange}
                placeholder="Label"
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Focus Cards</h3>
        <div className="grid grid-cols-1 gap-4">
          {focusGroups.map(({ index, labelKey, titleKey, bodyKey }) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-900/40 p-4 rounded">
              <input
                type="text"
                name={labelKey}
                value={settings[labelKey] || ''}
                onChange={handleChange}
                placeholder={`Focus ${index} label`}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
              <input
                type="text"
                name={titleKey}
                value={settings[titleKey] || ''}
                onChange={handleChange}
                placeholder={`Focus ${index} title`}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
              <textarea
                name={bodyKey}
                value={settings[bodyKey] || ''}
                onChange={handleChange}
                rows={3}
                placeholder={`Focus ${index} body`}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Skills Section Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsFields.map(renderSettingField)}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Portfolio Section Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioCopyFields.map(renderSettingField)}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Blog Section Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogCopyFields.map(renderSettingField)}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Detail Page Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detailCopyFields.map(renderSettingField)}
        </div>

        <h3 className="text-xl font-bold text-white mt-4 border-t border-gray-600 pt-4">Contact Section Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactCopyFields.map(renderSettingField)}
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
