-- 통화 세션 테이블
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 대화 전사본 테이블
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('customer', 'counselor')),
  text TEXT NOT NULL,
  is_final BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- AI 분석 히스토리 테이블
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  query TEXT,
  summary TEXT,
  documents JSONB,
  recommended_script TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SMS 발송 로그 테이블
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  recipient TEXT,
  content TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_call_sessions_counselor_id ON call_sessions(counselor_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_started_at ON call_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON transcripts(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_session_id ON ai_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_session_id ON sms_logs(session_id);

-- RLS (Row Level Security) 정책
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- 상담사는 자신의 세션만 조회 가능
CREATE POLICY "Counselors can view own sessions" ON call_sessions
  FOR SELECT USING (auth.uid() = counselor_id);

CREATE POLICY "Counselors can insert own sessions" ON call_sessions
  FOR INSERT WITH CHECK (auth.uid() = counselor_id);

CREATE POLICY "Counselors can update own sessions" ON call_sessions
  FOR UPDATE USING (auth.uid() = counselor_id);

-- 세션 관련 데이터는 세션 소유자만 접근 가능
CREATE POLICY "Counselors can view own transcripts" ON transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = transcripts.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors can insert transcripts" ON transcripts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = transcripts.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors can view own ai_analyses" ON ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = ai_analyses.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors can insert ai_analyses" ON ai_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = ai_analyses.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors can view own sms_logs" ON sms_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = sms_logs.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors can insert sms_logs" ON sms_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = sms_logs.session_id
      AND call_sessions.counselor_id = auth.uid()
    )
  );
