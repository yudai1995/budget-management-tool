import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Gallery } from './pages/Gallery'
import { BottomNavPrototype } from './pages/BottomNavPrototype'
import { QuickEntryPrototype } from './pages/QuickEntryPrototype'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/bottom-nav" element={<BottomNavPrototype />} />
        <Route path="/quick-entry" element={<QuickEntryPrototype />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
