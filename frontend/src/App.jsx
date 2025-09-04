import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NotesProvider } from './context/NotesContext'
import NotesList from './components/NotesList'
import NoteForm from './components/NoteForm'

import './styles/style.css'

function App() {
  return (
    <NotesProvider>
      <Router>
        <div className="app">
          {/* Centered corporate header */}
          <header className="site-header">
            <div className="site-header-inner">
              <img src="/lcg-logo.png" alt="Lion Capital Group" className="site-logo" />
              <h1 className="site-title">Prueba Técnica — Lion Capital Group</h1>
            </div>
          </header>

          <main className="main">
            <Routes>
              <Route path="/" element={<NotesList />} />
              <Route path="/new" element={<NoteForm />} />
              <Route path="/edit/:id" element={<NoteForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </NotesProvider>
  )
}

export default App
