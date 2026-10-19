-- Controla+ — esquema do banco (PostgreSQL / Neon)
-- Pode ser executado várias vezes sem erro: npm run db:setup

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email         text NOT NULL CHECK (char_length(email) <= 254),
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,                      -- SHA-256 do token (o token em si nunca é guardado)
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  user_agent text
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction    text NOT NULL CHECK (direction IN ('Entrada', 'Saída')),
  entry_date   date NOT NULL,
  company      text NOT NULL CHECK (char_length(company) BETWEEN 1 AND 160),
  invoice      text NOT NULL CHECK (char_length(invoice) BETWEEN 1 AND 200),
  type         text NOT NULL CHECK (char_length(type) BETWEEN 1 AND 80),
  subtype      text NOT NULL DEFAULT '' CHECK (char_length(subtype) <= 80),
  due_date     date,
  value        numeric(14,2) NOT NULL CHECK (value > 0),
  status       text NOT NULL,
  payment_date date,
  notes        text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_status_valid CHECK (
    (direction = 'Entrada' AND status IN ('Recebido', 'A receber')) OR
    (direction = 'Saída'   AND status IN ('Pago', 'Em aberto', 'Quitado'))
  ),
  CONSTRAINT transactions_payment_date_valid CHECK (
    status IN ('Pago', 'Recebido', 'Quitado') OR payment_date IS NULL
  )
);
CREATE INDEX IF NOT EXISTS transactions_user_entry_idx   ON transactions (user_id, entry_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_user_due_idx     ON transactions (user_id, due_date);
CREATE INDEX IF NOT EXISTS transactions_user_status_idx  ON transactions (user_id, status);
CREATE INDEX IF NOT EXISTS transactions_user_company_idx ON transactions (user_id, lower(company));

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS transactions_set_updated_at ON transactions;
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
