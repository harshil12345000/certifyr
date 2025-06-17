

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_organization_id"("user_id" "uuid") RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $_$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = $1 
  LIMIT 1;
$_$;


ALTER FUNCTION "public"."get_user_organization_id"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organizations"("check_user_id" "uuid") RETURNS TABLE("organization_id" "uuid", "role" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = check_user_id;
$$;


ALTER FUNCTION "public"."get_user_organizations"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert into profiles table if it exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Insert into user_profiles table with organization data
  INSERT INTO public.user_profiles (
    user_id,
    first_name,
    last_name,
    email,
    phone_number,
    organization_name,
    organization_type,
    organization_size,
    organization_website,
    organization_location
  ) VALUES (
    NEW.id,
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'User'),
    COALESCE(NULLIF(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''), ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'organization_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'organization_type' = 'Other' 
      THEN NEW.raw_user_meta_data->>'organization_type_other'
      ELSE NEW.raw_user_meta_data->>'organization_type'
    END,
    NEW.raw_user_meta_data->>'organization_size',
    NEW.raw_user_meta_data->>'organization_website',
    NEW.raw_user_meta_data->>'organization_location'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number,
    organization_name = EXCLUDED.organization_name,
    organization_type = EXCLUDED.organization_type,
    organization_size = EXCLUDED.organization_size,
    organization_website = EXCLUDED.organization_website,
    organization_location = EXCLUDED.organization_location,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_organization_admin"("check_user_id" "uuid", "check_org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = check_user_id 
    AND organization_id = check_org_id 
    AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_organization_admin"("check_user_id" "uuid", "check_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_user_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_admin_of_org"("user_id" "uuid", "org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $_$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = $1 
    AND organization_id = $2 
    AND role = 'admin'
  );
$_$;


ALTER FUNCTION "public"."is_user_admin_of_org"("user_id" "uuid", "org_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "organization_id" "uuid",
    "is_global" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branding_files" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "path" "text",
    "organization_id" "uuid",
    "uploaded_by" "uuid"
);


ALTER TABLE "public"."branding_files" OWNER TO "postgres";


ALTER TABLE "public"."branding_files" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."branding_files_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "verification_hash" character varying(64) NOT NULL,
    "verified_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    "verification_result" character varying(20) NOT NULL,
    CONSTRAINT "document_verifications_verification_result_check" CHECK ((("verification_result")::"text" = ANY ((ARRAY['valid'::character varying, 'invalid'::character varying, 'expired'::character varying, 'not_found'::character varying])::"text"[])))
);


ALTER TABLE "public"."document_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "recipient" "text",
    "template_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "documents_status_check" CHECK (("status" = ANY (ARRAY['Created'::"text", 'Sent'::"text", 'Signed'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "organization_invites_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"]))),
    CONSTRAINT "organization_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."organization_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "invited_email" "text",
    "status" "text" DEFAULT 'active'::"text",
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"]))),
    CONSTRAINT "organization_members_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "phone" "text",
    "email" "text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_verification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "verification_hash" character varying NOT NULL,
    "scanned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "verification_result" character varying NOT NULL,
    "document_id" "uuid",
    "template_type" character varying,
    "organization_id" "uuid",
    "user_id" "uuid",
    CONSTRAINT "qr_verification_logs_verification_result_check" CHECK ((("verification_result")::"text" = ANY ((ARRAY['verified'::character varying, 'not_found'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."qr_verification_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_announcement_reads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "announcement_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_announcement_reads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_appearance_settings" (
    "id" "text" DEFAULT '1'::"text" NOT NULL,
    "user_id" "uuid",
    "theme" "text" DEFAULT 'light'::"text",
    "text_size" "text" DEFAULT 'medium'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_appearance_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone_number" "text",
    "organization_name" "text",
    "organization_type" "text",
    "organization_size" "text",
    "organization_website" "text",
    "organization_location" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verified_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "verification_hash" character varying(64) NOT NULL,
    "document_data" "jsonb" NOT NULL,
    "template_type" character varying(50) NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "organization_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."verified_documents" OWNER TO "postgres";


ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branding_files"
    ADD CONSTRAINT "branding_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_verifications"
    ADD CONSTRAINT "document_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_verification_logs"
    ADD CONSTRAINT "qr_verification_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branding_files"
    ADD CONSTRAINT "unique_org_branding_name" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."user_announcement_reads"
    ADD CONSTRAINT "user_announcement_reads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_announcement_reads"
    ADD CONSTRAINT "user_announcement_reads_user_id_announcement_id_key" UNIQUE ("user_id", "announcement_id");



ALTER TABLE ONLY "public"."user_appearance_settings"
    ADD CONSTRAINT "user_appearance_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."verified_documents"
    ADD CONSTRAINT "verified_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verified_documents"
    ADD CONSTRAINT "verified_documents_verification_hash_key" UNIQUE ("verification_hash");



CREATE INDEX "idx_document_verifications_hash" ON "public"."document_verifications" USING "btree" ("verification_hash");



CREATE INDEX "idx_documents_user_id_created_at" ON "public"."documents" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_qr_verification_logs_hash" ON "public"."qr_verification_logs" USING "btree" ("verification_hash");



CREATE INDEX "idx_qr_verification_logs_scanned_at" ON "public"."qr_verification_logs" USING "btree" ("scanned_at");



CREATE INDEX "idx_verified_documents_hash" ON "public"."verified_documents" USING "btree" ("verification_hash");



CREATE INDEX "idx_verified_documents_org" ON "public"."verified_documents" USING "btree" ("organization_id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_announcement_reads"
    ADD CONSTRAINT "user_announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id");



ALTER TABLE ONLY "public"."user_announcement_reads"
    ADD CONSTRAINT "user_announcement_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_appearance_settings"
    ADD CONSTRAINT "user_appearance_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verified_documents"
    ADD CONSTRAINT "verified_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."verified_documents"
    ADD CONSTRAINT "verified_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can create org announcements" ON "public"."announcements" FOR INSERT TO "authenticated" WITH CHECK ((("organization_id" = "public"."get_user_organization_id"("auth"."uid"())) AND "public"."is_user_admin_of_org"("auth"."uid"(), "organization_id")));



CREATE POLICY "Admins can create org invites" ON "public"."organization_invites" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete org invites" ON "public"."organization_invites" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage their org announcements" ON "public"."announcements" TO "authenticated" USING ((("created_by" = "auth"."uid"()) AND ("organization_id" = "public"."get_user_organization_id"("auth"."uid"())) AND "public"."is_user_admin_of_org"("auth"."uid"(), "organization_id")));



CREATE POLICY "Admins can update org invites" ON "public"."organization_invites" FOR UPDATE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view org invites" ON "public"."organization_invites" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Allow public verification logging" ON "public"."qr_verification_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert verification attempts" ON "public"."document_verifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Organization admins can insert their organization" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (("id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text") AND ("organization_members"."status" = 'active'::"text")))));



CREATE POLICY "Organization admins can manage members" ON "public"."organization_members" TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members_1"."organization_id"
   FROM "public"."organization_members" "organization_members_1"
  WHERE (("organization_members_1"."user_id" = "auth"."uid"()) AND ("organization_members_1"."role" = 'admin'::"text") AND ("organization_members_1"."status" = 'active'::"text"))))) WITH CHECK (("organization_id" IN ( SELECT "organization_members_1"."organization_id"
   FROM "public"."organization_members" "organization_members_1"
  WHERE (("organization_members_1"."user_id" = "auth"."uid"()) AND ("organization_members_1"."role" = 'admin'::"text") AND ("organization_members_1"."status" = 'active'::"text")))));



