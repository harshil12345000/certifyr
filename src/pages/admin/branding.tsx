import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  uploadBrandingFile,
  getBrandingFiles,
  deleteBrandingFile,
  getBrandingFileUrl,
  BrandingFile,
  BrandingError
} from '@/lib/branding';

export default function Branding() {
  const [files, setFiles] = useState<BrandingFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const files = await getBrandingFiles();
      setFiles(files);
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch files');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const uploadedFile = await uploadBrandingFile(file);
      setFiles(prev => [uploadedFile, ...prev]);
      toast.success('File uploaded successfully');
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload file');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteBrandingFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDownloadFile = async (file: BrandingFile) => {
    try {
      const url = await getBrandingFileUrl(file.path);
      window.open(url, '_blank');
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download file');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Upload your organization's branding files</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                disabled={isLoading}
                required
              />
            </div>
          </form>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Uploaded Files</h3>
            <ul className="mt-2 space-y-2">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-2 bg-white rounded shadow">
                  <span className="text-sm">{file.name}</span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 