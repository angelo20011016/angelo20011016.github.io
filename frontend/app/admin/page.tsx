"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroContentForm from '@/components/admin/HeroContentForm';
import PortfolioManager from '@/components/admin/PortfolioManager';
import BlogManager from '@/components/admin/BlogManager';
import SkillManager from '@/components/admin/SkillManager';
import HobbyManager from '@/components/admin/HobbyManager';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      // Ideally, verify token validity with backend here
      setIsAdmin(true);
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading admin dashboard...</div>;
  }

  if (!isAdmin) {
    return null; // Or redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-mono">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors"
          >
            Logout
          </button>
        </div>

        <HeroContentForm />
        <PortfolioManager />
        <BlogManager />
        <SkillManager />
        <HobbyManager /> {/* Added HobbyManager */}

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
}
