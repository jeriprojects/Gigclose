
-- Messages table for per-job conversations
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0 AND length(body) <= 2000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_job_created ON public.messages (job_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages (sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants (client OR assigned worker) or admin can view
CREATE POLICY "Participants can view job messages"
ON public.messages
FOR SELECT
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = messages.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
  )
);

-- Only participants can send, and only as themselves
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = messages.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
  )
);

-- Sender can update their own message (e.g. mark read), admins can update any
CREATE POLICY "Sender or admin can update messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = sender_id OR public.is_admin(auth.uid()));

-- updated_at trigger
CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
