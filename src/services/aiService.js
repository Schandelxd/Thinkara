const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const DEFAULT_PARAMS = {
  temperature: 0.7,
  max_tokens: 8192,
  top_p: 0.95,
};

async function callOpenAI(apiKey, messages, extraParams = {}) {
  console.log("CALL OPENAI API KEY:", apiKey ? "EXISTS" : "MISSING", "LENGTH:", apiKey?.length, "PREFIX:", apiKey?.substring(0, 5));
  if (!apiKey) throw new Error("OpenAI API Key is missing. Please add it in Settings.");

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...DEFAULT_PARAMS,
      ...extraParams,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

const DIFFICULTY_INSTRUCTIONS = {
  easy: 'Generate EASY difficulty questions suitable for school students (Class 10-12). Keep questions simple and straightforward, testing basic recall and understanding.',
  moderate: 'Generate MODERATE difficulty questions suitable for Indian university undergraduate exams (like semester exams, internal assessments). Questions should test understanding, application, and some analysis.',
  hard: 'Generate HARD difficulty questions suitable for competitive exams and advanced university exams (like GATE, NET, or final year exams). Questions should test deep understanding, critical analysis, and application of complex concepts.',
  exam: 'Generate EXAM-LEVEL questions matching Indian University exam patterns (like Anna University, Mumbai University, Delhi University semester exams). Include a mix of conceptual, numerical, and application-based questions. Format them like actual exam questions with proper academic rigor.',
};

export async function generateFlashcards(materialText, apiKey, difficulty = 'moderate') {
  const difficultyGuide = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.moderate;
  
  const prompt = `
    You are an expert study assistant specializing in Indian education system.
    ${difficultyGuide}
    
    Generate 8 highly effective flashcards based on the document below.
    Each card should help a student memorize key concepts for their exams.
    
    Format your response STRICTLY as a JSON array of objects, with each object containing "front" and "back" string properties.
    Do not include markdown codeblocks or any other text outside the JSON array.
    
    Document Text:
    ---
    ${materialText.substring(0, 30000)}
    ---
  `;

  try {
    const responseText = await callOpenAI(apiKey, [
      { role: 'user', content: prompt }
    ]);
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    throw error;
  }
}

export async function generateQuiz(materialText, apiKey, difficulty = 'moderate') {
  const difficultyGuide = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.moderate;
  
  const prompt = `
    You are an expert examiner specializing in Indian university and school examinations.
    ${difficultyGuide}
    
    Generate an 8-question multiple choice quiz based on the key concepts in the text below.
    
    Format your response STRICTLY as a JSON array of objects. Each object must have:
    - "question" (string)
    - "options" (array of 4 strings representing A, B, C, D)
    - "correctAnswerIndex" (integer 0-3 representing the correct option)
    - "hint" (a helpful string hint)
    
    Do not include markdown codeblocks or any other text outside the JSON array.
    
    Document Text:
    ---
    ${materialText.substring(0, 30000)}
    ---
  `;

  try {
    const responseText = await callOpenAI(apiKey, [
      { role: 'user', content: prompt }
    ]);
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    throw error;
  }
}

export async function chatWithAI(chatHistory, newQuery, contextMaterial, apiKey) {
  const systemMessage = {
    role: 'system',
    content: `You are Thinkara, a helpful and encouraging AI Study Assistant. 
    Use the following uploaded study material as context to answer the student's questions. 
    If the answer isn't in the material, use your general knowledge but mention that it's outside their notes.
    
    Context Material:
    ${contextMaterial ? contextMaterial.substring(0, 15000) : "No context materials provided."}`
  };

  const historyMessages = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const messages = [
    systemMessage,
    ...historyMessages,
    { role: 'user', content: newQuery }
  ];

  try {
    return await callOpenAI(apiKey, messages);
  } catch (error) {
    console.error("Chat generation failed:", error);
    throw error;
  }
}
