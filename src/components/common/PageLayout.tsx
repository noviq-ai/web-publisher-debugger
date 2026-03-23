import React from 'react'

declare const __APP_VERSION__: string

interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col pt-[72px]">
      <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
        <main className="space-y-4">
          {children}
        </main>

        <footer className="px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Pubsight v{__APP_VERSION__}
          </p>
        </footer>
      </div>
    </div>
  )
}

interface SectionCardProps {
  children: React.ReactNode
  className?: string
}

export const SectionCard: React.FC<SectionCardProps> = ({ children, className = '' }) => {
  return (
    <section className={`bg-card border border-border/50 rounded-lg px-6 py-6 ${className}`}>
      {children}
    </section>
  )
}
