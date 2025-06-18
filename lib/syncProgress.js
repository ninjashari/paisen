/**
 * Sync Progress Service
 *
 * This service manages the state of long-running synchronization processes
 * using an in-memory cache. It allows backend processes to report progress
 * and frontend clients to poll for real-time updates.
 *
 * This implementation uses a simple in-memory object as a cache, which is
 * suitable for single-server deployments. For multi-server or serverless
 * environments, this should be replaced with a distributed cache like Redis.
 */
class SyncProgressService {
  constructor() {
    this.cache = new Map();
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  }

  /**
   * Initialize or update the progress for a sync session.
   *
   * @param {string} sessionId - The unique ID for the sync session.
   * @param {object} progressData - The progress data to store.
   */
  setProgress(sessionId, progressData) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const existingProgress = this.cache.get(sessionId) || {
      percentage: 0,
      processedItems: 0,
      totalItems: 0,
      addedEntries: 0,
      updatedEntries: 0,
      errorEntries: 0,
      skippedEntries: 0,
      status: 'idle',
      message: '',
      currentItem: null,
      createdAt: Date.now(),
    };
    
    const newProgress = { 
      ...existingProgress, 
      ...progressData, 
      updatedAt: Date.now(),
      // Ensure these fields are always present
      status: progressData.status || existingProgress.status,
      message: progressData.message || existingProgress.message,
    };

    this.cache.set(sessionId, newProgress);

    // Clean up expired sessions periodically
    if (Math.random() < 0.1) { // 10% chance to run cleanup on each update
      this.cleanupExpiredSessions();
    }
  }

  /**
   * Retrieve the current progress for a sync session.
   *
   * @param {string} sessionId - The unique ID for the sync session.
   * @returns {object|null} The current progress data or null if not found.
   */
  getProgress(sessionId) {
    if (!sessionId) {
      return null;
    }

    const progress = this.cache.get(sessionId);
    
    if (!progress) {
      return null;
    }

    // Check if session has expired
    if (Date.now() - progress.updatedAt > this.SESSION_TIMEOUT) {
      this.clearProgress(sessionId);
      return null;
    }

    return progress;
  }

  /**
   * Remove a sync session's progress from the cache.
   *
   * @param {string} sessionId - The unique ID for the sync session.
   */
  clearProgress(sessionId) {
    if (!sessionId) {
      return;
    }
    this.cache.delete(sessionId);
  }

  /**
   * Clean up expired sessions from the cache
   * @private
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, progress] of this.cache.entries()) {
      if (now - progress.updatedAt > this.SESSION_TIMEOUT) {
        this.clearProgress(sessionId);
      }
    }
  }
}

// Export a singleton instance
const syncProgressService = new SyncProgressService();
export default syncProgressService; 