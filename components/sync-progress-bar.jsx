/**
 * Sync Progress Bar Component
 * 
 * This component displays real-time sync progress with percentage,
 * entry counts, and current status. It connects to the sync progress
 * tracking system for live updates.
 */

import { useState, useEffect } from 'react'

/**
 * SyncProgressBar Component
 * 
 * Displays a progress bar with detailed sync information including
 * percentage, entry counts, and current processing status.
 * 
 * @param {Object} props - Component props
 * @param {string} props.sessionId - Sync session ID to track
 * @param {boolean} props.show - Whether to show the progress bar
 * @param {function} props.onComplete - Callback when sync completes
 * @param {function} props.onError - Callback when sync fails
 * @returns {JSX.Element} The sync progress bar component
 */
export default function SyncProgressBar({ 
  sessionId, 
  show = false, 
  onComplete = null, 
  onError = null 
}) {
  const [progress, setProgress] = useState({
    percentage: 0,
    processedItems: 0,
    totalItems: 0,
    addedEntries: 0,
    updatedEntries: 0,
    errorEntries: 0,
    skippedEntries: 0,
    status: 'idle',
    message: '',
    currentItem: null
  })

  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!sessionId || !isVisible) return

    let pollInterval = null

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/sync/progress/${sessionId}`)
        if (response.ok) {
          const progressData = await response.json()
          setProgress(progressData)

          // Handle completion
          if (progressData.status === 'completed' && onComplete) {
            onComplete(progressData)
            clearInterval(pollInterval)
          } else if (progressData.status === 'failed' && onError) {
            onError(progressData)
            clearInterval(pollInterval)
          }
        } else if (response.status === 404) {
          // Session not found, stop polling
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Error polling progress:', error)
      }
    }

    // Start polling every 500ms
    pollInterval = setInterval(pollProgress, 500)
    
    // Initial poll
    pollProgress()

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [sessionId, isVisible, onComplete, onError])

  if (!isVisible || !sessionId) {
    return null
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'danger'
      case 'running':
        return 'primary'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return 'bi-check-circle'
      case 'failed':
        return 'bi-x-circle'
      case 'running':
        return 'bi-arrow-clockwise'
      default:
        return 'bi-clock'
    }
  }

  return (
    <div className="card mt-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className={`bi ${getStatusIcon()} me-2`}></i>
          Sync Progress
        </h6>
        <span className={`badge bg-${getStatusColor()}`}>
          {progress.status.toUpperCase()}
        </span>
      </div>
      <div className="card-body">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span className="small">Progress</span>
            <span className="small font-weight-bold">{progress.percentage}%</span>
          </div>
          <div className="progress">
            <div 
              className={`progress-bar bg-${getStatusColor()}`}
              role="progressbar" 
              style={{ width: `${progress.percentage}%` }}
              aria-valuenow={progress.percentage}
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {progress.percentage > 10 && `${progress.percentage}%`}
            </div>
          </div>
        </div>

        {/* Entry Counts */}
        <div className="row mb-3">
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="h5 text-primary mb-0">{progress.processedItems}</div>
              <small className="text-muted">Processed</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="h5 text-success mb-0">{progress.addedEntries}</div>
              <small className="text-muted">Added</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="h5 text-info mb-0">{progress.updatedEntries}</div>
              <small className="text-muted">Updated</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="h5 text-danger mb-0">{progress.errorEntries}</div>
              <small className="text-muted">Errors</small>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-2">
          <div className="d-flex justify-content-between">
            <span className="small text-muted">Items:</span>
            <span className="small">
              {progress.processedItems} / {progress.totalItems}
            </span>
          </div>
        </div>

        {/* Current Item */}
        {progress.currentItem && (
          <div className="mb-2">
            <div className="small text-muted">Currently processing:</div>
            <div className="small font-weight-bold text-truncate" title={progress.currentItem}>
              {progress.currentItem}
            </div>
          </div>
        )}

        {/* Status Message */}
        {progress.message && (
          <div className="alert alert-light border-0 py-2 mb-0">
            <small>{progress.message}</small>
          </div>
        )}
      </div>
    </div>
  )
} 