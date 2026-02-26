-- Legal Library Database Schema
-- Created: 2026-02-26

-- Create enum type for library tag types
CREATE TYPE library_tag_type AS ENUM ('country', 'state', 'domain', 'authority', 'industry');

-- Create library_documents table
CREATE TABLE library_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL,
    state TEXT,
    authority TEXT NOT NULL,
    domain TEXT NOT NULL,
    official_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    purpose TEXT,
    who_must_file TEXT,
    filing_method TEXT,
    official_source_url TEXT,
    official_pdf_url TEXT,
    version TEXT DEFAULT '1.0',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    parsing_confidence DECIMAL(3,2),
    needs_review BOOLEAN DEFAULT false,
    created_by_admin UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for library_documents
CREATE INDEX idx_library_documents_country ON library_documents(country);
CREATE INDEX idx_library_documents_state ON library_documents(state);
CREATE INDEX idx_library_documents_domain ON library_documents(domain);
CREATE INDEX idx_library_documents_authority ON library_documents(authority);
CREATE INDEX idx_library_documents_slug ON library_documents(slug);

-- Create library_tags table
CREATE TABLE library_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT NOT NULL,
    tag_type library_tag_type NOT NULL,
    UNIQUE(tag_name, tag_type)
);

-- Create index for library_tags
CREATE INDEX idx_library_tags_name_type ON library_tags(tag_name, tag_type);

-- Create library_document_tags junction table
CREATE TABLE library_document_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES library_tags(id) ON DELETE CASCADE,
    UNIQUE(document_id, tag_id)
);

-- Create index for library_document_tags
CREATE INDEX idx_library_document_tags_document ON library_document_tags(document_id);
CREATE INDEX idx_library_document_tags_tag ON library_document_tags(tag_id);

-- Create library_fields table
CREATE TABLE library_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    validation_regex TEXT,
    conditional_logic JSONB,
    pdf_field_mapping TEXT
);

-- Create index for library_fields
CREATE INDEX idx_library_fields_document ON library_fields(document_id);

-- Create library_dependencies table
CREATE TABLE library_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    dependency_name TEXT NOT NULL,
    dependency_slug TEXT,
    description TEXT
);

-- Create index for library_dependencies
CREATE INDEX idx_library_dependencies_document ON library_dependencies(document_id);

-- Create library_attachments table
CREATE TABLE library_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    attachment_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    description TEXT
);

-- Create index for library_attachments
CREATE INDEX idx_library_attachments_document ON library_attachments(document_id);

-- Enable RLS
ALTER TABLE library_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for library_documents (public read, admin write)
CREATE POLICY "library_documents_public_read" ON library_documents
    FOR SELECT USING (true);

CREATE POLICY "library_documents_admin_insert" ON library_documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_documents_admin_update" ON library_documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_documents_admin_delete" ON library_documents
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for library_tags (public read, admin write)
CREATE POLICY "library_tags_public_read" ON library_tags
    FOR SELECT USING (true);

CREATE POLICY "library_tags_admin_insert" ON library_tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_tags_admin_update" ON library_tags
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_tags_admin_delete" ON library_tags
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for library_document_tags (public read, admin write)
CREATE POLICY "library_document_tags_public_read" ON library_document_tags
    FOR SELECT USING (true);

CREATE POLICY "library_document_tags_admin_insert" ON library_document_tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_document_tags_admin_update" ON library_document_tags
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_document_tags_admin_delete" ON library_document_tags
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for library_fields (public read, admin write)
CREATE POLICY "library_fields_public_read" ON library_fields
    FOR SELECT USING (true);

CREATE POLICY "library_fields_admin_insert" ON library_fields
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_fields_admin_update" ON library_fields
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_fields_admin_delete" ON library_fields
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for library_dependencies (public read, admin write)
CREATE POLICY "library_dependencies_public_read" ON library_dependencies
    FOR SELECT USING (true);

CREATE POLICY "library_dependencies_admin_insert" ON library_dependencies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_dependencies_admin_update" ON library_dependencies
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_dependencies_admin_delete" ON library_dependencies
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for library_attachments (public read, admin write)
CREATE POLICY "library_attachments_public_read" ON library_attachments
    FOR SELECT USING (true);

CREATE POLICY "library_attachments_admin_insert" ON library_attachments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "library_attachments_admin_update" ON library_attachments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "library_attachments_admin_delete" ON library_attachments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on library_documents
CREATE TRIGGER update_library_documents_updated_at
    BEFORE UPDATE ON library_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Data: Countries
INSERT INTO library_tags (tag_name, tag_type) VALUES 
    ('United States', 'country'),
    ('India', 'country'),
    ('California', 'state'),
    ('New York', 'state'),
    ('Texas', 'state'),
    ('Maharashtra', 'state'),
    ('Delhi', 'state'),
    ('Karnataka', 'state')
ON CONFLICT (tag_name, tag_type) DO NOTHING;

-- Seed Data: Domains
INSERT INTO library_tags (tag_name, tag_type) VALUES 
    ('Taxation', 'domain'),
    ('Business Registration', 'domain'),
    ('Compliance', 'domain'),
    ('Licensing', 'domain'),
    ('Healthcare', 'domain'),
    ('Food Safety', 'domain'),
    ('MSME', 'domain')
ON CONFLICT (tag_name, tag_type) DO NOTHING;

-- Seed Data: Authorities
INSERT INTO library_tags (tag_name, tag_type) VALUES 
    ('IRS', 'authority'),
    ('California Secretary of State', 'authority'),
    ('CBIC', 'authority'),
    ('FSSAI', 'authority'),
    ('UDYAM', 'authority'),
    ('ROC', 'authority')
ON CONFLICT (tag_name, tag_type) DO NOTHING;

-- Seed Data: Industries
INSERT INTO library_tags (tag_name, tag_type) VALUES 
    ('Manufacturing', 'industry'),
    ('Retail', 'industry'),
    ('E-commerce', 'industry'),
    ('Food & Beverage', 'industry'),
    ('Services', 'industry')
ON CONFLICT (tag_name, tag_type) DO NOTHING;