CREATE POLICY "Organization admins can update their organization" ON "public"."organizations" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text") AND ("organization_members"."status" = 'active'::"text"))))) WITH CHECK (("id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text") AND ("organization_members"."status" = 'active'::"text")))));



CREATE POLICY "Organization members can delete branding files" ON "public"."branding_files" FOR DELETE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can insert branding files" ON "public"."branding_files" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can update branding files" ON "public"."branding_files" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view branding files" ON "public"."branding_files" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view their organization" ON "public"."organizations" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text")))));



CREATE POLICY "Organization members can view verification logs" ON "public"."qr_verification_logs" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Public can view active verified documents for verification" ON "public"."verified_documents" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view verification results" ON "public"."document_verifications" FOR SELECT USING (true);



CREATE POLICY "Users can create own verified documents" ON "public"."verified_documents" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own documents" ON "public"."documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own documents" ON "public"."documents" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own verified documents" ON "public"."verified_documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own documents" ON "public"."documents" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own appearance settings" ON "public"."user_appearance_settings" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can mark own announcement reads" ON "public"."user_announcement_reads" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their org announcements" ON "public"."announcements" FOR SELECT TO "authenticated" USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"())) AND ("organization_id" = "public"."get_user_organization_id"("auth"."uid"()))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own documents" ON "public"."documents" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own announcement reads" ON "public"."user_announcement_reads" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own verified documents" ON "public"."verified_documents" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own documents" ON "public"."documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own organization memberships" ON "public"."organization_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own verified documents" ON "public"."verified_documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."branding_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qr_verification_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_announcement_reads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_appearance_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verified_documents" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_user_organization_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organization_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organization_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organizations"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_organization_admin"("check_user_id" "uuid", "check_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_organization_admin"("check_user_id" "uuid", "check_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_organization_admin"("check_user_id" "uuid", "check_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_admin_of_org"("user_id" "uuid", "org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_admin_of_org"("user_id" "uuid", "org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_admin_of_org"("user_id" "uuid", "org_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."branding_files" TO "anon";
GRANT ALL ON TABLE "public"."branding_files" TO "authenticated";
GRANT ALL ON TABLE "public"."branding_files" TO "service_role";



GRANT ALL ON SEQUENCE "public"."branding_files_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."branding_files_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."branding_files_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_verifications" TO "anon";
GRANT ALL ON TABLE "public"."document_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."document_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invites" TO "anon";
GRANT ALL ON TABLE "public"."organization_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invites" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."qr_verification_logs" TO "anon";
GRANT ALL ON TABLE "public"."qr_verification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_verification_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_announcement_reads" TO "anon";
GRANT ALL ON TABLE "public"."user_announcement_reads" TO "authenticated";
GRANT ALL ON TABLE "public"."user_announcement_reads" TO "service_role";



GRANT ALL ON TABLE "public"."user_appearance_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_appearance_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_appearance_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."verified_documents" TO "anon";
GRANT ALL ON TABLE "public"."verified_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."verified_documents" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
