import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// CSS - Ordem importante para cascata correta
import './styles/variables.css'
import './styles/globals.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/responsive.css'
import './styles/dashboard-pro.css'
import './styles/modal-agendamento.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
