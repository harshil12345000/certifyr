import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileSpreadsheet, Trash2, X, Check, AlertCircle, Search } from 'lucide-react';
import { useEmployeeData, EmployeeRecord, FieldMapping } from '@/hooks/useEmployeeData';

interface DataTabProps {
  organizationId: string | null;
}

export function DataTab({ organizationId }: DataTabProps) {
  const {
    loading,
    error,
    dataSources,
    employeeData,
    uploadData,
    loadData,
    deleteDataSource,
    parseAndPreview,
    saveWithMappings,
    clearError,
  } = useEmployeeData();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: EmployeeRecord[]; allRows: EmployeeRecord[]; mappings: FieldMapping[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dataSearchQuery, setDataSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (organizationId) {
      loadData(organizationId);
    }
  }, [organizationId, loadData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.csv', '.xlsx', '.xls', '.slx'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(extension)) {
      alert('Please upload a valid spreadsheet file (.csv, .xlsx, .xls, .slx)');
      return;
    }

    setSelectedFile(file);
    try {
      const preview = await parseAndPreview(file);
      setPreviewData(preview);
    } catch (err) {
      console.error('Failed to parse file:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !organizationId) return;

    setIsUploading(true);
    try {
      await uploadData(organizationId, selectedFile);
      setSelectedFile(null);
      setPreviewData(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewData(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this data source? This will remove all employee records.')) {
      return;
    }

    try {
      await deleteDataSource(sourceId);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!organizationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Data</CardTitle>
          <CardDescription>Please complete your organization details first.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Employee Data
              </CardTitle>
              <CardDescription>
                Upload employee spreadsheets to enable AI-powered certificate generation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.slx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV, XLSX, XLS, or SLX files
                  </p>
                </div>
              </Label>
            </div>

            {selectedFile && previewData && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {previewData.allRows.length} rows detected • {previewData.headers.length} columns
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium mb-2">Auto-detected field mappings:</p>
                  <div className="flex flex-wrap gap-2">
                    {previewData.mappings.map((mapping, idx) => (
                      <Badge key={idx} variant="secondary">
                        {mapping.spreadsheetColumn} → {mapping.targetField}
                      </Badge>
                    ))}
                    {previewData.mappings.length === 0 && (
                      <span className="text-muted-foreground text-xs">No common fields detected</span>
                    )}
                  </div>
                </div>

                {previewData.allRows.length > 0 && (
                  <div className="max-h-[70vh] overflow-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap w-12 text-center">#</TableHead>
                          {previewData.headers.map((header) => (
                            <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.allRows.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="whitespace-nowrap text-center text-muted-foreground">{idx + 1}</TableCell>
                            {previewData.headers.map((header) => (
                              <TableCell key={header} className="whitespace-nowrap">{String(row[header as keyof EmployeeRecord] ?? '-')}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {dataSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.file_name}</TableCell>
                    <TableCell>{source.column_names.length}</TableCell>
                    <TableCell>{source.record_count}</TableCell>
                    <TableCell>{new Date(source.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(source.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {employeeData.length > 0 && (() => {
        const query = dataSearchQuery.toLowerCase().trim();
        const filteredData = query
          ? employeeData.filter((row) =>
              Object.values(row).some((val) =>
                String(val ?? '').toLowerCase().includes(query)
              )
            )
          : employeeData;

        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    {query ? `${filteredData.length} of ${employeeData.length} records` : `${employeeData.length} records`} • {Object.keys(employeeData[0] || {}).length} columns
                  </CardDescription>
                </div>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search across all data..."
                  value={dataSearchQuery}
                  onChange={(e) => setDataSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No matching records found.</p>
              ) : (
                <div className="max-h-[70vh] overflow-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap w-12 text-center">#</TableHead>
                        {Object.keys(employeeData[0] || {}).map((key) => (
                          <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap text-center text-muted-foreground">{idx + 1}</TableCell>
                          {Object.values(row).map((value, vIdx) => (
                            <TableCell key={vIdx} className="whitespace-nowrap">{String(value ?? '-')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
