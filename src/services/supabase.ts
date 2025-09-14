import { createClient } from '@supabase/supabase-js';
import type { Poll, Vote, PollResult, CreatePollData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get client IP address or unique identifier
async function getClientIp(): Promise<string> {
  // Use localStorage to maintain consistent identifier for the same browser
  const storageKey = 'quickpoll_voter_id';

  // Check if we already have a voter ID stored
  let voterId = localStorage.getItem(storageKey);

  if (voterId) {
    console.log('Using existing voter ID:', voterId);
    return voterId;
  }

  // Try to get real IP address
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const data = await response.json();
      console.log('Got IP address:', data.ip);
      voterId = data.ip;
    }
  } catch (error) {
    console.log('Could not fetch IP, will use fallback');
  }

  // If no IP, generate a unique ID
  if (!voterId) {
    voterId = `voter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated voter ID:', voterId);
  }

  // Store the voter ID for consistency
  localStorage.setItem(storageKey, voterId);
  return voterId;
}

// Create a new poll
export async function createPoll(data: CreatePollData): Promise<Poll | null> {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('User must be authenticated to create a poll');
    return null;
  }

  // Set default expiry to 7 days from now if not provided
  const expiresAt = data.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: poll, error } = await supabase
    .from('polls')
    .insert([
      {
        question: data.question,
        options: data.options,
        expires_at: expiresAt,
        allow_multiple: data.allow_multiple || false,
        is_anonymous: data.is_anonymous !== undefined ? data.is_anonymous : true,
        custom_expires_at: data.custom_expires_at || false,
        user_id: user.id, // Add the user_id
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating poll:', error);
    return null;
  }

  return poll;
}

// Get a poll by ID
export async function getPoll(id: string): Promise<Poll | null> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching poll:', error);
    return null;
  }

  return data;
}

// Submit a vote
export async function submitVote(pollId: string, optionIndex: number, voterName?: string): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    let voteData: any = {
      poll_id: pollId,
      option_index: optionIndex,
      voter_name: voterName,
    };

    if (user) {
      // Authenticated user - use user_id
      voteData.user_id = user.id;
      console.log('Submitting vote as authenticated user:', { pollId, optionIndex, userId: user.id });
    } else {
      // Anonymous user - use voter_id
      const voterId = await getClientIp();
      voteData.voter_id = voterId;
      console.log('Submitting vote as anonymous user:', { pollId, optionIndex, voterId });
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([voteData])
      .select();

    if (error) {
      console.error('Vote submission error details:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      if (error.code === '23505') {
        // Unique constraint violation - user already voted
        alert('이미 이 투표에 참여하셨습니다.');
        return false;
      }

      alert(`투표 제출 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      return false;
    }

    console.log('Vote submitted successfully:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error in submitVote:', err);
    alert('투표 중 예상치 못한 오류가 발생했습니다.');
    return false;
  }
}

// Check if user has already voted
export async function hasUserVoted(pollId: string): Promise<boolean> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check by user_id for authenticated users
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking vote status for authenticated user:', error);
    }

    return !!data;
  } else {
    // Check by voter_id for anonymous users
    const voterId = await getClientIp();

    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('voter_id', voterId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking vote status for anonymous user:', error);
    }

    return !!data;
  }
}

// Get poll results
export async function getPollResults(pollId: string): Promise<PollResult[]> {
  const { data, error } = await supabase
    .rpc('get_poll_results', { poll_uuid: pollId });

  if (error) {
    console.error('Error fetching poll results:', error);
    return [];
  }

  return data || [];
}

