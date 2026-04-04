// src/lib/config.js
// Central config — automatically uses the right backend URL
// In development: http://localhost:4000
// In production: your Render backend URL

const isDev = import.meta.env.DEV

export const API_BASE = isDev
  ? 'http://localhost:4000'
  : (import.meta.env.VITE_API_BASE_URL || 'https://launchai-server.onrender.com')

export default { API_BASE }
