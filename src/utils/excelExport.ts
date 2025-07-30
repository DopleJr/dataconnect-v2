import * as XLSX from 'xlsx';
import { Column } from '../types';

export interface ExportProgress {
  percentage: number;
  timeRemaining: string;
  currentSheet: number;
  totalSheets: number;
}

const ROWS_PER_SHEET = 500000;

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

export const exportToExcel = async (
  data: any[],
  columns: Column[],
  filename: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  if (!data || data.length === 0) {
    throw new Error('No data available for export');
  }

  const startTime = Date.now();
  const totalSheets = Math.ceil(data.length / ROWS_PER_SHEET);
  const wb = XLSX.utils.book_new();

  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const start = sheetIndex * ROWS_PER_SHEET;
    const end = Math.min(start + ROWS_PER_SHEET, data.length);
    const sheetData = data.slice(start, end);

    // Format data for Excel
    const formattedData = sheetData.map(row => {
      const exportRow: { [key: string]: any } = {};
      columns.forEach(col => {
        exportRow[col.label] = row[col.key];
      });
      return exportRow;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    
    // Auto-size columns
    const colWidths = columns.map(col => {
      const maxLength = Math.max(
        col.label.length,
        ...sheetData.map(row => String(row[col.key] || '').length)
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

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Write and download file
  XLSX.writeFile(wb, finalFilename);
};

export const exportLargeDataset = async (
  data: any[],
  columns: Column[],
  tableName: string
): Promise<void> => {
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}_large_dataset`;
  await exportToExcel(data, columns, filename);
};

export const exportDirectDownload = async (
  data: any[],
  columns: Column[],
  tableName: string
): Promise<void> => {
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}`;
  await exportToExcel(data, columns, filename);
};

export const exportTableData = async (
  data: any[],
  columns: Column[],
  tableName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}_export`;
  await exportToExcel(data, columns, filename, onProgress);
};