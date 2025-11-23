"use client";

import { useState, useEffect } from 'react';
import { getPortfolioItems, deletePortfolioItem, createPortfolioItem, updatePortfolioItem } from '@/services/portfolioService';
import Modal from '@/components/common/Modal';
import PortfolioForm from '@/components/admin/PortfolioForm';

// Define the type for a portfolio item based on the backend model
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  tags: string[];
  created_at: string;
}

export default function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const portfolioItems = await getPortfolioItems();
      setItems(portfolioItems);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolio items.');
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

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (cleanItemData: Omit<PortfolioItem, 'id' | 'created_at'>) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    try {
      // The 'cleanItemData' from the form no longer contains an 'id'.
      // We decide whether to update or create based on the 'editingItem' state.
      if (editingItem && (editingItem.id || editingItem._id)) {
        // Update existing item, using whichever id property exists
        const itemId = editingItem.id || editingItem._id;
        await updatePortfolioItem(itemId, cleanItemData, token);
      } else {
        // Create new item
        await createPortfolioItem(cleanItemData, token);
      }
      handleCloseModal();
      await fetchItems(); // Refresh data
    } catch (err: any) {
      // Try to get a more detailed error from the backend response
      let detail = 'Failed to save item.';
      if (err.message) {
        try {
          // The service throws the JSON error message, let's see if it's stringified JSON
          const parsed = JSON.parse(err.message);
          detail = JSON.stringify(parsed);
        } catch {
          // If not JSON, just use the message
          detail = err.message;
        }
      }
      setError(detail);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    try {
      await deletePortfolioItem(id, token);
      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete item.');
    }
  };

  if (loading && items.length === 0) {
    return <div className="text-center text-gray-400">Loading portfolio items...</div>;
  }

  return (
    <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Manage Portfolio</h3>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          + Add New Item
        </button>
      </div>

      {error && <div className="my-4 text-center text-red-400 bg-red-900/20 p-3 rounded-md">Error: {error}</div>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Description</th>
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
                  <td className="px-6 py-4 max-w-sm truncate">{item.description}</td>
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
                <td colSpan={4} className="px-6 py-4 text-center">No portfolio items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}>
        <PortfolioForm 
          itemToEdit={editingItem}
          onSave={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
