import axios from "axios";

/**
 * Axios instance pre-configured for the existing Express backend.
 *
 * Set VITE_API_URL in a .env file to point at your backend, e.g.
 *   VITE_API_URL=http://localhost:5000
 * If not set, requests go to the same origin (useful with a Vite proxy).
 */
export const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "",
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Clear local storage tokens/user data
      localStorage.removeItem("token"); 
      localStorage.removeItem("user"); 
      // 2. Force a reload to login, or redirect
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Attach the JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ---------------- Types ---------------- */

export interface Author {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  likes?: string[];
  comments: Comment[];
  category?: string;
  coverImage?: string;
  theme?: string;
  author?: Author | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

/* ---------------- Auth API ---------------- */

export async function registerUser(data: { name: string; email: string; password: string }) {
  const res = await api.post("/api/users/register", data);
  return res.data;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await api.post("/api/users/login", data);
  return res.data;
}

/* ---------------- Blog API ---------------- */

export async function getBlogs(): Promise<Blog[]> {
  const res = await api.get("/api/blogs");
  // Support both `[...]` and `{ blogs: [...] }` response shapes.
  const data = Array.isArray(res.data) ? res.data : (res.data?.blogs ?? []);
  console.log("[API] getBlogs response:", {
    totalBlogs: data.length,
    responseShape: Array.isArray(res.data) ? "array" : "object",
    firstBlogAuthorField: data[0]?.author,
    blogsWithoutAuthor: data.filter(b => !b.author).length,
  });
  return data;
}

export async function getBlog(id: string): Promise<Blog> {
  const res = await api.get(`/api/blogs/${id}`);
  return res.data?.blog ?? res.data;
}

export async function createBlog(data: Partial<Blog>) {
  const res = await api.post("/api/blogs", data);
  return res.data;
}

export async function updateBlog(id: string, data: Partial<Blog>) {
  const res = await api.put(`/api/blogs/${id}`, data);
  return res.data;
}

export async function deleteBlog(id: string) {
  const res = await api.delete(`/api/blogs/${id}`);
  return res.data;
}
export async function likeBlog(id: string) {
  const res = await api.put(`/api/blogs/${id}/like`);
  return res.data;
}
/* ---------------- Updated Blog API Endpoints ---------------- */

export const addComment = async (blogId: string, text: string) => {
  // 1. Switched to your pre-configured 'api' client
  // 2. Automatically gains the token interceptor and the base URL environment setup
  const res = await api.post(`/api/blogs/${blogId}/comments`, { text });
  return res.data;
};

/**
 * Deletes a specific comment from a blog post
 */
export const deleteComment = async (blogId: string, commentId: string): Promise<{ success: boolean }> => {
  // Fixed: Added missing '/api' prefix so it correctly routes to the backend
  const res = await api.delete<{ success: boolean }>(`/api/blogs/${blogId}/comments/${commentId}`);
  return res.data;
};

/* ---------------- Profile API ---------------- */

export async function getProfile(): Promise<User> {
  const res = await api.get("/api/profile");
  return res.data?.user ?? res.data;
}

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  avatar?: string;
}) {
  const res = await api.put("/api/profile", data);
  return res.data;
}