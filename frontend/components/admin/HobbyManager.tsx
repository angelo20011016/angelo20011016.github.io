"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getHobbies, createHobby, updateHobby, deleteHobby, Hobby } from '../../services/hobbyService';
import HobbyForm from './HobbyForm';
import Modal from '../common/Modal';

export default function HobbyManager() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Hobby | null>(null);

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    try {
      setLoading(true);
      const data = await getHobbies();
      setHobbies(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalForCreate = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (item: Hobby) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSave = async (hobbyData: Omit<Hobby, 'id' | '_id'>) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      const id = itemToEdit?.id || itemToEdit?._id;
      if (id) {
        await updateHobby(id, hobbyData, token);
        toast.success("Hobby updated successfully!");
      } else {
        await createHobby(hobbyData, token);
        toast.success("Hobby created successfully!");
      }
      fetchHobbies();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hobby?")) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      await deleteHobby(id, token);
      toast.success("Hobby deleted successfully!");
      fetchHobbies();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) return <p>Loading hobbies...</p>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Hobbies</h2>
        <button
          onClick={handleOpenModalForCreate}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + Add New Hobby
        </button>
      </div>
      
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {hobbies.length > 0 ? (
              hobbies.map(item => {
                const itemId = item.id || item._id;
                return (
                  <tr key={itemId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.icon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 truncate max-w-xs">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModalForEdit(item)} className="text-indigo-400 hover:text-indigo-600 mr-4">Edit</button>
                      <button onClick={() => handleDelete(itemId!)} className="text-red-400 hover:text-red-600">Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hobbies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={itemToEdit ? "Edit Hobby" : "Add New Hobby"}>
          <HobbyForm
            itemToEdit={itemToEdit}
            onSave={handleSave}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
