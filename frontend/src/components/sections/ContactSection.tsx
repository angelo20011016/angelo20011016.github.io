"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ContactSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=200',
          toggleActions: 'play none none reverse',
        }
      }
    );

    gsap.fromTo(formRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=150',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/contactme', {
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
    <section ref={sectionRef} id="contact" className="min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-950 text-white">
      <h2 ref={titleRef} className="font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide text-center">
        聯絡我
      </h2>
      <div ref={formRef} className="w-full max-w-md bg-zinc-900 rounded-lg shadow-lg p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-300 mb-2 font-inter">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500"
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
              className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500"
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
              type="text" // Change type to text as textarea doesn't have type
              id="message"
              name="message"
              rows={5}
              className="mt-1 block w-full px-4 py-3 border border-zinc-700 rounded-md shadow-sm focus:ring-white focus:border-white bg-zinc-800 text-white placeholder-gray-500"
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
    </section>
  );
};

export default ContactSection;
