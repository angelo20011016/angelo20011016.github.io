// Note: In a real application, the API base URL should be in an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Logs in a user.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The access token and token type.
 */
export async function login(email, password) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/admin/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to login');
  }

  const data = await response.json();
  return data;
}

/**
 * Fetches the current admin user's profile.
 * @param token - The JWT access token.
 * @returns The user's profile information.
 */
export async function getAdminProfile(token) {
  const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch profile');
  }

  const data = await response.json();
  return data;
}
