import { createRoot } from 'react-dom/client'
import { Options } from './Options'
import '../../globals.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Options />)
}
