DO $$
BEGIN
    IF to_regclass('public.users') IS NOT NULL THEN
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL;
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

        -- Remove stale permanent lock flags from the previous implementation;
        -- future lock state is represented by locked_until.
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'locked'
        ) THEN
            UPDATE users SET locked = FALSE WHERE locked = TRUE;
        END IF;

        CREATE TABLE IF NOT EXISTS login_attempts (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
            email VARCHAR(150) NOT NULL,
            successful BOOLEAN NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE login_attempts ALTER COLUMN user_id DROP NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created_at
            ON login_attempts(email, created_at DESC);
    END IF;
END $$;
