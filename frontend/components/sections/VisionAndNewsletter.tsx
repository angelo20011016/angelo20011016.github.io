"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faNewspaper, faSpinner } from '@fortawesome/free-solid-svg-icons';

const VisionAndNewsletter: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const visionTextRef = useRef(null);
  const sideProjectCardRef = useRef(null);
  const newsletterCardRef = useRef(null);

  const [email, setEmail] = useState('');
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
    gsap.fromTo(visionTextRef.current,
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
    gsap.fromTo(sideProjectCardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=100',
          toggleActions: 'play none none reverse',
        }
      }
    );
    gsap.fromTo(newsletterCardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=100',
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
      const response = await fetch('http://localhost:8000/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'frontend_about_page' }), // Add source
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setStatusMessage(data.message || '訂閱成功！感謝您的支持。');
        setEmail(''); // Clear email input on success
      } else {
        setIsSuccess(false);
        setStatusMessage(data.detail || data.message || '訂閱失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('訂閱請求失敗:', error);
      setIsSuccess(false);
      setStatusMessage('連接伺服器時出錯，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto flex flex-col items-center py-16 px-8 text-white">
      <h2 ref={titleRef} className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">
        我的願景
      </h2>
      
      <p ref={visionTextRef} className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed mb-12 max-w-2xl">
        我希望通過這個網站分享我的學習旅程，並為其他有相似興趣的人提供實用的資源和工具。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div ref={sideProjectCardRef} className="bg-zinc-900 p-8 rounded-lg shadow-lg flex flex-col items-start text-left">
          <FontAwesomeIcon icon={faRocket} className="text-white text-4xl mb-4" />
          <h3 className="font-mono text-2xl font-bold mb-3 uppercase text-shadow-lg">Side Project 平台</h3>
          <p className="font-inter text-gray-300 text-lg">
            打造一個開放的平台，提供各種實用的小工具和解決方案，幫助有需要的人解決實際問題。
          </p>
        </div>
        
        <div ref={newsletterCardRef} className="bg-zinc-900 p-8 rounded-lg shadow-lg flex flex-col items-start text-left">
          <FontAwesomeIcon icon={faNewspaper} className="text-white text-4xl mb-4" />
          <h3 className="font-mono text-2xl font-bold mb-3 uppercase text-shadow-lg">電子報</h3>
          <p className="font-inter text-gray-300 text-lg mb-6">
            分享學習心得、技術見解和有價值的資源，建立一個持續學習和成長的社群。
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <input
              type="email"
              id="newsletter-email"
              name="newsletter-email"
              placeholder="您的電子郵件"
              className="px-4 py-3 border border-zinc-700 rounded-md bg-zinc-800 text-white placeholder-gray-500 focus:ring-white focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="submit"
              id="subscribe-btn"
              name="subscribe-btn"
              className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300 font-mono uppercase tracking-wider"
              disabled={loading}
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : ''}
              訂閱
            </button>
            {statusMessage && (
              <div
                id="subscription-status"
                className={`mt-2 text-sm text-center ${isSuccess ? 'text-green-400' : 'text-red-400'}`}
                role="status"
              >
                {statusMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisionAndNewsletter;