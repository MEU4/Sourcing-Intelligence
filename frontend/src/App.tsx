import { useState } from 'react'
import Layout from './components/Layout'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import type { AppData } from './types'
import './App.css'

function App() {
  const [hasData, setHasData] = useState(false)
  const [analysisData, setAnalysisData] = useState<AppData | null>(null)

  const handleDataParsed = (data: any) => {
    // We will parse data and then set it to state
    setAnalysisData(data)
    setHasData(true)
  }

  const handleReset = () => {
    setHasData(false)
    setAnalysisData(null)
  }

  return (
    <Layout>
      {!hasData || !analysisData ? (
        <FileUpload onDataParsed={handleDataParsed} />
      ) : (
        <Dashboard data={analysisData} onReset={handleReset} />
      )}
    </Layout>
  )
}

export default App
