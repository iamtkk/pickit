import { supabase } from './supabase';

// Manual cleanup function for expired polls
export async function cleanupExpiredPolls(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    // Call the database function to cleanup expired polls
    const { data, error } = await supabase
      .rpc('cleanup_expired_polls');

    if (error) {
      console.error('Error cleaning up expired polls:', error);
      return { success: false, error: error.message };
    }

    console.log(`Successfully cleaned up ${data} expired polls`);
    return { success: true, deletedCount: data };
  } catch (err) {
    console.error('Unexpected error during cleanup:', err);
    return { success: false, error: 'Unexpected error during cleanup' };
  }
}

// Get statistics about polls that will be cleaned up
export async function getCleanupStats(): Promise<{
  expiredPolls: number;
  pollsToDelete: number;
  votesToDelete: number;
} | null> {
  try {
    // Count polls that have expired
    const { data: expiredData, error: expiredError } = await supabase
      .from('polls')
      .select('id', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    if (expiredError) {
      console.error('Error counting expired polls:', expiredError);
      return null;
    }

    // Count polls that expired more than 7 days ago (will be deleted)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: toDeleteData, error: toDeleteError } = await supabase
      .from('polls')
      .select('id', { count: 'exact', head: true })
      .lt('expires_at', sevenDaysAgo);

    if (toDeleteError) {
      console.error('Error counting polls to delete:', toDeleteError);
      return null;
    }

    // Get IDs of polls to be deleted for vote counting
    const { data: pollIds, error: pollIdsError } = await supabase
      .from('polls')
      .select('id')
      .lt('expires_at', sevenDaysAgo);

    if (pollIdsError || !pollIds) {
      console.error('Error getting poll IDs:', pollIdsError);
      return null;
    }

    // Count votes that will be deleted
    let votesToDelete = 0;
    if (pollIds.length > 0) {
      const { count, error: votesError } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .in('poll_id', pollIds.map(p => p.id));

      if (votesError) {
        console.error('Error counting votes to delete:', votesError);
      } else {
        votesToDelete = count || 0;
      }
    }

    return {
      expiredPolls: expiredData || 0,
      pollsToDelete: toDeleteData || 0,
      votesToDelete: votesToDelete
    };
  } catch (err) {
    console.error('Error getting cleanup stats:', err);
    return null;
  }
}

// Get all expired polls (for review before deletion)
export async function getExpiredPolls(): Promise<any[]> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .lt('expires_at', sevenDaysAgo)
      .order('expires_at', { ascending: false });

    if (error) {
      console.error('Error fetching expired polls:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getExpiredPolls:', err);
    return [];
  }
}