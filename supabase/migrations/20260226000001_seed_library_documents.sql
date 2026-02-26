-- Legal Library Seed Data
-- Created: 2026-02-26

-- Seed sample legal documents

-- 1. US EIN Application (IRS)
INSERT INTO library_documents (
    country, authority, domain, official_name, slug, short_description, full_description, 
    purpose, who_must_file, filing_method, official_source_url, version, last_verified_at, 
    parsing_confidence, needs_review
) VALUES (
    'United States', 'IRS', 'Taxation', 
    'Employer Identification Number (EIN) Application', 
    'us-ein-application',
    'Apply for a federal tax ID number for your business',
    'The Employer Identification Number (EIN) is a federal tax identification number assigned by the Internal Revenue Service (IRS) to businesses operating in the United States. It is used to identify the tax account of employers and certain other entities.',
    'An EIN is required for businesses to file tax returns, open bank accounts, hire employees, and apply for business licenses.',
    'All businesses operating in the US must obtain an EIN, including sole proprietorships with employees, corporations, partnerships, LLCs, trusts, estates, and certain nonprofit organizations.',
    'Online application via IRS website, by fax, or by mail',
    'https://www.irs.gov/ein', 
    '2024-1', NOW(), 0.98, false
);

-- 2. California LLC Formation
INSERT INTO library_documents (
    country, state, authority, domain, official_name, slug, short_description, full_description, 
    purpose, who_must_file, filing_method, official_source_url, version, last_verified_at, 
    parsing_confidence, needs_review
) VALUES (
    'United States', 'California', 'California Secretary of State', 'Business Registration', 
    'California Limited Liability Company (LLC) Formation',
    'california-llc-formation',
    'Form a Limited Liability Company in California',
    'To form an LLC in California, you must file Articles of Organization (Form LLC-1) with the California Secretary of State and pay the required filing fee. California has specific requirements for LLCs including an $800 annual franchise tax.',
    'An LLC provides limited liability protection to its owners (members) while allowing pass-through taxation. Required for businesses wanting to operate as an LLC in California.',
    'Any person or group wanting to start a business as a Limited Liability Company in California',
    'Online filing via California Secretary of State website or mail',
    'https://www.sos.ca.gov/business-programs',
    '2024-1', NOW(), 0.96, false
);

-- 3. India GST Registration
INSERT INTO library_documents (
    country, authority, domain, official_name, slug, short_description, full_description, 
    purpose, who_must_file, filing_method, official_source_url, version, last_verified_at, 
    parsing_confidence, needs_review
) VALUES (
    'India', 'CBIC', 'Taxation', 
    'Goods and Services Tax (GST) Registration',
    'india-gst-registration',
    'Register for GST to collect and pay taxes in India',
    'GST (Goods and Services Tax) is an indirect tax used in India on the supply of goods and services. It is a comprehensive, multistage, destination-based tax that has replaced multiple indirect taxes such as VAT, excise duty, service tax, etc.',
    'GST registration is mandatory for businesses with annual turnover exceeding Rs. 40 lakh (Rs. 20 lakh for special category states). It allows businesses to collect GST from customers and claim input tax credits.',
    'All businesses exceeding the threshold limit, inter-state suppliers, e-commerce operators, and businesses required to pay tax under reverse charge mechanism',
    'Online application via GST portal (www.gst.gov.in)',
    'https://www.gst.gov.in',
    '2024-1', NOW(), 0.97, false
);

-- 4. India FSSAI Basic License
INSERT INTO library_documents (
    country, authority, domain, official_name, slug, short_description, full_description, 
    purpose, who_must_file, filing_method, official_source_url, version, last_verified_at, 
    parsing_confidence, needs_review
) VALUES (
    'India', 'FSSAI', 'Food Safety', 
    'FSSAI Food Safety License Registration',
    'india-fssai-basic-license',
    'Obtain food safety license for food businesses in India',
    'The Food Safety and Standards Authority of India (FSSAI) is the apex body responsible for protecting and promoting public health through the regulation and supervision of food safety. Any food business operator must obtain an FSSAI registration or license.',
    'FSSAI license is mandatory for all food business operators including manufacturers, processors, transporters, distributors, and retailers of food products.',
    'All food business operators in India including manufacturers, packers, distributors, importers, and retailers of food products',
    'Online application via FSSAI portal (www.fssai.gov.in)',
    'https://www.fssai.gov.in',
    '2024-1', NOW(), 0.95, false
);

-- 5. India Udyam Registration (MSME)
INSERT INTO library_documents (
    country, authority, domain, official_name, slug, short_description, full_description, 
    purpose, who_must_file, filing_method, official_source_url, version, last_verified_at, 
    parsing_confidence, needs_review
) VALUES (
    'India', 'UDYAM', 'MSME', 
    'Udyam Registration (MSME Registration)',
    'india-udyam-registration',
    'Register your business as a Micro, Small, or Medium Enterprise',
    'Udyam Registration is a government registration for Micro, Small and Medium Enterprises (MSMEs) in India. It provides a unique identification number and a certificate can be downloaded after registration. MSMEs get various benefits including easier access to credit, tax benefits, and government scheme eligibility.',
    'Udyam Registration enables businesses to avail benefits under various government schemes for MSME sector including priority sector lending, tax exemptions, and preference in government tenders.',
    'All Micro, Small and Medium Enterprises in India - manufacturing and service sector businesses meeting the investment and turnover criteria',
    'Online self-declaration via Udyam portal (udyamregistration.gov.in)',
    'https://udyamregistration.gov.in',
    '2024-1', NOW(), 0.94, false
);

