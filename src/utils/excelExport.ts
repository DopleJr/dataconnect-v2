import * as XLSX from 'xlsx';
import { Column } from '../types';

export interface ExportProgress {
  percentage: number;
  timeRemaining: string;
  currentSheet: number;
  totalSheets: number;
}

const ROWS_PER_SHEET = 100000; // Reduced from 500k to 100k for better memory management
const CHUNK_SIZE = 5000; // Process data in smaller chunks

export const calculateTimeRemaining = (startTime: number, progress: number): string => {
  if (progress === 0) return 'Calculating...';
  
  const elapsedTime = Date.now() - startTime;
  const estimatedTotalTime = (elapsedTime / progress) * 100;
  const remainingTime = estimatedTotalTime - elapsedTime;
  
  const seconds = Math.ceil(remainingTime / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
};

// Helper function to process data in chunks to avoid stack overflow
const processDataInChunks = async (
  data: any[],
  columns: Column[],
  chunkSize: number = CHUNK_SIZE
): Promise<any[]> => {
  const result: any[] = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    
    // Process chunk
    const processedChunk = chunk.map(row => {
      const exportRow: { [key: string]: any } = {};
      columns.forEach(col => {
        exportRow[col.label] = row[col.key] || '';
      });
      return exportRow;
    });
    
    result.push(...processedChunk);
    
    // Allow UI to breathe
    if (i % (chunkSize * 4) === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return result;
};

export const exportToExcel = async (
  data: any[],
  columns: Column[],
  filename: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  if (!data || data.length === 0) {
    throw new Error('No data available for export');
  }

  console.log(`Starting Excel export for ${data.length} records`);
  const startTime = Date.now();
  const totalSheets = Math.ceil(data.length / ROWS_PER_SHEET);
  const wb = XLSX.utils.book_new();

  try {
    for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
      const start = sheetIndex * ROWS_PER_SHEET;
      const end = Math.min(start + ROWS_PER_SHEET, data.length);
      const sheetData = data.slice(start, end);

      console.log(`Processing sheet ${sheetIndex + 1}/${totalSheets} with ${sheetData.length} rows`);

      // Process data in chunks to avoid stack overflow
      const formattedData = await processDataInChunks(sheetData, columns);

      // Create worksheet with better memory management
      const ws = XLSX.utils.json_to_sheet(formattedData, {
        header: columns.map(col => col.label)
      });
      
      // Auto-size columns with limits to prevent excessive memory usage
      const colWidths = columns.map(col => {
        // Sample first 100 rows for width calculation to avoid processing all data
        const sampleSize = Math.min(100, sheetData.length);
        const sampleData = sheetData.slice(0, sampleSize);
        
        const maxLength = Math.max(
          col.label.length,
          ...sampleData.map(row => String(row[col.key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) }; // Max width of 50 characters
      });
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      const sheetName = totalSheets > 1 ? `Data_Part_${sheetIndex + 1}` : 'Data';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Report progress
      if (onProgress) {
        const progress = ((sheetIndex + 1) / totalSheets) * 100;
        onProgress({
          percentage: Math.round(progress),
          timeRemaining: calculateTimeRemaining(startTime, progress),
          currentSheet: sheetIndex + 1,
          totalSheets
        });
      }

      // Allow UI to update and prevent browser freeze
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force garbage collection hint
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    console.log(`Writing Excel file: ${finalFilename}`);
    
    // Write and download file
    XLSX.writeFile(wb, finalFilename);
    
    console.log(`Excel export completed successfully`);
  } catch (error) {
    console.error('Error during Excel export:', error);
    throw error;
  }
};

export const exportLargeDataset = async (
  data: any[],
  columns: Column[],
  tableName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  console.log(`Exporting large dataset: ${data.length} records`);
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}_large_dataset`;
  await exportToExcel(data, columns, filename, onProgress);
};

export const exportDirectDownload = async (
  data: any[],
  columns: Column[],
  tableName: string
): Promise<void> => {
  console.log(`Direct download export: ${data.length} records`);
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}`;
  await exportToExcel(data, columns, filename);
};

export const exportTableData = async (
  data: any[],
  columns: Column[],
  tableName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  console.log(`Table data export: ${data.length} records`);
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}_export`;
  await exportToExcel(data, columns, filename, onProgress);
};