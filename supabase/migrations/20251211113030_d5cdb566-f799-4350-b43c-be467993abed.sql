-- Delete user data from all related tables first
DELETE FROM public.user_statistics WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.user_profiles WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.organization_members WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.verified_documents WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.document_drafts WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.document_history WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';
DELETE FROM public.preview_generations WHERE user_id = '3d94c932-4c3b-429d-b1bd-42042223b10d';

-- Delete the user from auth.users
DELETE FROM auth.users WHERE id = '3d94c932-4c3b-429d-b1bd-42042223b10d';