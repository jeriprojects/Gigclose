ALTER TABLE public.messages
ADD COLUMN recipient_id UUID;

DROP POLICY IF EXISTS "Participants can view job messages" ON public.messages;
CREATE POLICY "Participants can view job messages"
ON public.messages
FOR SELECT
USING (
  public.is_admin(auth.uid())
  OR (
    auth.uid() IN (sender_id, recipient_id)
    AND EXISTS (
      SELECT 1
      FROM public.jobs j
      WHERE j.id = messages.job_id
        AND (
          (
            messages.recipient_id IS NULL
            AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
          )
          OR (
            messages.recipient_id IS NOT NULL
            AND (
              (j.client_id = messages.sender_id AND j.worker_id = messages.recipient_id)
              OR (j.client_id = messages.recipient_id AND j.worker_id = messages.sender_id)
              OR EXISTS (
                SELECT 1
                FROM public.job_applications a
                WHERE a.job_id = messages.job_id
                  AND (
                    (a.worker_id = messages.sender_id AND j.client_id = messages.recipient_id)
                    OR (a.worker_id = messages.recipient_id AND j.client_id = messages.sender_id)
                  )
              )
            )
          )
        )
    )
  )
);

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND recipient_id IS NOT NULL
  AND recipient_id <> sender_id
  AND EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = messages.job_id
      AND (
        (j.client_id = sender_id AND j.worker_id = recipient_id)
        OR (j.client_id = recipient_id AND j.worker_id = sender_id)
        OR EXISTS (
          SELECT 1
          FROM public.job_applications a
          WHERE a.job_id = messages.job_id
            AND (
              (a.worker_id = sender_id AND j.client_id = recipient_id)
              OR (a.worker_id = recipient_id AND j.client_id = sender_id)
            )
        )
      )
  )
);

CREATE OR REPLACE FUNCTION public.prevent_message_conversation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.job_id IS DISTINCT FROM OLD.job_id
    OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
    OR NEW.recipient_id IS DISTINCT FROM OLD.recipient_id THEN
    RAISE EXCEPTION 'Message conversation participants cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_message_conversation_change ON public.messages;
CREATE TRIGGER prevent_message_conversation_change
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_message_conversation_change();
