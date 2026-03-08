"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ScrollReveal } from '../common/ScrollReveal';

const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/contactme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setStatusMessage(data.message || '您的訊息已成功送出！');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setIsSuccess(false);
        setStatusMessage(data.detail || data.message || '訊息送出失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('聯絡表單提交失敗:', error);
      setIsSuccess(false);
      setStatusMessage('連接伺服器時出錯，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-transparent text-white">
      <ScrollReveal className="w-full flex justify-center">
        <h2 className="font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide text-center">
          聯絡我
        </h2>
      </ScrollReveal>
      
      <ScrollReveal className="w-full max-w-md" delay={0.3}>
        <div className="bg-zinc-900/90 backdrop-blur-md rounded-lg shadow-lg p-8 md:p-12 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-300 mb-2 font-inter">姓名</label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500 transition-colors"
                placeholder="您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-300 mb-2 font-inter">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500 transition-colors"
                placeholder="您的電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-lg font-medium text-gray-300 mb-2 font-inter">訊息</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500 transition-colors"
                placeholder="您想說些什麼？"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
              ></textarea>
            </div>
            {statusMessage && (
              <div
                className={`text-center p-3 rounded-md ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {statusMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300 font-mono uppercase tracking-wider"
              disabled={loading}
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : ''}
              送出訊息
            </button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ContactSection;
