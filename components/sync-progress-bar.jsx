/**
 * Sync Progress Bar Component
 * 
 * This component displays a progress bar and status information for long-running
 * synchronization processes. It polls the server for progress updates and
 * provides visual feedback to the user.
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const POLL_INTERVAL = 1000; // Poll every second
const MAX_RETRIES = 3; // Maximum number of consecutive errors before stopping

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
export default function SyncProgressBar({ sessionId, onComplete, onError }) {
  const [progress, setProgress] = useState({
    percentage: 0,
    status: 'idle',
    message: '',
    processedItems: 0,
    totalItems: 0,
    addedEntries: 0,
    updatedEntries: 0,
    errorEntries: 0,
    currentItem: null
  });
  const [errorCount, setErrorCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!sessionId || !isPolling) return;

    try {
      const response = await axios.get(`/api/sync/progress/${sessionId}`);
      const progressData = response.data;

      setProgress(progressData);
      setErrorCount(0); // Reset error count on successful fetch

      // Handle completion
      if (progressData.status === 'completed') {
        setIsPolling(false);
        if (onComplete) {
          onComplete(progressData);
        }
      }
      // Handle error state
      else if (progressData.status === 'error') {
        setIsPolling(false);
        if (onError) {
          onError(new Error(progressData.message || 'Sync failed'));
        }
      }
    } catch (error) {
      // Increment error count and stop polling if we exceed MAX_RETRIES
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      
      if (newErrorCount >= MAX_RETRIES) {
        setIsPolling(false);
        if (onError) {
          onError(error);
        }
      }
    }
  }, [sessionId, isPolling, errorCount, onComplete, onError]);

  useEffect(() => {
    if (!sessionId) return;

    // Start polling
    const pollInterval = setInterval(fetchProgress, POLL_INTERVAL);

    // Initial fetch
    fetchProgress();

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [sessionId, fetchProgress]);

  // Don't render anything if no session ID
  if (!sessionId) return null;

  // Calculate the progress bar color based on status
  const getProgressBarColor = () => {
    switch (progress.status) {
      case 'error':
        return 'bg-danger';
      case 'completed':
        return 'bg-success';
      case 'running':
        return 'bg-primary';
      default:
        return 'bg-info';
    }
  };

  return (
    <div className="sync-progress mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>Status:</strong> {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
        </div>
        <div>
          <strong>Progress:</strong> {progress.percentage}%
        </div>
      </div>

      <div className="progress mb-2" style={{ height: '20px' }}>
        <div
          className={`progress-bar ${getProgressBarColor()}`}
          role="progressbar"
          style={{ width: `${progress.percentage}%` }}
          aria-valuenow={progress.percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {progress.message && (
        <div className="text-muted small mb-2">{progress.message}</div>
      )}

      {progress.currentItem && (
        <div className="text-muted small">
          Currently processing: {progress.currentItem}
        </div>
      )}

      {progress.totalItems > 0 && (
        <div className="d-flex justify-content-between text-muted small mt-2">
          <span>Processed: {progress.processedItems} / {progress.totalItems}</span>
          <span>Added: {progress.addedEntries}</span>
          <span>Updated: {progress.updatedEntries}</span>
          <span>Errors: {progress.errorEntries}</span>
        </div>
      )}
    </div>
  );
} 