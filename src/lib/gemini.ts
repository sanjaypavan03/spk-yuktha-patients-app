/**
 * Google Gemini AI Utility
 * Handles core AI operations for report analysis and medication extraction
 */
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Normalizes base64 string for Gemini input
 */
function base64ToPart(base64Uri: string): Part {
  const [header, data] = base64Uri.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}

/**
 * Analyzes a medical report (Image or text)
 */
export async function analyzeMedicalReport(
  input: string | { imageDataUri: string }, 
  options: { language?: string; reportType?: string } = {}
) {
  try {
    const targetLang = options.language || "English";
    const reportType = options.reportType || "Auto";

    const prompt = `
      You are an expert clinical AI assistant for Yuktha Health. 
      Analyze the provided medical report and return a strictly structured JSON response.
      
      REPORT CONTEXT:
      - Selected Language: ${targetLang}
      - User-selected Type: ${reportType}
      
      CORE REQUIREMENTS:
      1. ANALYZE CATEGORY: If the User-selected Type is "Auto (AI)" or "Auto", you MUST identify the correct category from the content. Categories: "blood", "imaging", "prescription", or "other".
      2. GENERATE SUMMARY: Write a medical summary (2-3 sentences) specifically for the patient. 
         - The summary MUST be in the script of ${targetLang}. 
         - Include an English translation in brackets at the end.
      3. DETERMINE STATUS: Identify if the results are "Normal" or "Abnormal" based on clinical reference ranges in the document.
      4. EXTRACT DATA: Identify specific tests/parameters. Return an array: { "test": "Name", "value": "Number", "unit": "Unit", "status": "Normal/High/Low" }.
      5. ABNORMAL FINDINGS: Return an array of strings describing any results outside reference ranges in ${targetLang}.
      
      Response Format (JSON only):
      {
        "reportTitle": "...",
        "summary": "...",
        "status": "Normal" | "Abnormal",
        "category": "blood" | "imaging" | "prescription" | "other",
        "parameters": [...],
        "abnormalFindings": [...],
        "detectedLanguage": "..."
      }
    `;

    let result;
    if (typeof input === 'object' && input.imageDataUri) {
      result = await model.generateContent([prompt, base64ToPart(input.imageDataUri)]);
    } else {
      result = await model.generateContent([prompt, input as string]);
    }

    const response = await result.response;
    const text = response.text();
    console.log("🧪 Gemini Raw Response Length:", text.length);
    
    // Improved JSON cleaning: Find the first '{' and last '}'
    let cleanedJson = text;
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedJson = text.substring(firstBrace, lastBrace + 1);
    } else {
      cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    try {
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("Failed to parse cleaned JSON. Raw text:", text);
      // Attempt manual extraction if JSON.parse fails
      return {
        reportTitle: "Medical Report (Analyzed)",
        summary: text.substring(0, 500) + "...",
        status: text.toLowerCase().includes("abnormal") ? "Abnormal" : "Normal",
        category: "other",
        parameters: [],
        abnormalFindings: []
      };
    }
  } catch (error) {
    console.error("Gemini Analysis Critical Error:", error);
    return {
      reportTitle: "Analysis Failed",
      summary: "AI was unable to process this document. Please consult your physician.",
      status: "Unknown",
      category: "other",
      parameters: [],
      abnormalFindings: []
    };
  }
}

/**
 * Extracts medications from a prescription image
 */
export async function extractMedications(imageDataUri: string) {
  try {
    const prompt = `
      Extract medications from this prescription photo. 
      Return a JSON array of objects.
      
      Object structure:
      {
        "name": "Full medicine name",
        "dosage": "Strength e.g. 500mg",
        "frequency": "OD, BD, TDS, or QID",
        "duration": number of days,
        "instructions": "e.g. after food"
      }
      
      Rules:
      - If frequency is "Once daily", use "OD".
      - If frequency is "Twice daily", use "BD".
      - If frequency is "Thrice daily", use "TDS".
      - If frequency is "Four times daily", use "QID".
      - If duration is missing, default to 7.
      
      Response Format (JSON only):
      {
        "medicines": [...]
      }
    `;

    const result = await model.generateContent([prompt, base64ToPart(imageDataUri)]);
    const response = await result.response;
    const text = response.text();
    
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract medications from image.");
  }
}
