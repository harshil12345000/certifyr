import { supabase } from "@/integrations/supabase/client";

export async function uploadLibraryPdf(file: File, documentSlug: string): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${documentSlug}-${Date.now()}.${fileExtension}`;
  const filePath = `library-pdfs/${fileName}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteLibraryPdf(url: string): Promise<void> {
  if (!url) return;
  
  const pathMatch = url.match(/documents\/library-pdfs\/(.+)$/);
  if (!pathMatch) return;
  
  const filePath = `library-pdfs/${pathMatch[1]}`;
  
  const { error } = await supabase.storage
    .from("documents")
    .remove([filePath]);

  if (error) {
    console.error("Failed to delete PDF:", error);
  }
}
