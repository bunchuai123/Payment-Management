'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CSSDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  const analyzeStyles = () => {
    const body = document.body
    const html = document.documentElement
    const computedStyle = window.getComputedStyle(body)
    
    const info = {
      htmlClasses: html.className,
      bodyClasses: body.className,
      dataTheme: html.getAttribute('data-theme'),
      computedBgColor: computedStyle.backgroundColor,
      computedColor: computedStyle.color,
      hasDarkClass: html.classList.contains('dark'),
      tailwindTest: {
        // Test if Tailwind classes are working
        bgWhite: getComputedStyle(document.createElement('div')).backgroundColor,
      }
    }
    
    setDebugInfo(info)
    console.log('=== CSS DEBUG INFO ===', info)
  }

  const testTailwindDirectly = () => {
    console.log('=== TESTING TAILWIND DIRECTLY ===')
    
    // Create test elements
    const testDiv = document.createElement('div')
    testDiv.className = 'bg-white dark:bg-black text-black dark:text-white'
    testDiv.style.width = '100px'
    testDiv.style.height = '100px'
    testDiv.textContent = 'Test'
    document.body.appendChild(testDiv)
    
    const style = getComputedStyle(testDiv)
    console.log('Test div background:', style.backgroundColor)
    console.log('Test div color:', style.color)
    
    // Toggle dark class on html and check again
    document.documentElement.classList.toggle('dark')
    const styleAfter = getComputedStyle(testDiv)
    console.log('After toggle - background:', styleAfter.backgroundColor)
    console.log('After toggle - color:', styleAfter.color)
    
    // Clean up
    document.body.removeChild(testDiv)
  }

  const forceStyles = () => {
    console.log('=== FORCING STYLES ===')
    document.body.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff'
    document.body.style.color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
  }

  useEffect(() => {
    analyzeStyles()
    
    // Check every second for changes
    const interval = setInterval(analyzeStyles, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8 min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-red-500 dark:text-red-400">CSS Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Current State</h2>
          <div className="text-sm space-y-1 font-mono">
            <p><strong>HTML Classes:</strong> {debugInfo.htmlClasses || 'Loading...'}</p>
            <p><strong>Body Classes:</strong> {debugInfo.bodyClasses || 'Loading...'}</p>
            <p><strong>Data Theme:</strong> {debugInfo.dataTheme || 'None'}</p>
            <p><strong>Has Dark Class:</strong> {debugInfo.hasDarkClass ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">Computed Styles</h2>
          <div className="text-sm space-y-1 font-mono">
            <p><strong>Background:</strong> {debugInfo.computedBgColor || 'Loading...'}</p>
            <p><strong>Color:</strong> {debugInfo.computedColor || 'Loading...'}</p>
          </div>
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <Button onClick={analyzeStyles} variant="outline">
          Refresh Debug Info
        </Button>
        <Button onClick={testTailwindDirectly} className="bg-blue-500 hover:bg-blue-600 text-white">
          Test Tailwind Directly
        </Button>
        <Button onClick={forceStyles} className="bg-red-500 hover:bg-red-600 text-white">
          Force Styles
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-500 dark:bg-red-700 p-4 rounded text-white">
          Red Box (should change shade)
        </div>
        <div className="bg-blue-500 dark:bg-blue-700 p-4 rounded text-white">
          Blue Box (should change shade)
        </div>
      </div>

      <div className="border-2 border-gray-300 dark:border-gray-700 p-4 rounded">
        <p className="text-gray-700 dark:text-gray-300">
          This text should be gray-700 in light mode and gray-300 in dark mode.
        </p>
        <div className="mt-2 w-full h-8 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-800 rounded"></div>
      </div>

      <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
        <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Visual Test</h3>
        <p className="text-yellow-700 dark:text-yellow-300">
          This entire section should have a yellow background that changes between light and dark modes.
        </p>
      </div>
    </div>
  )
}