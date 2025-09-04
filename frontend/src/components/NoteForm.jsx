import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import { notesApi } from '../services/api'

const NoteForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { setError } = useNotes()

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingNote, setLoadingNote] = useState(isEdit)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      loadNote()
    }
  }, [id, isEdit])

  const loadNote = async () => {
    setLoadingNote(true)
    try {
      const response = await notesApi.getNote(id)
      setFormData({
        title: response.data.title || '',
        content: response.data.content || ''
      })
    } catch (err) {
      setError(err.message)
      console.error('Error loading note:', err)
      navigate('/')
    } finally {
      setLoadingNote(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio'
    } else if (formData.title.length > 255) {
      errors.title = 'El título no puede exceder los 255 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim() || null
      }

      if (isEdit) {
        await notesApi.updateNote(id, noteData)
      } else {
        await notesApi.createNote(noteData)
      }

      navigate('/')
    } catch (err) {
      setError(err.message)
      console.error('Error saving note:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (loadingNote) {
    return (
      <div className="form-container">
        <div className="loading">Cargando nota...</div>
      </div>
    )
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{isEdit ? '✏️ Editar Nota' : '📝 Nueva Nota'}</h2>
        <Link to="/" className="btn btn-secondary">
          ← Volver a la lista
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Título <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.title ? 'error' : ''}`}
            placeholder="Escribe el título de tu nota..."
            maxLength="255"
            disabled={loading}
          />
          {validationErrors.title && (
            <div className="field-error">
              {validationErrors.title}
            </div>
          )}
          <div className="field-hint">
            {formData.title.length}/255 caracteres
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Contenido
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Escribe el contenido de tu nota..."
            rows="8"
            disabled={loading}
          />
          <div className="field-hint">
            Opcional - Puedes dejar este campo vacío
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              isEdit ? 'Actualizando...' : 'Creando...'
            ) : (
              isEdit ? 'Actualizar Nota' : 'Crear Nota'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteForm