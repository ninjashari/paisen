/**
 * Anime Mapping Modal Component
 * 
 * This component provides a modal interface for users to:
 * - View suggested anime mappings from the offline database
 * - Confirm suggested mappings
 * - Manually enter AniDB ID if the suggested mapping is incorrect
 * - Search for alternative mappings
 * 
 * Features:
 * - Bootstrap modal interface
 * - Mapping confirmation workflow
 * - Manual mapping entry
 * - Search functionality
 * - Validation and error handling
 */

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AnimeMappingModal({ 
  isOpen, 
  onClose, 
  anime, 
  onMappingConfirmed 
}) {
  const [suggestedMapping, setSuggestedMapping] = useState(null)
  const [manualAnidbId, setManualAnidbId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('loading') // 'loading', 'confirm', 'manual', 'success'

  /**
   * Fetch suggested mapping when modal opens
   */
  useEffect(() => {
    if (isOpen && anime?.malId) {
      fetchSuggestedMapping()
    }
  }, [isOpen, anime])

  /**
   * Fetch suggested mapping from the offline database
   */
  const fetchSuggestedMapping = async () => {
    setIsLoading(true)
    setError(null)
    setMode('loading')

    try {
      const response = await axios.get(`/api/anime/mapping?malId=${anime.malId}`)
      
      if (response.data.success) {
        setSuggestedMapping(response.data.mapping)
        setMode('confirm')
      } else {
        setMode('manual')
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setMode('manual')
      } else {
        setError(err.response?.data?.message || 'Failed to fetch mapping suggestion')
        setMode('manual')
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Confirm the suggested mapping
   */
  const confirmMapping = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.put('/api/anime/mapping', {
        malId: anime.malId
      })

      if (response.data.success) {
        setMode('success')
        onMappingConfirmed(response.data.mapping)
      } else {
        setError(response.data.message || 'Failed to confirm mapping')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm mapping')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create manual mapping
   */
  const createManualMapping = async () => {
    if (!manualAnidbId.trim()) {
      setError('Please enter an AniDB ID')
      return
    }

    const anidbId = parseInt(manualAnidbId.trim())
    if (isNaN(anidbId) || anidbId <= 0) {
      setError('Please enter a valid AniDB ID (positive number)')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/anime/mapping', {
        malId: anime.malId,
        anidbId: anidbId,
        animeTitle: anime.title
      })

      if (response.data.success) {
        setMode('success')
        onMappingConfirmed(response.data.mapping)
      } else {
        setError(response.data.message || 'Failed to create manual mapping')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create manual mapping')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Reset modal state when closing
   */
  const handleClose = () => {
    setSuggestedMapping(null)
    setManualAnidbId('')
    setError(null)
    setMode('loading')
    onClose()
  }

  /**
   * Switch to manual mode
   */
  const switchToManualMode = () => {
    setMode('manual')
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-diagram-3 me-2"></i>
              Map Anime to AniDB
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Anime Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-film me-2"></i>
                  {anime?.title}
                </h6>
                <p className="card-text">
                  <small className="text-muted">
                    MAL ID: {anime?.malId} | Type: {anime?.type} | Episodes: {anime?.episodes}
                  </small>
                </p>
              </div>
            </div>

            {/* Loading State */}
            {mode === 'loading' && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Searching for mapping suggestions...</p>
              </div>
            )}

            {/* Confirm Mapping Mode */}
            {mode === 'confirm' && suggestedMapping && (
              <div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  We found a suggested mapping for this anime:
                </div>

                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title">Suggested Mapping</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <strong>AniDB ID:</strong> {suggestedMapping.anidbId}
                      </div>
                      <div className="col-md-6">
                        <strong>Source:</strong> {suggestedMapping.mappingSource}
                      </div>
                    </div>
                    {suggestedMapping.metadata?.synonyms?.length > 0 && (
                      <div className="mt-2">
                        <strong>Alternative Titles:</strong>
                        <div className="text-muted small">
                          {suggestedMapping.metadata.synonyms.slice(0, 3).join(', ')}
                          {suggestedMapping.metadata.synonyms.length > 3 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={confirmMapping}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirm This Mapping
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={switchToManualMode}
                    disabled={isLoading}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Enter Different AniDB ID
                  </button>
                </div>
              </div>
            )}

            {/* Manual Mapping Mode */}
            {mode === 'manual' && (
              <div>
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No automatic mapping found or you chose to enter manually.
                  Please enter the correct AniDB ID for this anime.
                </div>

                <div className="mb-3">
                  <label htmlFor="anidbId" className="form-label">
                    AniDB ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="anidbId"
                    value={manualAnidbId}
                    onChange={(e) => setManualAnidbId(e.target.value)}
                    placeholder="Enter AniDB ID (e.g., 4563)"
                    min="1"
                  />
                  <div className="form-text">
                    You can find the AniDB ID in the URL when viewing the anime on{' '}
                    <a href="https://anidb.net" target="_blank" rel="noopener noreferrer">
                      anidb.net
                    </a>
                    . For example: anidb.net/anime/4563
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={createManualMapping}
                  disabled={isLoading || !manualAnidbId.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Mapping...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Manual Mapping
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Mode */}
            {mode === 'success' && (
              <div className="text-center py-4">
                <div className="text-success mb-3">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="text-success">Mapping Created Successfully!</h5>
                <p className="text-muted">
                  The anime has been mapped to AniDB and saved to your database.
                </p>
                <button className="btn btn-success" onClick={handleClose}>
                  <i className="bi bi-check me-2"></i>
                  Done
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mt-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
          </div>

          {mode !== 'success' && (
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 