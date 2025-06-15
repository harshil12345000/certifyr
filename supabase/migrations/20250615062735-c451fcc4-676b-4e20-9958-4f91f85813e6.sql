-- Create the branding-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', false)
ON CONFLICT (id) DO NOTHING;
