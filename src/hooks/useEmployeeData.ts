import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseSpreadsheet, parseCSV, ParsedSpreadsheet, FieldMapping as SpreadsheetFieldMapping, autoDetectFieldMappings, applyFieldMappings } from '@/lib/spreadsheet-parser';

export type FieldMapping = SpreadsheetFieldMapping;

export interface EmployeeRecord {
  [key: string]: unknown;
}

export interface DataSource {
  id: string;
  organization_id: string;
  file_name: string;
  column_names: string[];
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface UseEmployeeDataReturn {
  loading: boolean;
  error: string | null;
  dataSources: DataSource[];
  employeeData: EmployeeRecord[];
  uploadData: (organizationId: string, file: File) => Promise<void>;
  loadData: (organizationId: string | null) => Promise<void>;
  deleteDataSource: (sourceId: string) => Promise<void>;
  parseAndPreview: (file: File) => Promise<{ headers: string[]; rows: EmployeeRecord[]; allRows: EmployeeRecord[]; mappings: SpreadsheetFieldMapping[] }>;
  saveWithMappings?: (organizationId: string, file: File, mappings: SpreadsheetFieldMapping[]) => Promise<void>;
  clearError: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useEmployeeData(): UseEmployeeDataReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeRecord[]>([]);

  const clearError = useCallback(() => setError(null), []);

  const parseAndPreview = useCallback(async (file: File): Promise<{ headers: string[]; rows: EmployeeRecord[]; allRows: EmployeeRecord[]; mappings: SpreadsheetFieldMapping[] }> => {
    try {
      let parsed: ParsedSpreadsheet;
      
      if (file.name.endsWith('.csv')) {
        parsed = await parseCSV(file);
      } else {
        parsed = await parseSpreadsheet(file);
      }
      
      const mappings = autoDetectFieldMappings(parsed.headers);
      const mappedRows = applyFieldMappings(parsed.rows, mappings);
      
      return {
        headers: parsed.headers,
        rows: mappedRows,
        allRows: parsed.rows,
        mappings,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file';
      setError(message);
      throw err;
    }
  }, []);

  const loadData = useCallback(async (organizationId: string | null) => {
    if (!organizationId) {
      setDataSources([]);
      setEmployeeData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: sources, error: sourcesError } = await db
        .from('organization_data_sources')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (sourcesError) throw sourcesError;
      setDataSources(sources || []);
      
      const { data: records, error: recordsError } = await db
        .from('organization_data_records')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (recordsError) throw recordsError;
      
      const allData: EmployeeRecord[] = [];
      
      if (records && records.length > 0) {
        for (const record of records) {
          const recordData = record.data;
          if (Array.isArray(recordData)) {
            allData.push(...recordData);
          } else if (recordData && typeof recordData === 'object') {
            allData.push(recordData);
          }
        }
      }
      
      setEmployeeData(allData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadData = useCallback(async (organizationId: string, file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const { headers, allRows } = await parseAndPreview(file);
      
      const filePath = `${organizationId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('employee-data')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { error: sourceError } = await db
        .from('organization_data_sources')
        .insert({
          organization_id: organizationId,
          file_name: file.name,
          column_names: headers,
          record_count: allRows.length,
        })
        .select()
        .single();
      
      if (sourceError) throw sourceError;
      
      const dataToStore = JSON.parse(JSON.stringify(allRows));
      
      const { error: recordsError } = await db
        .from('organization_data_records')
        .insert({
          organization_id: organizationId,
          data: dataToStore,
        });
      
      if (recordsError) throw recordsError;
      
      await loadData(organizationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [parseAndPreview, loadData]);

  const deleteDataSource = useCallback(async (sourceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const sourceToDelete = dataSources.find(s => s.id === sourceId);
      
      const { error: deleteSourceError } = await db
        .from('organization_data_sources')
        .delete()
        .eq('id', sourceId);
      
      if (deleteSourceError) throw deleteSourceError;
      
      if (sourceToDelete) {
        const { error: deleteRecordsError } = await db
          .from('organization_data_records')
          .delete()
          .eq('organization_id', sourceToDelete.organization_id);
        
        if (deleteRecordsError) {
          console.warn('Could not delete records:', deleteRecordsError);
        }
      }
      
      setDataSources(prev => prev.filter(s => s.id !== sourceId));
      setEmployeeData([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataSources]);

  return {
    loading,
    error,
    dataSources,
    employeeData,
    uploadData,
    loadData,
    deleteDataSource,
    parseAndPreview,
    clearError,
  };
}
