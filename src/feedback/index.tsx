import { createRoot } from 'react-dom/client'
import { Feedback } from './Feedback'
import '../globals.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Feedback />)
}
