export type DataStatus = "active" | "partial" | "unavailable";
export type VoteResult = "ja" | "nein" | "enthaltung" | "abwesend";
export type AnalysisStatus = "pending" | "analyzed" | "not_assignable";
export type ScopeType = "party" | "member";
export type TrafficLightColor = "gruen" | "gelb" | "rot";
export type PipelineStep = "collect" | "categorize" | "match" | "analyze" | "aggregate";
export type LogStatus = "success" | "error";

export type TopicCategory =
  | "Klimapolitik"
  | "Sozialpolitik"
  | "Wirtschaft"
  | "Migration"
  | "Bildung"
  | "Gesundheit"
  | "Sicherheit"
  | "Digitales"
  | "Außenpolitik"
  | "Finanzen";

export interface Parliament {
  id: string;
  name: string;
  state: string | null;
  legislature: string;
  api_source: string | null;
  data_status: DataStatus;
}

export interface Party {
  id: string;
  name: string;
  full_name: string;
  color: string;
  logo_url: string | null;
}

export interface Member {
  id: string;
  name: string;
  party_id: string;
  parliament_id: string;
  constituency: string | null;
  primary_committee: string | null;
  photo_url: string | null;
  abgeordnetenwatch_id: string | null;
}

export interface Vote {
  id: string;
  parliament_id: string;
  title: string;
  description: string | null;
  date: string;
  source_url: string | null;
  topic_category: TopicCategory | null;
  analysis_status: AnalysisStatus;
}

export interface VoteResultRow {
  id: string;
  vote_id: string;
  member_id: string;
  result: VoteResult;
}

export interface Promise {
  id: string;
  party_id: string;
  parliament_id: string;
  topic_category: TopicCategory;
  text: string;
  text_simple: string | null;
  source: string | null;
  wahlomat_thesis_id: string | null;
}

export interface Analysis {
  id: string;
  vote_id: string;
  promise_id: string;
  party_id: string;
  expected_vote: "ja" | "nein";
  alignment: number;
  reasoning: string;
  reasoning_simple: string | null;
  confidence: number;
  created_at: string;
}

export interface Score {
  id: string;
  scope_type: ScopeType;
  party_id: string | null;
  member_id: string | null;
  parliament_id: string;
  topic_category: TopicCategory | null;
  score: number;
  traffic_light: TrafficLightColor;
  period: string;
  updated_at: string;
}

export interface PipelineLog {
  id: string;
  vote_id: string | null;
  step: PipelineStep;
  status: LogStatus;
  error_message: string | null;
  created_at: string;
}
