CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_notified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
