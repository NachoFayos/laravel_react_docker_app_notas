import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { NotesProvider } from '../../context/NotesContext'
import NoteForm from '../NoteForm'
import { notesApi } from '../../services/api'

// Mock the API
vi.mock('../../services/api', () => ({
  notesApi: {
    createNote: vi.fn(),
    updateNote: vi.fn(),
    getNote: vi.fn(),
  }
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}), // Default to new note mode
  }
})

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NotesProvider>
      {children}
    </NotesProvider>
  </BrowserRouter>
)

describe('NoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders new note form correctly', () => {
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    expect(screen.getByText('📝 Nueva Nota')).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contenido/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear nota/i })).toBeInTheDocument()
  })

  it('validates required title field', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /crear nota/i })
    const titleInput = screen.getByLabelText(/título/i)

    // Try to submit without title
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument()
    })

    // Verify API was not called
    expect(notesApi.createNote).not.toHaveBeenCalled()
  })

  it('creates note successfully with valid data', async () => {
    const user = userEvent.setup()
    const mockNote = {
      id: 1,
      title: 'Test Note',
      content: 'Test content'
    }

    notesApi.createNote.mockResolvedValueOnce({
      data: mockNote,
      message: 'Nota creada exitosamente.'
    })

    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/título/i)
    const contentInput = screen.getByLabelText(/contenido/i)
    const submitButton = screen.getByRole('button', { name: /crear nota/i })

    // Fill in the form
    await user.type(titleInput, 'Test Note')
    await user.type(contentInput, 'Test content')

    // Submit the form
    await user.click(submitButton)

    await waitFor(() => {
      expect(notesApi.createNote).toHaveBeenCalledWith({
        title: 'Test Note',
        content: 'Test content'
      })
    })

    // Should navigate back to list
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles form input changes correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/título/i)
    const contentInput = screen.getByLabelText(/contenido/i)

    await user.type(titleInput, 'My Note Title')
    await user.type(contentInput, 'My note content')

    expect(titleInput).toHaveValue('My Note Title')
    expect(contentInput).toHaveValue('My note content')
  })

  it('shows character counter for title', () => {
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    expect(screen.getByText('0/255 caracteres')).toBeInTheDocument()
  })

  it('disables submit button when title is empty', async () => {
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /crear nota/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when title is provided', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NoteForm />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/título/i)
    const submitButton = screen.getByRole('button', { name: /crear nota/i })

    await user.type(titleInput, 'Test')

    expect(submitButton).toBeEnabled()
  })
})