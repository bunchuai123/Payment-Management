'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get initial theme
    let initialTheme: Theme = 'light'
    
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') {
        initialTheme = saved
      } else {
        initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
    } catch (e) {
      // Fallback to light theme
      initialTheme = 'light'
    }
    
    setTheme(initialTheme)
    setMounted(true)
    
    // Apply initial theme immediately
    applyThemeToDOM(initialTheme)
  }, [])

  const applyThemeToDOM = (newTheme: Theme) => {
    try {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
      
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      console.error('Error applying theme:', e)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyThemeToDOM(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
