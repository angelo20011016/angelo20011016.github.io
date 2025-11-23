// Note: In a real application, the API base URL should be in an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8000';

// Define the type for a blog post item based on the backend model
interface BlogPostItem {
  id?: string;
  title: string;
  subtitle?: string;
  content?: string;
  cover_image?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string; 
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all blog posts for admin (including unpublished ones).
 * This is a protected endpoint and requires a token.
 * @param token - The JWT access token.
 * @returns A list of blog post items.
 */
export async function getBlogPostsAdmin(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/blog/all`, { // Admin endpoint
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch blog posts for admin');
  }

  const data = await response.json();
  return data;
}

/**
 * Creates a new blog post item.
 * This is a protected endpoint and requires a token.
 * @param item - The blog post item data to create.
 * @param token - The JWT access token.
 */
export async function createBlogPost(item: Omit<BlogPostItem, 'id' | 'created_at' | 'updated_at'>, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create blog post');
    }

    return await response.json();
}

/**
 * Updates an existing blog post item.
 * This is a protected endpoint and requires a token.
 * @param id - The ID of the blog post item to update.
 * @param item - The blog post item data to update.
 * @param token - The JWT access token.
 */
export async function updateBlogPost(id: string, item: Omit<BlogPostItem, 'id' | 'created_at' | 'updated_at'>, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update blog post');
    }

    return await response.json();
}

/**
 * Deletes a blog post item.
 * This is a protected endpoint and requires a token.
 * @param id - The ID of the blog post item to delete.
 * @param token - The JWT access token.
 */
export async function deleteBlogPost(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete blog post');
    }

    // A 204 No Content response won't have a body to parse
    return response.status === 204;
}
