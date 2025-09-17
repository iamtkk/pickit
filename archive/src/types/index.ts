export interface Poll {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  expires_at: string;
  is_active: boolean;
  total_votes: number;
  allow_multiple: boolean;
  is_anonymous: boolean;
  custom_expires_at: boolean;
  user_id?: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_index: number;
  voter_id: string;
  voter_name?: string;
  created_at: string;
}

export interface PollResult {
  option_index: number;
  vote_count: number;
}

export interface VoterInfo {
  voter_name: string;
  option_indices: number[];
}

export interface CreatePollData {
  question: string;
  options: string[];
  expires_at?: string;
  allow_multiple?: boolean;
  is_anonymous?: boolean;
  custom_expires_at?: boolean;
}