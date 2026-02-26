import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LibraryDocument {
  id: string;
  country: string;
  state: string | null;
  authority: string;
  domain: string;
  official_name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  purpose: string | null;
  who_must_file: string | null;
  filing_method: string | null;
  official_source_url: string | null;
  official_pdf_url: string | null;
  version: string;
  last_verified_at: string | null;
  parsing_confidence: number | null;
  needs_review: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryTag {
  id: string;
  tag_name: string;
  tag_type: 'country' | 'state' | 'domain' | 'authority' | 'industry';
}

export interface LibraryField {
  id: string;
  document_id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  required: boolean;
  validation_regex: string | null;
  conditional_logic: Record<string, unknown> | null;
  pdf_field_mapping: string | null;
}

export interface LibraryDependency {
  id: string;
  document_id: string;
  dependency_name: string;
  dependency_slug: string | null;
  description: string | null;
}

export interface LibraryAttachment {
  id: string;
  document_id: string;
  attachment_name: string;
  is_required: boolean;
  description: string | null;
}

export interface LibraryDocumentWithTags extends LibraryDocument {
  library_document_tags: {
    tag_id: string;
    library_tags: LibraryTag;
  }[];
}

export interface LibraryFilters {
  country?: string;
  state?: string;
  domain?: string;
  authority?: string;
  search?: string;
  page?: number;
  limit?: number;
  needsReview?: boolean;
}

export function useLibraryDocuments(filters: LibraryFilters = {}) {
  return useQuery({
    queryKey: ["library", "documents", filters],
    queryFn: async () => {
      let query = supabase
        .from("library_documents")
        .select("*", { count: "exact" });

      if (filters.country) query = query.eq("country", filters.country);
      if (filters.state) query = query.eq("state", filters.state);
      if (filters.domain) query = query.eq("domain", filters.domain);
      if (filters.authority) query = query.eq("authority", filters.authority);
      if (filters.needsReview !== undefined) query = query.eq("needs_review", filters.needsReview);
      if (filters.search) {
        query = query.or(`official_name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        documents: data as LibraryDocument[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    },
  });
}

export function useLibraryDocument(slug: string) {
  return useQuery({
    queryKey: ["library", "document", slug],
    queryFn: async () => {
      const { data: document, error } = await supabase
        .from("library_documents")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      const [tags, fields, dependencies, attachments] = await Promise.all([
        supabase
          .from("library_document_tags")
          .select("library_tags(*)")
          .eq("document_id", document.id),
        supabase
          .from("library_fields")
          .select("*")
          .eq("document_id", document.id)
          .order("field_name"),
        supabase
          .from("library_dependencies")
          .select("*")
          .eq("document_id", document.id)
          .order("dependency_name"),
        supabase
          .from("library_attachments")
          .select("*")
          .eq("document_id", document.id)
          .order("attachment_name"),
      ]);

      return {
        document: document as LibraryDocument,
        tags: tags.data?.map(t => t.library_tags as LibraryTag) || [],
        fields: fields.data as LibraryField[] || [],
        dependencies: dependencies.data as LibraryDependency[] || [],
        attachments: attachments.data as LibraryAttachment[] || [],
      };
    },
    enabled: !!slug,
  });
}

export function useLibraryTags() {
  return useQuery({
    queryKey: ["library", "tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_tags")
        .select("*")
        .order("tag_type")
        .order("tag_name");

      if (error) throw error;
      return data as LibraryTag[];
    },
  });
}

export function useLibraryFilterOptions() {
  return useQuery({
    queryKey: ["library", "filter-options"],
    queryFn: async () => {
      const [countries, domains, authorities, states] = await Promise.all([
        supabase.from("library_documents").select("country").order("country"),
        supabase.from("library_documents").select("domain").order("domain"),
        supabase.from("library_documents").select("authority").order("authority"),
        supabase.from("library_documents").select("state").order("state"),
      ]);

      return {
        countries: [...new Set(countries.data?.map(d => d.country) || [])],
        domains: [...new Set(domains.data?.map(d => d.domain) || [])],
        authorities: [...new Set(authorities.data?.map(d => d.authority) || [])],
        states: [...new Set(states.data?.map(d => d.state).filter(Boolean) || [])],
      };
    },
  });
}
