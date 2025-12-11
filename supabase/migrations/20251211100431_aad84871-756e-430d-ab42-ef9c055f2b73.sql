-- Delete user contact.clubenterprises@gmail.com and all related data
-- First delete from all public tables that reference user_id
DELETE FROM public.verified_documents WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.user_statistics WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.user_profiles WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.user_appearance_settings WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.user_announcement_reads WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.profiles WHERE id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.preview_generations WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.organization_members WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.organization_invites WHERE invited_by = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.notifications WHERE org_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8');
DELETE FROM public.documents WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.document_history WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.document_drafts WHERE user_id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.branding_files WHERE uploaded_by = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';
DELETE FROM public.announcements WHERE created_by = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';

-- Finally delete from auth.users
DELETE FROM auth.users WHERE id = 'bf9f6015-b225-4ce2-b44c-fe16ed129ed8';