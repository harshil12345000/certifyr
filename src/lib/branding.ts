
import { supabase } from '@/integrations/supabase/client';

export interface BrandingFile {
  id: string;
  name: string;
  path: string;
  organization_id: string;
  uploaded_by: string | null;
  created_at: string;
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

export async function uploadBrandingFile(file: File): Promise<BrandingFile> {
  try {
    const organizationId = await getOrganizationId();
    const fileExtension = file.name.split('.').pop();
    const fileName = file.name.replace(`.${fileExtension}`, '');
    const timestamp = Date.now();
    const filePath = `${organizationId}/${fileName}-${timestamp}.${fileExtension}`;
    
    console.log('Uploading to path:', filePath);
    console.log('Organization ID:', organizationId);
    
    // Check if file with same name exists and delete it first
    const { data: existingFiles } = await supabase
      .from('branding_files')
      .select('id, path')
      .eq('organization_id', organizationId)
      .eq('name', fileName);

    if (existingFiles && existingFiles.length > 0) {
      // Delete old files from storage
      const pathsToDelete = existingFiles.map(f => f.path);
      const { error: deleteStorageError } = await supabase.storage
        .from('branding-assets')
        .remove(pathsToDelete);

      if (deleteStorageError) {
        console.warn('Warning deleting old storage files:', deleteStorageError);
      }

      // Delete old records from database
      const { error: deleteDbError } = await supabase
        .from('branding_files')
        .delete()
        .eq('organization_id', organizationId)
        .eq('name', fileName);

      if (deleteDbError) {
        console.warn('Warning deleting old database records:', deleteDbError);
      }
    }
    
    // Upload new file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('branding-assets')
      .upload(filePath, file, { 
        cacheControl: '3600',
        upsert: false 
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new BrandingError(
        `Failed to upload file: ${uploadError.message}`,
        'UPLOAD_ERROR'
      );
    }

    console.log('Upload successful, creating database record...');

    // Create database record
    const { data: fileData, error: dbError } = await supabase
      .from('branding_files')
      .insert([
        {
          name: fileName,
          path: uploadData.path,
          organization_id: organizationId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('branding-assets').remove([filePath]);
      throw new BrandingError(
        `Failed to save file metadata: ${dbError.message}`,
        'DB_ERROR'
      );
    }

    console.log('Database record created successfully:', fileData);

    return {
      id: fileData.id.toString(),
      name: fileData.name,
      path: fileData.path,
      organization_id: fileData.organization_id,
      uploaded_by: fileData.uploaded_by,
      created_at: fileData.created_at,
    };
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

    return data.map(file => ({
      id: file.id.toString(),
      name: file.name,
      path: file.path,
      organization_id: file.organization_id,
      uploaded_by: file.uploaded_by,
      created_at: file.created_at,
    }));
  } catch (error) {
    if (error instanceof BrandingError) {
      throw error;
    }
    throw new BrandingError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}

export async function deleteBrandingFile(fileId: string): Promise<void> {
  try {
    const organizationId = await getOrganizationId();

    // Get file path before deletion
    const { data: file, error: fetchError } = await supabase
      .from('branding_files')
      .select('path')
      .eq('id', parseInt(fileId))
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
      .from('branding-assets')
      .remove([file.path]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError.message);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('branding_files')
      .delete()
      .eq('id', parseInt(fileId))
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
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}

export async function getBrandingFileUrl(filePath: string): Promise<string> {
  try {
    const { data } = supabase.storage
      .from('branding-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    throw new BrandingError(
      `Failed to generate URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'URL_ERROR'
    );
  }
}

// Helper function to get organization branding for templates/documents
export async function getOrganizationBranding() {
  try {
    const files = await getBrandingFiles();
    const branding = {
      logo: null as string | null,
      seal: null as string | null,
      signature: null as string | null,
    };

    for (const file of files) {
      if (file.name === 'logo') {
        branding.logo = await getBrandingFileUrl(file.path);
      } else if (file.name === 'seal') {
        branding.seal = await getBrandingFileUrl(file.path);
      } else if (file.name === 'signature') {
        branding.signature = await getBrandingFileUrl(file.path);
      }
    }

    return branding;
  } catch (error) {
    console.error('Failed to get organization branding:', error);
    return { logo: null, seal: null, signature: null };
  }
}
