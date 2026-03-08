"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSkills, createSkill, updateSkill, deleteSkill, Skill } from '../../services/skillService';
import SkillForm from './SkillForm';
import Modal from '../common/Modal'; // Using the existing Modal for the form

export default function SkillManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(data);
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

  const handleOpenModalForEdit = (item: Skill) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSave = async (skillData: Omit<Skill, 'id'>) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      const id = itemToEdit?.id || itemToEdit?._id;
      if (id) {
        // Update existing item
        await updateSkill(id, skillData, token);
        toast.success("Skill updated successfully!");
      } else {
        // Create new item
        await createSkill(skillData, token);
        toast.success("Skill created successfully!");
      }
      fetchSkills(); // Refresh the list
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      await deleteSkill(id, token);
      toast.success("Skill deleted successfully!");
      fetchSkills(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };
  
  if (loading) return <p>Loading skills...</p>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Skills</h2>
        <button
          onClick={handleOpenModalForCreate}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + Add New Skill
        </button>
      </div>
      
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Main Skill</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sub-Skills</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {skills.length > 0 ? (
              skills.map(item => {
                const itemId = item.id || item._id;
                return (
                <tr key={itemId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.main}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.icon}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.subSkills.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModalForEdit(item)} className="text-indigo-400 hover:text-indigo-600 mr-4">Edit</button>
                    <button onClick={() => handleDelete(itemId!)} className="text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No skills found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={itemToEdit ? "Edit Skill" : "Add New Skill"}>
          <SkillForm
            itemToEdit={itemToEdit}
            onSave={handleSave}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}