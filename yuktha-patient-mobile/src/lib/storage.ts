import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTS_KEY = '@yuktha_reports';

export interface LocalReport {
  id: string;
  title: string;
  category: string;
  date: string;
  clinic: string;
  summary: string;
  status: string;
  parameters: any[];
  abnormalFindings: string[];
  createdAt: string;
  fileDataUri?: string;
}

/**
 * Saves a single report to local storage
 */
export async function saveLocalReport(report: any): Promise<LocalReport> {
  try {
    const existingReportsStr = await AsyncStorage.getItem(REPORTS_KEY);
    const existingReports: LocalReport[] = existingReportsStr ? JSON.parse(existingReportsStr) : [];
    
    const newReport: LocalReport = {
      id: Math.random().toString(36).substr(2, 9),
      title: report.reportTitle || report.title || "Untitled Report",
      category: report.category || "other",
      date: report.date || new Date().toISOString(),
      clinic: report.clinic || "Unknown Clinic",
      summary: report.summary || "",
      status: report.status || "Normal",
      parameters: report.parameters || [],
      abnormalFindings: report.abnormalFindings || [],
      createdAt: new Date().toISOString(),
      fileDataUri: report.fileDataUri
    };

    const updatedReports = [newReport, ...existingReports];
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    return newReport;
  } catch (error) {
    console.error("Local Storage Save Error:", error);
    throw error;
  }
}

/**
 * Retrieves all stored reports
 */
export async function getLocalReports(): Promise<LocalReport[]> {
  try {
    const reportsStr = await AsyncStorage.getItem(REPORTS_KEY);
    return reportsStr ? JSON.parse(reportsStr) : [];
  } catch (error) {
    console.error("Local Storage Load Error:", error);
    return [];
  }
}

/**
 * Deletes a report from local storage
 */
export async function deleteLocalReport(id: string): Promise<void> {
  try {
    const existingReportsStr = await AsyncStorage.getItem(REPORTS_KEY);
    if (!existingReportsStr) return;
    
    const existingReports: LocalReport[] = JSON.parse(existingReportsStr);
    const filteredReports = existingReports.filter(r => r.id !== id);
    
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(filteredReports));
  } catch (error) {
    console.error("Local Storage Delete Error:", error);
  }
}
