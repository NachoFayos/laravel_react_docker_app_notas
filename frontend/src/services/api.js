import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 422) {
      // Validation errors
      throw new Error(
        Object.values(error.response.data.errors || {})
          .flat()
          .join(', ')
      )
    }
    throw new Error(error.response?.data?.message || error.message || 'An error occurred')
  }
)

export const notesApi = {
  // Get all notes with optional search
  getNotes: async (searchQuery = '', page = 1) => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (page > 1) params.append('page', page)
    
    const response = await api.get(`/notes?${params.toString()}`)
    return response.data
  },

  // Get single note
  getNote: async (id) => {
    const response = await api.get(`/notes/${id}`)
    return response.data
  },

  // Create new note
  createNote: async (noteData) => {
    const response = await api.post('/notes', noteData)
    return response.data
  },

  // Update existing note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData)
    return response.data
  },

  // Delete note
  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`)
    return response.data
  },

  // Health check
  checkHealth: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api