// Subscribe to real-time poll updates
export function subscribeToPollUpdates(
  pollId: string,
  onUpdate: (poll: Poll) => void
) {
  const channel = supabase
    .channel(`poll-${pollId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'polls',
        filter: `id=eq.${pollId}`,
      },
      (payload) => {
        onUpdate(payload.new as Poll);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Submit multiple votes for multiple choice polls
export async function submitMultipleVotes(pollId: string, optionIndices: number[], voterName?: string): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    let votes: any[] = [];

    if (user) {
      // Authenticated user - use user_id
      console.log('Submitting multiple votes as authenticated user:', { pollId, optionIndices, userId: user.id });
      votes = optionIndices.map(optionIndex => ({
        poll_id: pollId,
        option_index: optionIndex,
        user_id: user.id,
        voter_name: voterName,
      }));
    } else {
      // Anonymous user - use voter_id
      const voterId = await getClientIp();
      console.log('Submitting multiple votes as anonymous user:', { pollId, optionIndices, voterId });
      votes = optionIndices.map(optionIndex => ({
        poll_id: pollId,
        option_index: optionIndex,
        voter_id: voterId,
        voter_name: voterName,
      }));
    }

    const { data, error } = await supabase
      .from('votes')
      .insert(votes)
      .select();

    if (error) {
      console.error('Multiple votes submission error:', error);
      if (error.code === '23505') {
        alert('이미 이 투표에 참여하셨습니다.');
        return false;
      }
      alert(`투표 제출 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      return false;
    }

    console.log('Multiple votes submitted successfully:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error in submitMultipleVotes:', err);
    alert('투표 중 예상치 못한 오류가 발생했습니다.');
    return false;
  }
}

// Check if user has already voted in a multiple choice poll
export async function hasUserVotedMultiple(pollId: string): Promise<boolean> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check by user_id for authenticated users
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking vote status for authenticated user:', error);
    }

    return !!data && data.length > 0;
  } else {
    // Check by voter_id for anonymous users
    const voterId = await getClientIp();

    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('voter_id', voterId)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking vote status for anonymous user:', error);
    }

    return !!data && data.length > 0;
  }
}

// Get voters list for non-anonymous polls
export async function getVotersList(pollId: string): Promise<Array<{ voter_name: string, option_indices: number[] }>> {
  const { data, error } = await supabase
    .from('votes')
    .select('voter_name, option_index')
    .eq('poll_id', pollId)
    .not('voter_name', 'is', null);

  if (error) {
    console.error('Error fetching voters list:', error);
    return [];
  }

  // Group by voter_name
  const votersMap = new Map<string, number[]>();
  data?.forEach(vote => {
    if (vote.voter_name) {
      if (!votersMap.has(vote.voter_name)) {
        votersMap.set(vote.voter_name, []);
      }
      votersMap.get(vote.voter_name)!.push(vote.option_index);
    }
  });

  return Array.from(votersMap.entries()).map(([voter_name, option_indices]) => ({
    voter_name,
    option_indices,
  }));
}

// Subscribe to real-time vote updates
export function subscribeToVoteUpdates(
  pollId: string,
  onNewVote: () => void
) {
  const channel = supabase
    .channel(`votes-${pollId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `poll_id=eq.${pollId}`,
      },
      () => {
        onNewVote();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Get polls created by a user
export async function getUserPolls(userId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user polls:', error);
    return [];
  }

  return data || [];
}

// Get polls that user has voted on
export async function getUserVotedPolls(userId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      poll_id,
      created_at,
      polls (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching voted polls:', error);
    return [];
  }

  // Extract polls and add voted_at timestamp
  const pollsWithVoteTime = data?.map(item => ({
    ...item.polls,
    voted_at: item.created_at
  })) || [];

  return pollsWithVoteTime;
}

// Delete a poll and all associated votes
export async function deletePoll(pollId: string): Promise<boolean> {
  try {
    // First delete all votes for this poll
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', pollId);

    if (votesError) {
      console.error('Error deleting votes:', votesError);
      return false;
    }

    // Then delete the poll itself
    const { error: pollError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (pollError) {
      console.error('Error deleting poll:', pollError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePoll:', error);
    return false;
  }
}

// Update poll question
export async function updatePoll(pollId: string, updates: { question: string }): Promise<boolean> {
  const { error } = await supabase
    .from('polls')
    .update(updates)
    .eq('id', pollId);

  if (error) {
    console.error('Error updating poll:', error);
    return false;
  }

  return true;
}
