CREATE TABLE IF NOT EXISTS templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    fields jsonb NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Optionally, add an index for created_by
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by); 