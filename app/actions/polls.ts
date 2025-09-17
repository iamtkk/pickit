'use server';

import { createClient } from '@/app/lib/supabase/server';
import { CreatePollData, Poll, PollResult, Vote, VoterInfo } from '@/app/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Get voter ID from cookies (for anonymous voting)
async function getVoterId(): Promise<string> {
  const cookieStore = await cookies();
  const voterId = cookieStore.get('voter_id')?.value;

  if (voterId) {
    return voterId;
  }

  // Generate a new voter ID
  const newVoterId = `voter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  cookieStore.set('voter_id', newVoterId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });

  return newVoterId;
}

export async function createPoll(data: CreatePollData): Promise<Poll | null> {
  const supabase = await createClient();

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
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating poll:', error);
    return null;
  }

  revalidatePath('/mypage');
  return poll;
}

export async function getPoll(id: string): Promise<Poll | null> {
  const supabase = await createClient();

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

export async function submitVote(pollId: string, optionIndex: number, voterName?: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let voteData: any = {
      poll_id: pollId,
      option_index: optionIndex,
      voter_name: voterName,
    };

    if (user) {
      voteData.user_id = user.id;
    } else {
      const voterId = await getVoterId();
      voteData.voter_id = voterId;
    }

    const { error } = await supabase
      .from('votes')
      .insert([voteData])
      .select();

    if (error) {
      console.error('Vote submission error:', error);
      if (error.code === '23505') {
        return false;
      }
      return false;
    }

    revalidatePath(`/poll/${pollId}`);
    revalidatePath(`/poll/${pollId}/results`);
    return true;
  } catch (err) {
    console.error('Unexpected error in submitVote:', err);
    return false;
  }
}

export async function submitMultipleVotes(pollId: string, optionIndices: number[], voterName?: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let votes: any[] = [];

    if (user) {
      votes = optionIndices.map(optionIndex => ({
        poll_id: pollId,
        option_index: optionIndex,
        user_id: user.id,
        voter_name: voterName,
      }));
    } else {
      const voterId = await getVoterId();
      votes = optionIndices.map(optionIndex => ({
        poll_id: pollId,
        option_index: optionIndex,
        voter_id: voterId,
        voter_name: voterName,
      }));
    }

    const { error } = await supabase
      .from('votes')
      .insert(votes)
      .select();

    if (error) {
      console.error('Multiple votes submission error:', error);
      if (error.code === '23505') {
        return false;
      }
      return false;
    }

    revalidatePath(`/poll/${pollId}`);
    revalidatePath(`/poll/${pollId}/results`);
    return true;
  } catch (err) {
    console.error('Unexpected error in submitMultipleVotes:', err);
    return false;
  }
}

export async function hasUserVoted(pollId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
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
    const voterId = await getVoterId();

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

export async function hasUserVotedMultiple(pollId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
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
    const voterId = await getVoterId();

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

export async function getPollResults(pollId: string): Promise<PollResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_poll_results', { poll_uuid: pollId });

  if (error) {
    console.error('Error fetching poll results:', error);
    return [];
  }

  return data || [];
}

export async function getVotersList(pollId: string): Promise<VoterInfo[]> {
  const supabase = await createClient();

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

export async function getUserPolls(userId: string): Promise<Poll[]> {
  const supabase = await createClient();

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

export async function getUserVotedPolls(userId: string): Promise<Poll[]> {
  const supabase = await createClient();

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

export async function deletePoll(pollId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

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

    revalidatePath('/mypage');
    return true;
  } catch (error) {
    console.error('Error in deletePoll:', error);
    return false;
  }
}

export async function updatePoll(pollId: string, updates: { question: string }): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('polls')
    .update(updates)
    .eq('id', pollId);

  if (error) {
    console.error('Error updating poll:', error);
    return false;
  }

  revalidatePath('/mypage');
  revalidatePath(`/poll/${pollId}`);
  return true;
}