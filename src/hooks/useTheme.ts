import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  root.classList.remove('light', 'dark')
  root.classList.add(effectiveTheme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    // Load saved theme
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        const savedTheme = result.settings?.theme as Theme | undefined
        if (savedTheme) {
          setThemeState(savedTheme)
          applyTheme(savedTheme)
        } else {
          applyTheme('system')
        }
      })
    } else {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      } else {
        applyTheme('system')
      }
    }
  }, [])

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    // Save theme
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {}
        chrome.storage.local.set({ settings: { ...settings, theme: newTheme } })
      })
    } else {
      localStorage.setItem('theme', newTheme)
    }
  }

  return { theme, setTheme }
}
