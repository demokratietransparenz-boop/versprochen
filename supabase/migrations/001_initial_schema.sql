-- Enums
CREATE TYPE data_status AS ENUM ('active', 'partial', 'unavailable');
CREATE TYPE vote_result AS ENUM ('ja', 'nein', 'enthaltung', 'abwesend');
CREATE TYPE analysis_status AS ENUM ('pending', 'analyzed', 'not_assignable');
CREATE TYPE scope_type AS ENUM ('party', 'member');
CREATE TYPE traffic_light AS ENUM ('gruen', 'gelb', 'rot');
CREATE TYPE pipeline_step AS ENUM ('collect', 'categorize', 'match', 'analyze', 'aggregate');
CREATE TYPE log_status AS ENUM ('success', 'error');

-- parliaments
CREATE TABLE parliaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  legislature TEXT NOT NULL,
  api_source TEXT,
  data_status data_status NOT NULL DEFAULT 'unavailable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- parties
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  color TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party_id UUID NOT NULL REFERENCES parties(id),
  parliament_id UUID NOT NULL REFERENCES parliaments(id),
  constituency TEXT,
  primary_committee TEXT,
  photo_url TEXT,
  abgeordnetenwatch_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_members_party ON members(party_id);
CREATE INDEX idx_members_parliament ON members(parliament_id);

-- votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parliament_id UUID NOT NULL REFERENCES parliaments(id),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  source_url TEXT UNIQUE,
  topic_category TEXT,
  analysis_status analysis_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_votes_parliament ON votes(parliament_id);
CREATE INDEX idx_votes_status ON votes(analysis_status);
CREATE INDEX idx_votes_category ON votes(topic_category);

-- vote_results
CREATE TABLE vote_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id),
  member_id UUID NOT NULL REFERENCES members(id),
  result vote_result NOT NULL,
  UNIQUE(vote_id, member_id)
);
CREATE INDEX idx_vote_results_vote ON vote_results(vote_id);
CREATE INDEX idx_vote_results_member ON vote_results(member_id);

-- promises
CREATE TABLE promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id),
  parliament_id UUID NOT NULL REFERENCES parliaments(id),
  topic_category TEXT NOT NULL,
  text TEXT NOT NULL,
  text_simple TEXT,
  source TEXT,
  wahlomat_thesis_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_promises_party ON promises(party_id);
CREATE INDEX idx_promises_category ON promises(topic_category);

-- analyses
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id),
  promise_id UUID NOT NULL REFERENCES promises(id),
  party_id UUID NOT NULL REFERENCES parties(id),
  expected_vote TEXT NOT NULL CHECK (expected_vote IN ('ja', 'nein')),
  alignment REAL NOT NULL CHECK (alignment >= 0 AND alignment <= 1),
  reasoning TEXT NOT NULL,
  reasoning_simple TEXT,
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vote_id, party_id)
);
CREATE INDEX idx_analyses_vote ON analyses(vote_id);
CREATE INDEX idx_analyses_party ON analyses(party_id);
CREATE INDEX idx_analyses_confidence ON analyses(confidence);

-- scores
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_type NOT NULL,
  party_id UUID REFERENCES parties(id),
  member_id UUID REFERENCES members(id),
  parliament_id UUID NOT NULL REFERENCES parliaments(id),
  topic_category TEXT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  traffic_light traffic_light NOT NULL,
  period TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope_type = 'party' AND party_id IS NOT NULL AND member_id IS NULL) OR
    (scope_type = 'member' AND member_id IS NOT NULL AND party_id IS NULL)
  )
);
CREATE INDEX idx_scores_party ON scores(party_id);
CREATE INDEX idx_scores_member ON scores(member_id);
CREATE INDEX idx_scores_parliament ON scores(parliament_id);
CREATE INDEX idx_scores_period ON scores(period);

-- pipeline_logs
CREATE TABLE pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID REFERENCES votes(id),
  step pipeline_step NOT NULL,
  status log_status NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pipeline_logs_step ON pipeline_logs(step);
CREATE INDEX idx_pipeline_logs_status ON pipeline_logs(status);
