import { createRoot } from 'react-dom/client'
import { Help } from './Help'
import '../../globals.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Help />)
}
