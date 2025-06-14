import { supabase } from './supabase';

export interface BrandingFile {
  id: string;
  name: string;
  path: string;
  organization_id: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export class BrandingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BrandingError';
  }
}

export async function getOrganizationId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new BrandingError('User not authenticated', 'AUTH_ERROR');
  }

  const { data: orgMember, error: orgError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (orgError || !orgMember) {
    throw new BrandingError('User is not a member of any organization', 'ORG_ERROR');
  }

  return orgMember.organization_id;
}

export async function uploadBrandingFile(
  file: File
): Promise<BrandingFile> {
  try {
    const organizationId = await getOrganizationId();
    const filePath = `${organizationId}/${file.name}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('branding')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('policy')) {
        throw new BrandingError(
          'You do not have permission to upload files for this organization',
          'POLICY_VIOLATION'
        );
      }
      throw new BrandingError(
        `Failed to upload file: ${uploadError.message}`,
        'UPLOAD_ERROR'
      );
    }

    // Create database record
    const { data: fileData, error: dbError } = await supabase
      .from('branding_files')
      .insert([
        {
          name: file.name,
          path: uploadData.path,
          organization_id: organizationId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('branding').remove([filePath]);
      throw new BrandingError(
        `Failed to save file metadata: ${dbError.message}`,
        'DB_ERROR'
      );
    }

    return fileData;
  } catch (error) {
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }
}

export async function getBrandingFiles(): Promise<BrandingFile[]> {
  try {
    const organizationId = await getOrganizationId();
    
    const { data, error } = await supabase
      .from('branding_files')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BrandingError(
        `Failed to fetch files: ${error.message}`,
        'FETCH_ERROR'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }
}

export async function deleteBrandingFile(
  fileId: string
): Promise<void> {
  try {
    const organizationId = await getOrganizationId();

    // Get file path before deletion
    const { data: file, error: fetchError } = await supabase
      .from('branding_files')
      .select('path')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      throw new BrandingError(
        `Failed to fetch file: ${fetchError.message}`,
        'FETCH_ERROR'
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('branding')
      .remove([file.path]);

    if (storageError) {
      throw new BrandingError(
        `Failed to delete file from storage: ${storageError.message}`,
        'STORAGE_ERROR'
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('branding_files')
      .delete()
      .eq('id', fileId)
      .eq('organization_id', organizationId);

    if (dbError) {
      throw new BrandingError(
        `Failed to delete file metadata: ${dbError.message}`,
        'DB_ERROR'
      );
    }
  } catch (error) {
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }
}

export async function getBrandingFileUrl(
  filePath: string
): Promise<string> {
  try {
    const organizationId = await getOrganizationId();
    
    // Verify the file belongs to the organization
    const { data: file, error: verifyError } = await supabase
      .from('branding_files')
      .select('id')
      .eq('path', filePath)
      .eq('organization_id', organizationId)
      .single();

    if (verifyError || !file) {
      throw new BrandingError(
        'File not found or access denied',
        'ACCESS_DENIED'
      );
    }

    const { data, error } = await supabase.storage
      .from('branding')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour

    if (error) {
      throw new BrandingError(
        `Failed to generate signed URL: ${error.message}`,
        'URL_ERROR'
      );
    }

    return data.signedUrl;
  } catch (error) {
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }
} 