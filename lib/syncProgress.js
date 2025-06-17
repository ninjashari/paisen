/**
 * Sync Progress Tracking Utility
 * 
 * This utility provides real-time progress tracking for sync operations,
 * allowing clients to monitor sync progress via Server-Sent Events (SSE).
 * 
 * Features:
 * - Real-time progress updates
 * - Percentage calculation
 * - Entry counting (added, updated, errors)
 * - Multiple concurrent sync sessions
 */

class SyncProgressTracker {
  constructor() {
    this.sessions = new Map() // sessionId -> progress data
  }

  /**
   * Start a new sync session
   * 
   * @param {string} sessionId - Unique session identifier
   * @param {number} totalItems - Total number of items to process
   * @param {string} type - Type of sync (mal, jellyfin, etc.)
   * @returns {Object} Initial progress data
   */
  startSession(sessionId, totalItems, type = 'unknown') {
    const progressData = {
      sessionId,
      type,
      totalItems,
      processedItems: 0,
      addedEntries: 0,
      updatedEntries: 0,
      errorEntries: 0,
      skippedEntries: 0,
      percentage: 0,
      status: 'started',
      startTime: Date.now(),
      lastUpdate: Date.now(),
      currentItem: null,
      message: 'Starting sync...'
    }

    this.sessions.set(sessionId, progressData)
    return progressData
  }

  /**
   * Update progress for a session
   * 
   * @param {string} sessionId - Session identifier
   * @param {Object} updates - Progress updates
   * @returns {Object} Updated progress data
   */
  updateProgress(sessionId, updates) {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Update the session data
    Object.assign(session, updates, {
      lastUpdate: Date.now()
    })

    // Recalculate percentage
    if (session.totalItems > 0) {
      session.percentage = Math.round((session.processedItems / session.totalItems) * 100)
    }

    // Update status based on progress
    if (session.processedItems >= session.totalItems && session.status === 'running') {
      session.status = 'completed'
      session.endTime = Date.now()
      session.duration = session.endTime - session.startTime
      session.message = `Sync completed: ${session.addedEntries} added, ${session.updatedEntries} updated, ${session.errorEntries} errors`
    }

    this.sessions.set(sessionId, session)
    return session
  }

  /**
   * Increment processed items count
   * 
   * @param {string} sessionId - Session identifier
   * @param {string} itemName - Name of current item being processed
   * @param {string} action - Action taken (added, updated, error, skipped)
   * @returns {Object} Updated progress data
   */
  incrementProgress(sessionId, itemName, action = 'processed') {
    const updates = {
      processedItems: this.getProgress(sessionId).processedItems + 1,
      currentItem: itemName,
      status: 'running'
    }

    // Increment specific counters
    switch (action) {
      case 'added':
        updates.addedEntries = this.getProgress(sessionId).addedEntries + 1
        updates.message = `Added: ${itemName}`
        break
      case 'updated':
        updates.updatedEntries = this.getProgress(sessionId).updatedEntries + 1
        updates.message = `Updated: ${itemName}`
        break
      case 'error':
        updates.errorEntries = this.getProgress(sessionId).errorEntries + 1
        updates.message = `Error processing: ${itemName}`
        break
      case 'skipped':
        updates.skippedEntries = this.getProgress(sessionId).skippedEntries + 1
        updates.message = `Skipped: ${itemName}`
        break
      default:
        updates.message = `Processing: ${itemName}`
    }

    return this.updateProgress(sessionId, updates)
  }

  /**
   * Get current progress for a session
   * 
   * @param {string} sessionId - Session identifier
   * @returns {Object} Current progress data
   */
  getProgress(sessionId) {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Complete a sync session
   * 
   * @param {string} sessionId - Session identifier
   * @param {boolean} success - Whether sync completed successfully
   * @param {string} message - Completion message
   * @returns {Object} Final progress data
   */
  completeSession(sessionId, success = true, message = null) {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const updates = {
      status: success ? 'completed' : 'failed',
      endTime: Date.now(),
      percentage: success ? 100 : session.percentage
    }

    if (message) {
      updates.message = message
    } else if (success) {
      updates.message = `Sync completed successfully: ${session.addedEntries} added, ${session.updatedEntries} updated`
    } else {
      updates.message = 'Sync failed'
    }

    updates.duration = updates.endTime - session.startTime

    return this.updateProgress(sessionId, updates)
  }

  /**
   * Fail a sync session
   * 
   * @param {string} sessionId - Session identifier
   * @param {string} error - Error message
   * @returns {Object} Final progress data
   */
  failSession(sessionId, error) {
    return this.completeSession(sessionId, false, `Sync failed: ${error}`)
  }

  /**
   * Clean up old sessions
   * 
   * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
   */
  cleanupOldSessions(maxAgeMs = 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAgeMs
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastUpdate < cutoff) {
        this.sessions.delete(sessionId)
      }
    }
  }

  /**
   * Get all active sessions
   * 
   * @returns {Array} Array of active session data
   */
  getActiveSessions() {
    return Array.from(this.sessions.values())
  }

  /**
   * Remove a session
   * 
   * @param {string} sessionId - Session identifier
   */
  removeSession(sessionId) {
    this.sessions.delete(sessionId)
  }
}

// Global instance
const syncProgressTracker = new SyncProgressTracker()

// Cleanup old sessions every 10 minutes
setInterval(() => {
  syncProgressTracker.cleanupOldSessions()
}, 10 * 60 * 1000)

export default syncProgressTracker 