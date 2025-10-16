'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export default function ThemeTestPage() {
  const { theme, toggleTheme, mounted } = useTheme()

  const handleTest = () => {
    console.log('=== THEME TEST ===')
    console.log('Current theme:', theme)
    console.log('Mounted:', mounted)
    console.log('Document classes:', document.documentElement.classList.toString())
    console.log('Document data-theme:', document.documentElement.getAttribute('data-theme'))
    console.log('LocalStorage theme:', localStorage.getItem('theme'))
    
    console.log('Toggling theme...')
    toggleTheme()
    
    setTimeout(() => {
      console.log('=== AFTER TOGGLE ===')
      console.log('New theme:', theme)
      console.log('Document classes:', document.documentElement.classList.toString())
      console.log('Document data-theme:', document.documentElement.getAttribute('data-theme'))
      console.log('LocalStorage theme:', localStorage.getItem('theme'))
    }, 100)
  }

  const forceLight = () => {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
    console.log('Forced to light mode')
  }

  const forceDark = () => {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
    console.log('Forced to dark mode')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="space-y-4 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p><strong>Current Theme:</strong> {theme}</p>
          <p><strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}</p>
          <p><strong>Background should be:</strong> {theme === 'dark' ? 'Dark (Gray-900)' : 'Light (White)'}</p>
          <p><strong>Text should be:</strong> {theme === 'dark' ? 'Light (White)' : 'Dark (Black)'}</p>
        </div>

        <div className="mt-8 space-x-4">
          <Button onClick={handleTest} className="bg-blue-500 hover:bg-blue-600">
            {mounted ? (theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />) : <Moon className="w-4 h-4 mr-2" />}
            Test Toggle (Check Console)
          </Button>
          
          <Button onClick={forceLight} variant="outline">
            Force Light
          </Button>
          
          <Button onClick={forceDark} variant="outline">
            Force Dark
          </Button>
        </div>

        <div className="mt-8 p-4 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded">
          <p>This box should have a dashed border that changes color based on theme.</p>
          <p>Light mode: Gray-400 border</p>
          <p>Dark mode: Gray-600 border</p>
        </div>
      </div>
    </div>
  )
}