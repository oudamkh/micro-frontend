const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
  return null;
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export const userApi = {
  getUsers: () => apiRequest('/users'),
  getUser: (id: string) => apiRequest(`/users/${id}`),
  createUser: (data: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id: string, data: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id: string) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

export const roleApi = {
  getRoles: () => apiRequest('/roles'),
  getRole: (id: string) => apiRequest(`/roles/${id}`),
  createRole: (data: any) => apiRequest('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRole: (id: string, data: any) => apiRequest(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRole: (id: string) => apiRequest(`/roles/${id}`, {
    method: 'DELETE',
  }),
};