CREATE TABLE skill_history (
  id BIGSERIAL PRIMARY KEY,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT
);

CREATE INDEX idx_skill_history_skill_id ON skill_history(skill_id);
CREATE INDEX idx_skill_history_recorded_at ON skill_history(recorded_at);

INSERT INTO skill_history (skill_id, percentage, recorded_at, note)
SELECT id, GREATEST(percentage - 25, 10), (CURRENT_DATE - INTERVAL '12 months')::DATE, 'Initial baseline'
FROM skills;

INSERT INTO skill_history (skill_id, percentage, recorded_at, note)
SELECT id, GREATEST(percentage - 15, 20), (CURRENT_DATE - INTERVAL '6 months')::DATE, '6-month checkpoint'
FROM skills;

INSERT INTO skill_history (skill_id, percentage, recorded_at, note)
SELECT id, GREATEST(percentage - 5, 30), (CURRENT_DATE - INTERVAL '3 months')::DATE, '3-month checkpoint'
FROM skills;

INSERT INTO skill_history (skill_id, percentage, recorded_at, note)
SELECT id, percentage, CURRENT_DATE, 'Current level'
FROM skills;
