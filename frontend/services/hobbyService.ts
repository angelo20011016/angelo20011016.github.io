// Note: In a real application, the API base URL should be in an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Hobby {
  id?: string;
  _id?: string;
  name: string;
  icon: string;
  description?: string;
}

export async function getHobbies(): Promise<Hobby[]> {
  const response = await fetch(`${API_BASE_URL}/api/hobbies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch hobbies');
  }
  return response.json();
}

export async function createHobby(hobby: Omit<Hobby, 'id' | '_id'>, token: string): Promise<Hobby> {
  const response = await fetch(`${API_BASE_URL}/api/hobbies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(hobby),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create hobby');
  }
  return response.json();
}

export async function updateHobby(id: string, hobby: Omit<Hobby, 'id' | '_id'>, token: string): Promise<Hobby> {
  const response = await fetch(`${API_BASE_URL}/api/hobbies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(hobby),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update hobby');
  }
  return response.json();
}

export async function deleteHobby(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/hobbies/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to delete hobby');
  }
}
