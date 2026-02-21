import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Image, Download, Trash2, Cloud } from "lucide-react";
import {
  uploadBrandingFile,
  getBrandingFiles,
  deleteBrandingFile,
  getBrandingFileUrl,
  BrandingFile,
  BrandingError,
} from "@/lib/branding";

export default function Branding() {
  const [files, setFiles] = useState<BrandingFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

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
        toast.error("Failed to fetch files");
      }
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PNG, JPG, JPEG, or SVG files only");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingType(fileType);
    setIsLoading(true);

    try {
      // Create a new file with the specified type name
      const renamedFile = new File([file], fileType, { type: file.type });
      const uploadedFile = await uploadBrandingFile(renamedFile);

      // Update files list by removing old file of same type and adding new one
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.name !== fileType);
        return [uploadedFile, ...filtered];
      });

      toast.success(
        `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
      );
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to upload ${fileType}`);
      }
    } finally {
      setIsLoading(false);
      setUploadingType(null);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await deleteBrandingFile(fileId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success(
        `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} deleted successfully`,
      );
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete file");
      }
    }
  };

  const handleDownloadFile = async (file: BrandingFile) => {
    try {
      const url = await getBrandingFileUrl(file.path);
      window.open(url, "_blank");
    } catch (error) {
      if (error instanceof BrandingError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to download file");
      }
    }
  };

  const getFileByType = (type: string) => {
    return files.find((file) => file.name === type);
  };

  // FileDropzone component
  const FileDropzone = ({
    onFileSelected,
    accept,
    disabled,
    uploading,
    label,
    helperText,
    icon: Icon,
    value,
  }: {
    onFileSelected: (file: File) => void;
    accept: string;
    disabled?: boolean;
    uploading?: boolean;
    label: string;
    helperText?: string;
    icon?: any;
    value?: File | null;
  }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelected(file);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFileName(e.dataTransfer.files[0].name);
        onFileSelected(e.dataTransfer.files[0]);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleClick = () => {
      if (!disabled && inputRef.current) {
        inputRef.current.click();
      }
    };

    React.useEffect(() => {
      if (!value) setFileName(null);
    }, [value]);

    return (
      <div
        className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-colors cursor-pointer select-none ${
          dragActive
            ? "border-primary bg-accent/40"
            : "border-muted bg-background"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent/30"} min-h-[180px] text-center`}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-disabled={disabled}
        role="button"
      >
        {Icon ? (
          <Icon className="w-10 h-10 mb-2 text-primary/70" />
        ) : (
          <Cloud className="w-10 h-10 mb-2 text-primary/70" />
        )}
        <div className="font-medium text-base mb-1">{label}</div>
        <div className="text-sm text-muted-foreground mb-2">
          Choose a file or drag & drop it here
        </div>
        <div className="text-xs text-muted-foreground mb-2">{helperText}</div>
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-neutral-400 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          tabIndex={-1}
          disabled={disabled}
        >
          Browse File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleFileChange}
          disabled={disabled}
          tabIndex={-1}
        />
        {uploading && (
          <div className="mt-2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        )}
        {fileName && !uploading && (
          <div className="mt-2 text-xs text-foreground">{fileName}</div>
        )}
      </div>
    );
  };

  const FileUploadCard = ({
    type,
    title,
    description,
    icon: Icon,
  }: {
    type: string;
    title: string;
    description: string;
    icon: any;
  }) => {
    const existingFile = getFileByType(type);
    const isUploading = uploadingType === type;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelected = useCallback(
      (file: File) => {
        setSelectedFile(file);
        // Create a synthetic event to pass to handleFileUpload
        const event = {
          target: { files: [file], value: "" },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(event, type).then(() => {
          setSelectedFile(null);
        });
      },
      [type],
    );

    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingFile ? (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current {type}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(existingFile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(existingFile)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleDeleteFile(existingFile.id, existingFile.name)
                  }
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No {type} uploaded</p>
            </div>
          )}
          <FileDropzone
            onFileSelected={handleFileSelected}
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            disabled={isUploading}
            uploading={isUploading}
            label={existingFile ? `Replace ${title}` : `Upload ${title}`}
            helperText="Supported: PNG, JPG, JPEG, SVG (Max 5MB)"
            icon={Cloud}
            value={selectedFile}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Organization Branding
        </h1>
        <p className="text-muted-foreground">
          Upload and manage your organization's branding assets. These files are
          secure and only visible to your organization members.
        </p>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Branding Assets</TabsTrigger>
          <TabsTrigger value="files">File Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FileUploadCard
              type="logo"
              title="Organization Logo"
              description="Primary logo for letterheads and documents"
              icon={Image}
            />
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Branding Files
              </CardTitle>
              <CardDescription>
                Manage all uploaded branding files for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No files uploaded</p>
                  <p className="text-sm">
                    Upload your first branding asset using the Branding Assets
                    tab
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Image className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded{" "}
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Admin
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