-- Now add fields for EIN Application
INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'legal_name', 'Legal Name of Business', 'text', true, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'trade_name', 'Trade Name (if different)', 'text', false, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'business_structure', 'Business Structure', 'select', true, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'date_started', 'Date Business Started', 'date', true, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'principal_activity', 'Principal Business Activity', 'text', true, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'employee_count', 'Number of Employees', 'number', true, '^[0-9]+$', NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'responsible_party_ssn', 'Responsible Party SSN', 'text', true, '^\d{3}-\d{2}-\d{4}$', NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'has_employees', 'Do you have employees?', 'checkbox', true, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'exempt_payee', 'Exempt Payee Code (if applicable)', 'text', false, '^[0-9]{1,2}$', NULL
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'exempt_fatca', 'Exempt From FATCA Reporting', 'checkbox', false, NULL, NULL
FROM library_documents WHERE slug = 'us-ein-application';

-- Add attachments for EIN
INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Proof of Identity', true, 'Government-issued ID of responsible party'
FROM library_documents WHERE slug = 'us-ein-application';

INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Proof of Business Address', true, 'Utility bill or lease agreement'
FROM library_documents WHERE slug = 'us-ein-application';

-- Add fields for GST Registration
INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'legal_name', 'Legal Name / Business Name', 'text', true, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'pan', 'PAN Card Number', 'text', true, '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'mobile', 'Mobile Number', 'text', true, '^[6-9]\d{9}$', NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'email', 'Email Address', 'email', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'state', 'State', 'select', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'business_type', 'Type of Business', 'select', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'turnover', 'Annual Turnover (INR)', 'number', true, '^\d+$', NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'date_commencement', 'Date of Commencement of Business', 'date', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'address', 'Principal Place of Business Address', 'textarea', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'bank_name', 'Bank Name', 'text', true, NULL, NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'bank_account_no', 'Bank Account Number', 'text', true, '^\d{9,18}$', NULL
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'ifsc_code', 'IFSC Code', 'text', true, '^[A-Z]{4}0[A-Z0-9]{6}$', NULL
FROM library_documents WHERE slug = 'india-gst-registration';

-- Conditional field for GST
INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'composition_scheme', 'Apply for Composition Scheme?', 'checkbox', false, NULL, '{"field": "turnover", "operator": "<=", "value": 1500000}'
FROM library_documents WHERE slug = 'india-gst-registration';

-- Add fields for FSSAI
INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'business_name', 'Name of the Food Business', 'text', true, NULL
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'premise_address', 'Address of the Premise', 'textarea', true, NULL
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'contact_person', 'Contact Person Name', 'text', true, NULL
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'contact_mobile', 'Mobile Number', 'text', true, '^[6-9]\d{9}$'
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'contact_email', 'Email Address', 'email', true, NULL
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'category', 'Category of Food Business', 'select', true, NULL
FROM library_documents WHERE slug = 'india-fssai-basic-license';

-- Add fields for Udyam
INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex)
SELECT id, 'enterprise_name', 'Name of Enterprise', 'text', true, NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'enterprise_type', 'Type of Enterprise', 'radio', true, NULL, NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'aadhaar', 'Aadhaar Number', 'text', true, '^\d{12}$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'pan', 'PAN Card', 'text', true, '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'mobile', 'Mobile Number', 'text', true, '^[6-9]\d{9}$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'email', 'Email Address', 'email', false, NULL, NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'address', 'Address of Enterprise', 'textarea', true, NULL, NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'investment', 'Investment in Plant and Machinery (INR)', 'number', true, '^\d+$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'turnover', 'Annual Turnover (INR)', 'number', true, '^\d+$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_fields (document_id, field_name, field_label, field_type, required, validation_regex, conditional_logic)
SELECT id, 'nic_code', 'NIC Code', 'text', true, '^\d{2,5}$', NULL
FROM library_documents WHERE slug = 'india-udyam-registration';

-- Add dependencies for California LLC
INSERT INTO library_dependencies (document_id, dependency_name, dependency_slug, description)
SELECT id, 'EIN Application', 'us-ein-application', 'Federal tax ID required for LLC'
FROM library_documents WHERE slug = 'california-llc-formation';

-- Add dependencies for GST
INSERT INTO library_dependencies (document_id, dependency_name, dependency_slug, description)
SELECT id, 'PAN Card', NULL, 'Required for GST registration'
FROM library_documents WHERE slug = 'india-gst-registration';

INSERT INTO library_dependencies (document_id, dependency_name, dependency_slug, description)
SELECT id, 'Bank Account', NULL, 'Active bank account required'
FROM library_documents WHERE slug = 'india-gst-registration';

-- Add attachments for FSSAI
INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Address Proof', true, 'Electricity bill or water bill or property tax receipt'
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Photo ID', true, 'Aadhaar card or Voter ID or Passport'
FROM library_documents WHERE slug = 'india-fssai-basic-license';

INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Food Safety Course Certificate', false, 'For manufacturing units'
FROM library_documents WHERE slug = 'india-fssai-basic-license';

-- Add attachments for Udyam
INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'Aadhaar Card', true, 'For identity verification'
FROM library_documents WHERE slug = 'india-udyam-registration';

INSERT INTO library_attachments (document_id, attachment_name, is_required, description)
SELECT id, 'PAN Card', true, 'For business identification'
FROM library_documents WHERE slug = 'india-udyam-registration';
