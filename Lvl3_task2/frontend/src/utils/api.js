import axios from 'axios';

// Priority: env var → window config → relative (for same-domain deploys)
const BASE_URL = process.env.REACT_APP_API_URL 
  || (window._env_ && window._env_.API_URL)
  || '/api';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

export const projectsAPI = {
  getAll: () => API.get('/projects'),
  getOne: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  addMember: (id, email) => API.post(`/projects/${id}/members`, { email }),
  getStats: (id) => API.get(`/projects/${id}/stats`),
};

export const tasksAPI = {
  getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
  getOne: (id) => API.get(`/tasks/${id}`),
  getMyTasks: () => API.get('/tasks/my/assigned'),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  addComment: (id, content) => API.post(`/tasks/${id}/comments`, { content }),
};

export default API;
