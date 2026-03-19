import { IconRobot, IconSettings, IconSparkles } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  quickPrompts: string[]
  onPromptClick: (prompt: string) => void
  isLoading: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  quickPrompts,
  onPromptClick,
  isLoading,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Bot Icon */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6"
      >
        <div className="relative p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <IconRobot size={32} className="text-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-1 -right-1 p-1 rounded-full bg-yellow-400"
        >
          <IconSparkles size={12} className="text-yellow-900" />
        </motion.div>
      </motion.div>

      {/* Animated Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold mb-2"
      >
        Web Publisher AI
      </motion.h2>

      {/* Animated Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm text-center mb-6 max-w-xs"
      >
        Ask me anything about your page's SEO, advertising, or tracking setup.
      </motion.p>

      {/* Animated Quick Prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {quickPrompts.map((prompt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export const ApiKeyMissing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 rounded-full bg-muted mb-6"
      >
        <IconRobot size={32} className="text-muted-foreground" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground mb-4"
      >
        API key not configured.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button variant="outline" onClick={() => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
            chrome.runtime.openOptionsPage()
          } else {
            // Dev mode: prompt to set API key in localStorage
            const key = prompt('Enter Claude API key for development:')
            if (key) {
              localStorage.setItem('claudeApiKey', key)
              window.location.reload()
            }
          }
        }}>
          <IconSettings size={16} className="mr-2" />
          Open Settings
        </Button>
      </motion.div>
    </div>
  )
}
