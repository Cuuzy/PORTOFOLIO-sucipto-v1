CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token VARCHAR(64) NOT NULL UNIQUE
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers (email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX idx_newsletter_subscribers_token ON newsletter_subscribers (unsubscribe_token);
