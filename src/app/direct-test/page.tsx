'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DirectToggleTest() {
  const [currentTheme, setCurrentTheme] = useState<string>('light')

  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark')
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [])

  const directToggle = () => {
    console.log('=== DIRECT TOGGLE TEST ===')
    
    const htmlElement = document.documentElement
    const bodyElement = document.body
    
    console.log('Before toggle:')
    console.log('- HTML classes:', htmlElement.className)
    console.log('- Body classes:', bodyElement.className)
    console.log('- Has dark class:', htmlElement.classList.contains('dark'))
    
    // Direct DOM manipulation
    if (htmlElement.classList.contains('dark')) {
      // Switch to light
      htmlElement.classList.remove('dark')
      bodyElement.classList.remove('dark')
      htmlElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
      setCurrentTheme('light')
      console.log('Switched to LIGHT mode')
    } else {
      // Switch to dark
      htmlElement.classList.add('dark')
      bodyElement.classList.add('dark')
      htmlElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
      setCurrentTheme('dark')
      console.log('Switched to DARK mode')
    }
    
    console.log('After toggle:')
    console.log('- HTML classes:', htmlElement.className)
    console.log('- Body classes:', bodyElement.className)
    console.log('- Has dark class:', htmlElement.classList.contains('dark'))
  }

  const inspectDOM = () => {
    console.log('=== DOM INSPECTION ===')
    console.log('document.documentElement.classList:', document.documentElement.classList.toString())
    console.log('document.body.classList:', document.body.classList.toString())
    console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'))
    console.log('localStorage theme:', localStorage.getItem('theme'))
    console.log('Computed background color:', window.getComputedStyle(document.body).backgroundColor)
    console.log('Computed color:', window.getComputedStyle(document.body).color)
  }

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Direct DOM Toggle Test</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
        <p>Current detected theme: <strong>{currentTheme}</strong></p>
        <p>This background should change: Light Gray → Dark Gray</p>
      </div>

      <div className="space-x-4 mb-4">
        <Button onClick={directToggle} className="bg-red-500 hover:bg-red-600 text-white">
          Direct DOM Toggle (Check Console)
        </Button>
        
        <Button onClick={inspectDOM} variant="outline">
          Inspect DOM State
        </Button>
      </div>

      <div className="mt-8 p-4 border border-gray-300 dark:border-gray-700 rounded">
        <h2 className="text-lg font-semibold mb-2">Visual Test</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This text should be gray-700 in light mode and gray-300 in dark mode.
        </p>
        <div className="mt-2 w-full h-4 bg-blue-500 dark:bg-blue-400"></div>
        <p className="text-xs mt-1">Blue bar should change shade: blue-500 → blue-400</p>
      </div>

      <div className="mt-4 text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
        <p>Debug info:</p>
        <p>- HTML class list: <span id="html-classes">{typeof window !== 'undefined' ? document.documentElement.className : 'SSR'}</span></p>
        <p>- Data theme: <span id="data-theme">{typeof window !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'SSR'}</span></p>
      </div>
    </div>
  )
}