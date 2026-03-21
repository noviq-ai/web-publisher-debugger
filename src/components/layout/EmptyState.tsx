import { IconSettings } from '@tabler/icons-react'
import SparkleIcon from '@/components/assets/sparkle-icon'
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
      {/* Organic gradient orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-8"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-[conic-gradient(from_180deg,#e0c3fc,#8ec5fc,#fbc2eb,#a6c1ee,#e0c3fc)] animate-spin [animation-duration:8s]" />
        {/* Gradient orb */}
        <div className="relative size-16 rounded-full bg-[conic-gradient(from_45deg,#f9a8d4,#c084fc,#818cf8,#60a5fa,#34d399,#fbbf24,#f9a8d4)] p-[2px]">
          <div className="flex items-center justify-center size-full rounded-full bg-background">
            <SparkleIcon className="size-7 text-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold mb-2"
      >
        Web Publisher AI
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm text-center mb-6 max-w-xs"
      >
        Ask me anything about your page's SEO, advertising, or tracking setup.
      </motion.p>

      {/* Quick Prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto"
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
        className="relative mb-6"
      >
        <div className="size-16 rounded-full bg-[conic-gradient(from_45deg,#f9a8d4,#c084fc,#818cf8,#60a5fa,#34d399,#fbbf24,#f9a8d4)] p-[2px] opacity-40">
          <div className="flex items-center justify-center size-full rounded-full bg-background">
            <SparkleIcon className="size-7 text-muted-foreground" />
          </div>
        </div>
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
