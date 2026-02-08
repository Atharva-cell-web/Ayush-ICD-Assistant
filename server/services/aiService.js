const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 1. THE TRUTH TABLE ---
const REFERENCE_DATA = `
| Ayush Disease | NAMASTE Code | ICD-11 Diagnosis       | ICD-11 Code |
|---------------|--------------|------------------------|-------------|
| Amavata       | NAMC-01      | Rheumatoid Arthritis   | FA00        |
| Jwara         | NAMC-02      | Fever of unknown origin| MG26        |
| Kasa          | NAMC-03      | Cough                  | MD23        |
| Shwasa        | NAMC-04      | Asthma                 | CA23        |
| Hridroga      | NAMC-05      | Angina Pectoris        | BA00        |
| Madhumeha     | NAMC-06      | Type 2 Diabetes        | 5A11        |
| Dushta Pratishyaya | NAMC-23 | Chronic Sinusitis      | CA01        |
| Atisar        | NAMC-10      | Diarrhoea              | ME05        |
| Kamala        | NAMC-15      | Jaundice               | ME30        |
| Unmada        | NAMC-99      | Schizophrenia          | 6A20        |
`;

// --- 2. THE CLEAN "DOCTOR" PROMPT ---
const DIAGNOSIS_PROMPT = `
You are an expert Medical Consultant.
Reference Data: ${REFERENCE_DATA}

INSTRUCTIONS:
1. Identify the disease from the User Input (Code or Symptom).
2. **CRITICAL:** In the 'reasoning' and 'description' fields, DO NOT mention "user input", "codes", "tables", or "database lookup".
3. **Write purely CLINICAL information** useful for a doctor.

OUTPUT FORMAT (Strict JSON):
{
  "ayushDiagnosis": "Sanskrit Name",
  "ayushCode": "Code",
  "icd11Diagnosis": "Modern Name",
  "icd11Code": "Code",
  "confidence": "95%",
  "reasoning": "A purely clinical explanation of the pathology. (e.g. 'Inflammation of the sinuses causes blockage and pain', NOT 'The input code matches...')",
  "description": "A concise, professional medical definition of the condition."
}
`;

const SEARCH_PROMPT = `
You are a Medical Search Engine. Return JSON:
{ "results": [ { "diseaseName": "Name", "ayushCode": "Code", "icdCode": "Code", "category": "Ayurveda", "description": "Short summary", "confidenceScore": 95 } ] }
`;

async function getDiagnosis(input) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: DIAGNOSIS_PROMPT },
        { role: "user", content: `User Input: "${input}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.warn("AI Error:", error);
    return null;
  }
}

async function searchWithAI(query) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SEARCH_PROMPT },
        { role: "user", content: `Search Query: "${query}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0].message.content);
    return data.results || data.matches || [data]; 
  } catch (error) {
    return []; 
  }
}

module.exports = { getDiagnosis, searchWithAI };