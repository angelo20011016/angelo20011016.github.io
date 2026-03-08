import { API_BASE_URL } from './authService';

// Interface for a single skill item
export interface Skill {
  id?: string;
  _id?: string;
  main: string;
  icon: string;
  subSkills: string[];
}

// --- Functions for interacting with the /api/skills endpoint ---

/**
 * Fetches all skills from the backend.
 */
export async function getSkills(): Promise<Skill[]> {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch skills');
  }
  return response.json();
}

/**
 * Creates a new skill.
 * @param skill - The skill data to create.
 * @param token - The admin user's JWT.
 */
export async function createSkill(skill: Omit<Skill, 'id'>, token: string): Promise<Skill> {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(skill),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create skill');
  }
  return response.json();
}

/**
 * Updates an existing skill.
 * @param id - The ID of the skill to update.
 * @param skill - The new data for the skill.
 * @param token - The admin user's JWT.
 */
export async function updateSkill(id: string, skill: Omit<Skill, 'id'>, token: string): Promise<Skill> {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(skill),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update skill');
  }
  return response.json();
}

/**
 * Deletes a skill.
 * @param id - The ID of the skill to delete.
 * @param token - The admin user's JWT.
 */
export async function deleteSkill(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to delete skill');
  }
}
