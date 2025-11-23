"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import BlogForm from '@/components/admin/BlogForm'; // Import the new BlogForm
// Assume blogService exists with similar functions to portfolioService
import { getBlogPostsAdmin, deleteBlogPost, createBlogPost, updateBlogPost } from '@/services/blogService'; 

// Define the type for a blog post item based on the backend model
interface BlogPostItem {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  cover_image?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

export default function BlogManager() {
  const [items, setItems] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPostItem | null>(null);

  const fetchItems = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError('You are not authenticated. Please log in again.');
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      // Assuming getBlogPostsAdmin fetches all posts including unpublished ones for admin
      const blogPosts = await getBlogPostsAdmin(token); // Pass the token here
      setItems(blogPosts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: BlogPostItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (cleanItemData: Omit<BlogPostItem, 'id' | 'created_at' | 'updated_at'>) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    try {
      if (editingItem && (editingItem.id || (editingItem as any)._id)) {
        const itemId = editingItem.id || (editingItem as any)._id;
        await updateBlogPost(itemId, cleanItemData, token);
      } else {
        await createBlogPost(cleanItemData, token);
      }
      handleCloseModal();
      await fetchItems(); // Refresh data
    } catch (err: any) {
      let detail = 'Failed to save item.';
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          detail = JSON.stringify(parsed);
        } catch {
          detail = err.message;
        }
      }
      setError(detail);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    try {
      await deleteBlogPost(id, token);
      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete item.');
    }
  };

  if (loading && items.length === 0) {
    return <div className="text-center text-gray-400">Loading blog posts...</div>;
  }

  return (
    <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Manage Blog Posts</h3>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          + Add New Post
        </button>
      </div>

      {error && <div className="my-4 text-center text-red-400 bg-red-900/20 p-3 rounded-md">Error: {error}</div>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Published</th>
              <th scope="col" className="px-6 py-3">Tags</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id || index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {item.title}
                  </th>
                  <td className="px-6 py-4">
                    {item.is_published ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Published</span>
                    ) : (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, tagIndex) => (
                        <span key={`${item.id}-${tag}-${tagIndex}`} className="px-2 py-1 text-xs bg-gray-600 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(item)} className="font-medium text-blue-500 hover:underline">Edit</button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="font-medium text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">No blog posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Blog Post' : 'Add New Blog Post'}>
        <BlogForm 
          itemToEdit={editingItem}
          onSave={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
