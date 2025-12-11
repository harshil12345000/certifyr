-- Delete user data from all related tables first
DELETE FROM public.user_statistics WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.user_profiles WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.organization_members WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.verified_documents WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.document_drafts WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.document_history WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';
DELETE FROM public.preview_generations WHERE user_id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';

-- Delete the user from auth.users
DELETE FROM auth.users WHERE id = '83d1f341-fd2b-45f7-841d-bc37bdd4ebae';