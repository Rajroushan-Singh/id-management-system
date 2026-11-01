-- For an existing installation, preserve every legacy refresh token by giving
-- it a session. A clean installation will create these tables through JPA after
-- Flyway has run, so the base-table-dependent work is conditional.
DO $$
DECLARE
    token_row RECORD;
    new_session_id UUID;
BEGIN
    IF to_regclass('public.users') IS NOT NULL
       AND to_regclass('public.refresh_tokens') IS NOT NULL THEN
        CREATE TABLE IF NOT EXISTS user_sessions (
            id UUID PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE refresh_tokens
            ADD COLUMN IF NOT EXISTS session_id UUID;

        FOR token_row IN
            SELECT id, user_id, revoked
            FROM refresh_tokens
            WHERE session_id IS NULL
        LOOP
            new_session_id := gen_random_uuid();
            INSERT INTO user_sessions (id, user_id, active, created_at)
            VALUES (new_session_id, token_row.user_id, NOT token_row.revoked, CURRENT_TIMESTAMP);
            UPDATE refresh_tokens SET session_id = new_session_id WHERE id = token_row.id;
        END LOOP;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'fk_refresh_tokens_session'
              AND conrelid = 'refresh_tokens'::regclass
        ) THEN
            ALTER TABLE refresh_tokens
                ADD CONSTRAINT fk_refresh_tokens_session
                FOREIGN KEY (session_id) REFERENCES user_sessions(id)
                ON DELETE CASCADE;
        END IF;

        ALTER TABLE refresh_tokens ALTER COLUMN session_id SET NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id
            ON refresh_tokens(session_id);
    END IF;
END $$;
