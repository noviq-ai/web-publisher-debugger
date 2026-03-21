import { IconAlertCircle } from '@tabler/icons-react'
import SparkleIcon from '@/components/assets/sparkle-icon'

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-primary/10">
        <SparkleIcon className="size-4 [&_path]:fill-current text-primary" />
      </div>
      <div className="bg-muted rounded-lg p-3 max-w-[85%]">
        <div className="flex items-center gap-2">
          <div className="animate-pulse flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
          </div>
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  )
}

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
      <IconAlertCircle size={16} className="shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}
