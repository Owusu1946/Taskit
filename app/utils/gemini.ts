import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not configured. AI features will be disabled.');
} else {
  console.log('Gemini API Key is configured:', GEMINI_API_KEY.substring(0, 4) + '...');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export async function generateWithGemini(prompt: string): Promise<string> {
  console.log('Starting Gemini generation with prompt:', prompt);

  if (!GEMINI_API_KEY) {
    console.error('Gemini API Key is missing');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt).catch(error => {
      console.error('API Request failed:', {
        error: error.message,
        stack: error.stack,
        status: error.status,
        details: error.details,
        response: error.response
      });
      throw error;
    });

    console.log('Received response from Gemini:', result);
    const response = result.response;
    const text = response.text();
    console.log('Extracted text from response:', text);
    
    return text;
  } catch (error) {
    console.error('Error in generateWithGemini:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
      details: error
    });
    throw error;
  }
}

// Helper function to test the API connection
export async function testGeminiConnection(): Promise<boolean> {
  try {
    console.log('Testing Gemini API connection...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    await model.generateContent('test');
    console.log('Gemini API connection test successful');
    return true;
  } catch (error) {
    console.error('Gemini API connection test failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

export default {
  generateWithGemini,
  testGeminiConnection
}; 