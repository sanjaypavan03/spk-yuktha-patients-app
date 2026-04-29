const GEMINI_API_KEY = "AIzaSyC8YDRoK-P7bMahY9ZzYm5Vu8kzcpR7HJo"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Analyzes a medical report (Image data URI or text) locally using Google's REST API
 */
export async function analyzeMedicalReportLocally(
  input: string | { imageDataUri: string }, 
  options: { language?: string; reportType?: string } = {}
) {
  try {
    const targetLang = options.language || "English";
    const reportType = options.reportType || "Auto";

    const promptText = `
      You are an expert clinical AI assistant for Yuktha Health. 
      Analyze the provided medical report and return a strictly structured JSON response.
      
      REPORT CONTEXT:
      - Selected Language: ${targetLang}
      - User-selected Type: ${reportType}
      
      CORE REQUIREMENTS:
      1. ANALYZE CATEGORY: If the User-selected Type is "Auto (AI)" or "Auto", identify the correct category: "blood", "imaging", "prescription", or "other".
      2. GENERATE SUMMARY: Write a medical summary (2-3 sentences) specifically for the patient. 
         - The summary MUST be in the script of ${targetLang}. 
         - Include an English translation in brackets at the end if targetLang is not English.
      3. DETERMINE STATUS: Identify if the results are "Normal" or "Abnormal" based on clinical reference ranges.
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

    const parts = [{ text: promptText }];

    if (typeof input === 'object' && input.imageDataUri) {
        const [header, data] = input.imageDataUri.split(",");
        const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
        parts.push({
            // @ts-ignore
            inline_data: {
                data: data,
                mime_type: mimeType,
            },
        });
    } else {
        parts.push({ text: input as string });
    }

    const requestBody = {
        contents: [
            {
                parts: parts
            }
        ]
    };

    console.log("🧪 Standalone AI: Dispatching analysis request to Gemini...");
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const resData = await response.json();
    
    if (!response.ok) {
        console.error("❌ Gemini API Error Data:", JSON.stringify(resData, null, 2));
        throw new Error(resData.error?.message || `AI Analysis failed with status ${response.status}`);
    }

    console.log("✅ Gemini Response received successfully.");
    const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Hardened JSON cleaning
    let cleanedJson = text;
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedJson = text.substring(firstBrace, lastBrace + 1);
    } else {
      cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Local Gemini Error:", error);
    throw error;
  }
}
