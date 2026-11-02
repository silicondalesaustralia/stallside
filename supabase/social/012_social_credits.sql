-- Social credits: Pro monthly allowance + purchased packs (designs, video clips).
-- Run in the social Supabase project's SQL editor. Service role only (RLS on, no policies).
--
-- Ledger rows:
--   purchase  +n  source 'purchased'  (action_id = Stripe PaymentIntent id; never expires)
--   consume   -n  source 'allowance' (period_key = YYYY-MM) and/or 'purchased'
--   refund    +n  mirrors a consume row (same source / period_key)
--   adjust    ±n  admin correction (unique action_id)

CREATE TABLE IF NOT EXISTS social_credit_ledger (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     text NOT NULL,
  business_id  uuid NULL,
  kind         text NOT NULL CHECK (kind IN ('design', 'clip')),
  source       text NOT NULL CHECK (source IN ('allowance', 'purchased')),
  reason       text NOT NULL CHECK (reason IN ('purchase', 'consume', 'refund', 'adjust')),
  delta        integer NOT NULL,
  action_id    text NOT NULL,
  period_key   text NULL,
  pack_id      text NULL,
  amount_cents integer NULL,
  currency     text NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_credit_ledger_once UNIQUE (owner_id, kind, reason, source, action_id)
);

CREATE INDEX IF NOT EXISTS social_credit_ledger_owner_kind ON social_credit_ledger (owner_id, kind);
CREATE INDEX IF NOT EXISTS social_credit_ledger_action ON social_credit_ledger (kind, action_id);

ALTER TABLE social_credit_ledger ENABLE ROW LEVEL SECURITY;
GRANT ALL ON social_credit_ledger TO service_role;

-- Atomic charge: monthly allowance first, then purchased credits. Idempotent per action.
CREATE OR REPLACE FUNCTION social_credit_consume(
  p_owner_id text, p_business_id uuid, p_kind text, p_action_id text,
  p_count integer, p_allowance integer, p_period_key text
) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_used integer; v_purchased integer; v_from_allowance integer; v_from_purchased integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_owner_id || ':' || p_kind));
  IF EXISTS (SELECT 1 FROM social_credit_ledger WHERE owner_id = p_owner_id AND kind = p_kind
             AND reason = 'consume' AND action_id = p_action_id) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;
  SELECT COALESCE(-SUM(delta), 0) INTO v_used FROM social_credit_ledger
   WHERE owner_id = p_owner_id AND kind = p_kind AND source = 'allowance' AND period_key = p_period_key;
  SELECT COALESCE(SUM(delta), 0) INTO v_purchased FROM social_credit_ledger
   WHERE owner_id = p_owner_id AND kind = p_kind AND source = 'purchased';
  v_from_allowance := LEAST(p_count, GREATEST(p_allowance - v_used, 0));
  v_from_purchased := p_count - v_from_allowance;
  IF v_from_purchased > v_purchased THEN
    RETURN jsonb_build_object('ok', false, 'allowance_left', GREATEST(p_allowance - v_used, 0), 'purchased', v_purchased);
  END IF;
  IF v_from_allowance > 0 THEN
    INSERT INTO social_credit_ledger (owner_id, business_id, kind, source, reason, delta, action_id, period_key)
    VALUES (p_owner_id, p_business_id, p_kind, 'allowance', 'consume', -v_from_allowance, p_action_id, p_period_key);
  END IF;
  IF v_from_purchased > 0 THEN
    INSERT INTO social_credit_ledger (owner_id, business_id, kind, source, reason, delta, action_id)
    VALUES (p_owner_id, p_business_id, p_kind, 'purchased', 'consume', -v_from_purchased, p_action_id);
  END IF;
  RETURN jsonb_build_object('ok', true, 'already', false,
    'from_allowance', v_from_allowance, 'from_purchased', v_from_purchased);
END $$;

-- Give back up to p_count (NULL = all) of an action's charge, purchased credits first. One refund per action.
CREATE OR REPLACE FUNCTION social_credit_refund(p_kind text, p_action_id text, p_count integer DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  r record; v_remaining integer := COALESCE(p_count, 2147483647); v_refunded integer := 0; v_n integer;
BEGIN
  FOR r IN SELECT owner_id, business_id, source, -delta AS charged, period_key FROM social_credit_ledger
            WHERE kind = p_kind AND reason = 'consume' AND action_id = p_action_id
            ORDER BY CASE source WHEN 'purchased' THEN 0 ELSE 1 END LOOP
    PERFORM pg_advisory_xact_lock(hashtext(r.owner_id || ':' || p_kind));
    IF v_refunded = 0 AND EXISTS (SELECT 1 FROM social_credit_ledger WHERE kind = p_kind
        AND reason = 'refund' AND action_id = p_action_id) THEN
      RETURN 0;
    END IF;
    EXIT WHEN v_remaining <= 0;
    v_n := LEAST(r.charged, v_remaining);
    IF v_n > 0 THEN
      INSERT INTO social_credit_ledger (owner_id, business_id, kind, source, reason, delta, action_id, period_key)
      VALUES (r.owner_id, r.business_id, p_kind, r.source, 'refund', v_n, p_action_id, r.period_key);
      v_refunded := v_refunded + v_n;
      v_remaining := v_remaining - v_n;
    END IF;
  END LOOP;
  RETURN v_refunded;
END $$;

-- Purchased balance and this period's allowance use, per kind.
CREATE OR REPLACE FUNCTION social_credit_summary(p_owner_id text, p_period_key text)
RETURNS TABLE (kind text, purchased integer, allowance_used integer) LANGUAGE sql STABLE AS $$
  SELECT k.kind,
         COALESCE(SUM(l.delta) FILTER (WHERE l.source = 'purchased'), 0)::integer,
         COALESCE(-SUM(l.delta) FILTER (WHERE l.source = 'allowance' AND l.period_key = p_period_key), 0)::integer
    FROM (VALUES ('design'), ('clip')) AS k(kind)
    LEFT JOIN social_credit_ledger l ON l.kind = k.kind AND l.owner_id = p_owner_id
   GROUP BY k.kind;
$$;

GRANT EXECUTE ON FUNCTION social_credit_consume(text, uuid, text, text, integer, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION social_credit_refund(text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION social_credit_summary(text, text) TO service_role;
REVOKE EXECUTE ON FUNCTION social_credit_consume(text, uuid, text, text, integer, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION social_credit_refund(text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION social_credit_summary(text, text) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
