import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [followingFile, setFollowingFile] = useState(null)
  const [followersFile, setFollowersFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [clickedProfiles, setClickedProfiles] = useState(new Set())
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'default'
  })

  // Apply theme to container
  useEffect(() => {
    const container = document.querySelector('.app-container')
    if (container) {
      container.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Helper function to extract username from an item
  const extractUsernameFromItem = (item) => {
    // Primary: Check for title field (used in following.json)
    if (item.title && item.title.trim()) {
      return item.title.toLowerCase().trim()
    }
    // Fallback: Handle string_list_data array with value field (used in followers.json)
    if (item.string_list_data && Array.isArray(item.string_list_data)) {
      for (const data of item.string_list_data) {
        if (data.value && data.value.trim()) {
          return data.value.toLowerCase().trim()
        }
      }
    }
    // Fallback: direct value field
    if (item.value && item.value.trim()) {
      return item.value.toLowerCase().trim()
    }
    return null
  }

  // Parse Instagram JSON file to extract usernames
  const parseInstagramJSON = (jsonData) => {
    const usernames = new Set()
    let itemsToProcess = []
    
    // Check if jsonData is directly an array (followers.json format)
    if (Array.isArray(jsonData)) {
      itemsToProcess = jsonData
    }
    // Check for following.json structure - relationships_following array
    else if (jsonData.relationships_following && Array.isArray(jsonData.relationships_following)) {
      itemsToProcess = jsonData.relationships_following
    }
    // Check for followers.json structure - relationships_followers array
    else if (jsonData.relationships_followers && Array.isArray(jsonData.relationships_followers)) {
      itemsToProcess = jsonData.relationships_followers
    }
    
    // Process all items
    itemsToProcess.forEach(item => {
      const username = extractUsernameFromItem(item)
      if (username) {
        usernames.add(username)
      }
    })
    
    // Debug: Log structure if no usernames found
    if (usernames.size === 0) {
      if (Array.isArray(jsonData)) {
        console.warn('No usernames found. JSON is an array with', jsonData.length, 'items')
      } else {
        console.warn('No usernames found. JSON structure:', Object.keys(jsonData))
      }
    }
    
    return usernames
  }

  // Handle file reading
  const handleFileRead = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          resolve(jsonData)
        } catch (err) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }

  // Handle following file upload
  const handleFollowingUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setFollowingFile(file)
      setError(null)
    }
  }

  // Handle followers file upload (supports multiple files like followers_1.json, followers_2.json)
  const handleFollowersUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
      setFollowersFile(files)
      setError(null)
    }
  }

  // Compare and find accounts you follow who don't follow back
  const compareFiles = async () => {
    if (!followingFile) {
      setError('Please upload your following.json file')
      return
    }
    if (!followersFile || followersFile.length === 0) {
      setError('Please upload your followers.json file(s)')
      return
    }

    setLoading(true)
    setError(null)
    setStatus('Starting analysis...')

    try {
      // Step 1: Read and parse following file
      setStatus('📖 Reading following.json file...')
      await new Promise(resolve => setTimeout(resolve, 300)) // Small delay to show status
      
      const followingData = await handleFileRead(followingFile)
      setStatus('🔍 Extracting usernames from following list...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const followingUsernames = parseInstagramJSON(followingData)
      
      // Debug logging
      console.log('Following data structure:', Object.keys(followingData))
      console.log('Following usernames found:', followingUsernames.size)
      if (followingUsernames.size === 0) {
        console.log('Following data sample:', JSON.stringify(followingData).substring(0, 500))
      }
      
      if (followingUsernames.size === 0) {
        const keys = Object.keys(followingData)
        throw new Error(`No accounts found in following.json. File contains keys: ${keys.join(', ')}. Please check the file format. Open browser console (F12) for more details.`)
      }
      
      setStatus(`✓ Found ${followingUsernames.size} accounts you're following`)
      
      // Store debug info
      setDebugInfo(prev => ({
        ...prev,
        followingCount: followingUsernames.size,
        followingStructure: Object.keys(followingData)
      }))

      // Step 2: Read and parse followers files
      const allFollowersUsernames = new Set()
      const totalFollowersFiles = followersFile.length
      
      for (let i = 0; i < followersFile.length; i++) {
        const file = followersFile[i]
        setStatus(`📖 Reading followers file ${i + 1} of ${totalFollowersFiles} (${file.name})...`)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const followersData = await handleFileRead(file)
        setStatus(`🔍 Extracting usernames from ${file.name}...`)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const usernames = parseInstagramJSON(followersData)
        
        // Debug logging
        if (i === 0) {
          console.log('Followers data structure:', Object.keys(followersData))
        }
        console.log(`Usernames found in ${file.name}:`, usernames.size)
        
        if (usernames.size === 0) {
          console.warn(`No usernames found in ${file.name}. Data sample:`, JSON.stringify(followersData).substring(0, 500))
        }
        
        usernames.forEach(username => allFollowersUsernames.add(username))
        
        setStatus(`✓ Processed ${file.name} - Total followers so far: ${allFollowersUsernames.size}`)
      }

      if (allFollowersUsernames.size === 0) {
        throw new Error('No accounts found in followers.json file(s). Please check the file format. Open browser console (F12) for more details.')
      }

      setStatus(`✓ Found ${allFollowersUsernames.size} accounts following you`)
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        followersCount: allFollowersUsernames.size
      }))

      // Step 3: Compare and find accounts not following back
      setStatus('🔄 Comparing following list with followers list...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Debug: Show sample usernames
      const followingArray = Array.from(followingUsernames)
      const followersArray = Array.from(allFollowersUsernames)
      console.log('Sample following usernames:', followingArray.slice(0, 5))
      console.log('Sample follower usernames:', followersArray.slice(0, 5))
      
      const notFollowingBack = followingArray
        .filter(username => !allFollowersUsernames.has(username))
        .sort()
      
      console.log('Comparison complete:', {
        totalFollowing: followingUsernames.size,
        totalFollowers: allFollowersUsernames.size,
        notFollowingBack: notFollowingBack.length
      })

      setStatus(`✓ Comparison complete! Found ${notFollowingBack.length} accounts not following back`)
      await new Promise(resolve => setTimeout(resolve, 500))

      setResults({
        totalFollowing: followingUsernames.size,
        totalFollowers: allFollowersUsernames.size,
        notFollowingBack: notFollowingBack,
        count: notFollowingBack.length
      })

      setStatus('')
      setDebugInfo(null) // Clear debug info on success

    } catch (err) {
      console.error('Error during analysis:', err)
      setError(err.message || 'Error processing files. Please check your JSON files. Open browser console (F12) for more details.')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const resetFiles = () => {
    setFollowingFile(null)
    setFollowersFile(null)
    setResults(null)
    setError(null)
    setStatus('')
    setDebugInfo(null)
  }

  const themes = [
    { id: 'default', name: 'Default' },
    { id: 'dark-blue', name: 'Dark Blue' },
    { id: 'teal', name: 'Teal' },
    { id: 'charcoal', name: 'Charcoal' }
  ]

  return (
    <div className="app-container" data-theme={theme}>
      <header className="app-header">
        <div className="theme-switcher">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-button ${theme === t.id ? 'active' : ''}`}
              data-theme={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              aria-label={`Switch to ${t.name} theme`}
            />
          ))}
        </div>
        <img src="/logo.png" alt="FollowGap Logo" className="logo" />
        <h1>FollowGap</h1>
        <p className="subtitle">Find accounts you follow who don't follow you back</p>
      </header>

      <main className="main-content">
        {!results ? (
          <div className="upload-section">
            <div className="upload-box">
              <h2>Step 1: Upload Following File</h2>
              <label htmlFor="following-upload" className="file-upload-label">
                {followingFile ? `✓ ${followingFile.name}` : 'Upload following.json'}
                <input
                  id="following-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFollowingUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="help-text">Upload the following.json file from your Instagram data</p>
            </div>

            <div className="upload-box">
              <h2>Step 2: Upload Followers File(s)</h2>
              <label htmlFor="followers-upload" className="file-upload-label">
                {followersFile && followersFile.length > 0 
                  ? `✓ ${followersFile.length} file(s) selected`
                  : 'Upload followers.json'}
                <input
                  id="followers-upload"
                  type="file"
                  accept=".json"
                  multiple
                  onChange={handleFollowersUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="help-text">Upload followers.json file(s) - you can select multiple if you have followers_1.json, followers_2.json, etc.</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
                {debugInfo && (
                  <div className="debug-info" style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    <strong>Debug Info:</strong> Following: {debugInfo.followingCount || 0}, Followers: {debugInfo.followersCount || 0}
                    {debugInfo.followingStructure && (
                      <div>File structure keys: {debugInfo.followingStructure.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {loading && status && (
              <div className="status-box">
                <div className="status-content">
                  <div className="spinner"></div>
                  <p className="status-text">{status}</p>
                </div>
              </div>
            )}

            <button 
              className="analyze-button"
              onClick={compareFiles}
              disabled={loading || !followingFile || !followersFile}
            >
              {loading ? 'Analyzing...' : 'Find Accounts Not Following Back'}
            </button>
          </div>
        ) : (
          <div className="results-section">
            <div className="stats-box">
              <div className="stat">
                <span className="stat-label">You're Following:</span>
                <span className="stat-value">{results.totalFollowing}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Following You:</span>
                <span className="stat-value">{results.totalFollowers}</span>
              </div>
              <div className="stat highlight">
                <span className="stat-label">Not Following Back:</span>
                <span className="stat-value">{results.count}</span>
              </div>
            </div>

            <div className="accounts-list">
              <h2>Accounts You Follow Who Don't Follow Back ({results.count})</h2>
              <div className="accounts-grid">
                {results.notFollowingBack.map((username) => (
                  <a
                    key={username}
                    href={`https://www.instagram.com/${username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`account-link ${clickedProfiles.has(username) ? 'clicked' : ''}`}
                    onClick={(e) => {
                      setClickedProfiles(prev => {
                        const newSet = new Set(prev)
                        if (newSet.has(username)) {
                          newSet.delete(username)
                        } else {
                          newSet.add(username)
                        }
                        return newSet
                      })
                    }}
                  >
                    @{username}
                  </a>
                ))}
              </div>
            </div>

            <button className="reset-button" onClick={resetFiles}>
              Analyze Different Files
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>🔒 Your data stays in your browser - we don't upload anything to any server</p>
      </footer>
    </div>
  )
}

export default App
