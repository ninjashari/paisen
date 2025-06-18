/**
 * Sync Progress API Endpoint
 *
 * This endpoint provides real-time progress information for a specific
 * synchronization session. It retrieves the latest progress data from the
 * SyncProgressService cache and returns it to the client.
 */
import syncProgressService from '@/lib/syncProgress';

export default function handler(req, res) {
  const { sessionId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID is required' });
  }

  const progress = syncProgressService.getProgress(sessionId);

  if (progress) {
    return res.status(200).json(progress);
  } else {
    return res.status(404).json({ success: false, message: 'Session not found or expired' });
  }
} 