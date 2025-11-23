// Note: In a real application, the API base URL should be in an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Fetches all portfolio items.
 * This is a public endpoint and does not require a token.
 * @returns A list of portfolio items.
 */
export async function getPortfolioItems() {
  const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch portfolio items');
  }

  const data = await response.json();
  return data;
}

/**
 * Creates a new portfolio item.
 * This is a protected endpoint and requires a token.
 * @param item - The portfolio item data to create.
 * @param token - The JWT access token.
 */
export async function createPortfolioItem(item: Omit<any, 'id'>, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create portfolio item');
    }

    return await response.json();
}

/**
 * Updates an existing portfolio item.
 * This is a protected endpoint and requires a token.
 * @param id - The ID of the portfolio item to update.
 * @param item - The portfolio item data to update.
 * @param token - The JWT access token.
 */
export async function updatePortfolioItem(id: string, item: Omit<any, 'id'>, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update portfolio item');
    }

    return await response.json();
}

/**
 * Deletes a portfolio item.
 * This is a protected endpoint and requires a token.
 * @param id - The ID of the portfolio item to delete.
 * @param token - The JWT access token.
 */
export async function deletePortfolioItem(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete portfolio item');
    }

    // A 204 No Content response won't have a body to parse
    return response.status === 204;
}
