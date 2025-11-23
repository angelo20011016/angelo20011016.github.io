"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminProfile } from '@/services/authService';

import PortfolioManager from '@/components/admin/PortfolioManager';
import BlogManager from '@/components/admin/BlogManager'; // Import BlogManager

interface UserProfile {
  email: string;
  nickname: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userProfile = await getAdminProfile(token);
        setProfile(userProfile);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile. Your session may have expired.');
        // Optional: clear token if it's invalid
        localStorage.removeItem('authToken');
        setTimeout(() => router.replace('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
            <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
                Logout
            </button>
        </div>
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-md">
            <p>Error: {error}</p>
          </div>
        )}
        {profile && (
          <div className="p-6 space-y-2 bg-gray-800/50 rounded-md">
            <h3 className="text-xl font-semibold">Welcome, {profile.nickname}!</h3>
            <p className="text-gray-400">Email: {profile.email}</p>
          </div>
        )}
        
        {/* Portfolio Management Section */}
        <PortfolioManager />

        {/* Blog Management Section */}
        <BlogManager />
      </div>
    </div>
  );
}
