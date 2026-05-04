"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Magnetic from '../common/Magnetic';
import { API_BASE_URL } from '../../services/authService';

const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateLocalTime = () => {
      setLocalTime(new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Taipei',
      }));
    };

    updateLocalTime();
    const intervalId = window.setInterval(updateLocalTime, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contactme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setStatusMessage(data.message || 'SUCCESS!');
        setName(''); setEmail(''); setMessage('');
      } else {
        setIsSuccess(false);
        setStatusMessage(data.detail || 'ERROR');
      }
    } catch {
      setIsSuccess(false);
      setStatusMessage('SERVER ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative w-full bg-[#1c1d20] text-white flex flex-col overflow-hidden pt-32">
      {/* Main Content */}
      <div className="w-full px-6 md:px-12 lg:px-24 mb-32">
        <div className="max-w-7xl mx-auto flex flex-col gap-20">
          
          {/* Top: Massive Title */}
          <div className="border-b border-white/10 pb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-7xl md:text-8xl lg:text-[12rem] font-mono font-bold uppercase tracking-tighter leading-none"
            >
              Contact
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left: Contact Info */}
            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-white/60 font-mono text-sm uppercase tracking-widest font-bold">Get in touch</p>
                <p className="text-2xl md:text-3xl font-mono uppercase tracking-tight">angelo@example.com</p>
                <p className="text-2xl md:text-3xl font-mono uppercase tracking-tight">+886 912 345 678</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-white/60 font-mono text-sm uppercase tracking-widest font-bold">Location</p>
                <p className="text-2xl md:text-3xl font-mono uppercase tracking-tight">Taipei, Taiwan</p>
              </div>
            </div>

            {/* Right: Simple Form */}
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-2">
                  <label className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">01 / What&apos;s your name?</label>
                  <input
                    type="text"
                    placeholder="NAME"
                    className="w-full bg-transparent border-b border-white/20 py-4 outline-none text-2xl md:text-3xl font-mono uppercase focus:border-white transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">02 / What&apos;s your email?</label>
                  <input
                    type="email"
                    placeholder="EMAIL"
                    className="w-full bg-transparent border-b border-white/20 py-4 outline-none text-2xl md:text-3xl font-mono uppercase focus:border-white transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">03 / Your message</label>
                  <textarea
                    placeholder="MESSAGE"
                    rows={4}
                    className="w-full bg-transparent border-b border-white/20 py-4 outline-none text-2xl md:text-3xl font-mono uppercase focus:border-white transition-colors resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 pt-6">
                  {statusMessage && (
                    <p className={`font-mono text-base uppercase tracking-widest ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                      {statusMessage}
                    </p>
                  )}
                  
                  <Magnetic>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-white text-black font-mono font-bold uppercase text-sm tracking-widest hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center text-center px-4"
                    >
                      {loading ? 'Sending' : 'Send'}
                    </button>
                  </Magnetic>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Area */}
      <div className="w-full px-6 md:px-12 lg:px-24 py-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-16 bg-black/40">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <p className="text-white/50 font-mono text-sm md:text-base uppercase tracking-[0.3em] font-bold">Socials</p>
            <div className="flex flex-wrap gap-8 md:gap-12 font-mono text-lg md:text-xl uppercase tracking-[0.1em]">
              <a href="https://github.com/angeloange?tab=repositories" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary">GitHub</a>
              <a href="https://www.instagram.com/angelo__1016/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary">Instagram</a>
              <a href="https://www.youtube.com/@Happywecan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary">YouTube</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-16 font-mono text-sm md:text-base uppercase tracking-[0.1em] text-white/40">
            <p>© 2026 Angelo — Created with Passion</p>
            <p>Built with Next.js & GSAP</p>
          </div>
        </div>
        
        <div className="text-left md:text-right flex flex-col gap-6">
          <p className="text-white/50 font-mono text-sm md:text-base uppercase tracking-[0.3em] font-bold">Local Time</p>
          <p className="font-mono text-xl md:text-2xl uppercase tracking-widest">
            {localTime ? `${localTime} TPE` : 'TPE'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
