/**
 * Jellyfin Configuration Component
 * 
 * This component provides a user interface for configuring Jellyfin server
 * integration, including server connection setup, credential testing, and
 * sync preferences management.
 * 
 * Features:
 * - Server URL and API key configuration
 * - Connection testing with real-time feedback
 * - Jellyfin username validation
 * - Sync enable/disable toggle
 * - Configuration save/load functionality
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

function JellyfinConfig() {
  const { data: session, status } = useSession()
  
  // Configuration state
  const [config, setConfig] = useState({
    serverUrl: '',
    apiKey: '',
    jellyfinUsername: '',
    syncEnabled: false
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})

  // Load existing configuration when session is available
  useEffect(() => {
    if (status === 'authenticated' && session) {
      loadConfiguration()
    }
  }, [session, status])

  /**
   * Load existing Jellyfin configuration from server
   */
  const loadConfiguration = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/jellyfin/config')
      if (response.data.success) {
        setConfig(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
      
      if (error.response?.status === 401) {
        setMessage({
          type: 'error',
          text: 'Authentication required. Please log in again.'
        })
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load existing configuration'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle input field changes
   * 
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  /**
   * Validate configuration fields
   * 
   * @returns {boolean} True if configuration is valid
   */
  const validateConfiguration = () => {
    const newErrors = {}

    if (!config.serverUrl.trim()) {
      newErrors.serverUrl = 'Server URL is required'
    } else {
      try {
        const url = new URL(config.serverUrl)
        
        // Check for common issues
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.serverUrl = 'URL must start with http:// or https://'
        } else if (url.pathname !== '/' && url.pathname !== '') {
          newErrors.serverUrl = 'URL should not include a path (e.g., use http://server:8096 not http://server:8096/web)'
        }
      } catch (error) {
        newErrors.serverUrl = 'Invalid URL format (e.g., http://localhost:8096)'
      }
    }

    if (!config.apiKey.trim()) {
      newErrors.apiKey = 'API Key is required'
    } else if (config.apiKey.length < 10) {
      newErrors.apiKey = 'API Key seems too short - check if it was copied correctly'
    }

    if (!config.jellyfinUsername.trim()) {
      newErrors.jellyfinUsername = 'Jellyfin username is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Test connection to Jellyfin server
   */
  const testConnection = async () => {
    if (!config.serverUrl || !config.apiKey) {
      setMessage({
        type: 'error',
        text: 'Server URL and API Key are required for testing'
      })
      return
    }

    setTesting(true)
    setTestResult(null)
    setMessage(null)

    try {
      const response = await axios.put('/api/jellyfin/config', {
        serverUrl: config.serverUrl,
        apiKey: config.apiKey,
        jellyfinUsername: config.jellyfinUsername
      })

      if (response.data.success) {
        setTestResult({
          success: true,
          ...response.data.data
        })
        setMessage({
          type: 'success',
          text: 'Connection test successful!'
        })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Connection test failed'
      setTestResult({
        success: false,
        error: errorMessage
      })
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setTesting(false)
    }
  }

  /**
   * Save Jellyfin configuration
   */
  const saveConfiguration = async () => {
    if (!validateConfiguration()) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await axios.post('/api/jellyfin/config', config)

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Configuration saved successfully!'
        })
        
        // Update config with server response
        if (response.data.data) {
          setConfig(prev => ({
            ...prev,
            ...response.data.data
          }))
        }
      }
    } catch (error) {
      console.error('Save configuration error:', error)
      
      if (error.response?.status === 401) {
        setMessage({
          type: 'error',
          text: 'Authentication required. Please log in again.'
        })
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save configuration'
        setMessage({
          type: 'error',
          text: errorMessage
        })
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Delete Jellyfin configuration
   */
  const deleteConfiguration = async () => {
    if (!confirm('Are you sure you want to delete your Jellyfin configuration?')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await axios.delete('/api/jellyfin/config')

      if (response.data.success) {
        setConfig({
          serverUrl: '',
          apiKey: '',
          jellyfinUsername: '',
          syncEnabled: false
        })
        setTestResult(null)
        setMessage({
          type: 'success',
          text: 'Configuration deleted successfully'
        })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete configuration'
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading while session is loading or config is loading
  if (status === 'loading' || loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">
            {status === 'loading' ? 'Checking authentication...' : 'Loading configuration...'}
          </p>
        </div>
      </div>
    )
  }

  // Show message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="alert alert-warning">
            <h6>Authentication Required</h6>
            <p className="mb-0">Please log in to configure Jellyfin integration.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-server me-2"></i>
          Jellyfin Server Configuration
        </h5>
      </div>
      
      <div className="card-body">
        {/* Status Messages */}
        {message && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Server URL */}
        <div className="mb-3">
          <label htmlFor="serverUrl" className="form-label">
            Server URL <span className="text-danger">*</span>
          </label>
          <input
            type="url"
            className={`form-control ${errors.serverUrl ? 'is-invalid' : ''}`}
            id="serverUrl"
            name="serverUrl"
            value={config.serverUrl}
            onChange={handleInputChange}
            placeholder="https://jellyfin.example.com:8096"
            disabled={saving}
          />
          {errors.serverUrl && (
            <div className="invalid-feedback">{errors.serverUrl}</div>
          )}
          <div className="form-text">
            The full URL to your Jellyfin server (including port if needed)
            <br />
            <strong>Examples:</strong> <code>http://localhost:8096</code>, <code>http://192.168.1.100:8096</code>, <code>https://jellyfin.example.com</code>
          </div>
        </div>

        {/* API Key */}
        <div className="mb-3">
          <label htmlFor="apiKey" className="form-label">
            API Key <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            className={`form-control ${errors.apiKey ? 'is-invalid' : ''}`}
            id="apiKey"
            name="apiKey"
            value={config.apiKey}
            onChange={handleInputChange}
            placeholder="Your Jellyfin API key"
            disabled={saving}
          />
          {errors.apiKey && (
            <div className="invalid-feedback">{errors.apiKey}</div>
          )}
          <div className="form-text">
            Generate an API key in Jellyfin Dashboard → API Keys
          </div>
        </div>

        {/* Jellyfin Username */}
        <div className="mb-3">
          <label htmlFor="jellyfinUsername" className="form-label">
            Jellyfin Username <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.jellyfinUsername ? 'is-invalid' : ''}`}
            id="jellyfinUsername"
            name="jellyfinUsername"
            value={config.jellyfinUsername}
            onChange={handleInputChange}
            placeholder="Your Jellyfin username"
            disabled={saving}
          />
          {errors.jellyfinUsername && (
            <div className="invalid-feedback">{errors.jellyfinUsername}</div>
          )}
          <div className="form-text">
            The username you use to log into Jellyfin
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={testConnection}
            disabled={testing || saving || !config.serverUrl || !config.apiKey}
          >
            {testing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Testing Connection...
              </>
            ) : (
              <>
                <i className="bi bi-wifi me-2"></i>
                Test Connection
              </>
            )}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mb-3`}>
            {testResult.success ? (
              <div>
                <h6 className="alert-heading">
                  <i className="bi bi-check-circle me-2"></i>
                  Connection Successful!
                </h6>
                <p className="mb-1">
                  <strong>Server:</strong> {testResult.serverName} (v{testResult.version})
                </p>
                {testResult.userFound && (
                  <p className="mb-0">
                    <strong>User:</strong> Found and validated
                  </p>
                )}
                {!testResult.userFound && config.jellyfinUsername && (
                  <p className="mb-0 text-warning">
                    <strong>Warning:</strong> Username not found on server
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h6 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Connection Failed
                </h6>
                <p className="mb-0">{testResult.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Sync Settings */}
        <div className="mb-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="syncEnabled"
              name="syncEnabled"
              checked={config.syncEnabled}
              onChange={handleInputChange}
              disabled={saving}
            />
            <label className="form-check-label" htmlFor="syncEnabled">
              Enable automatic sync
            </label>
          </div>
          <div className="form-text">
            Automatically update MyAnimeList when you watch anime on Jellyfin
          </div>
        </div>

        {/* Last Sync Info */}
        {config.lastSync && (
          <div className="mb-3">
            <small className="text-muted">
              Last sync: {new Date(config.lastSync).toLocaleString()}
            </small>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveConfiguration}
            disabled={saving || testing}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Configuration
              </>
            )}
          </button>

          {(config.hasApiKey || config.serverUrl) && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={deleteConfiguration}
              disabled={saving || testing}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JellyfinConfig 