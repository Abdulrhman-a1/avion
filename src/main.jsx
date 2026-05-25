import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SpeechRevealProvider } from './contexts/SpeechRevealContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpeechRevealProvider>
      <App />
    </SpeechRevealProvider>
  </StrictMode>,
)
