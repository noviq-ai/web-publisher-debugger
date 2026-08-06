import { createRoot } from 'react-dom/client'
import { App } from './App'
import './globals.css'

if (import.meta.env.PROD) {
  globalThis.AI_SDK_LOG_WARNINGS = false
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
