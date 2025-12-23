// import { Readable } from 'stream';

export const config = {
  runtime: 'edge',
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `Ты - EduPath AI, персональный консультант по поступлению в университеты. Ты помогаешь абитуриентам:

1. ВЫБРАТЬ УНИВЕРСИТЕТ И ПРОГРАММУ:
- Рекомендуешь вузы на основе интересов, баллов и целей
- Объясняешь особенности разных программ
- Сравниваешь российские и зарубежные университеты

2. ПОДГОТОВИТЬСЯ К ЭКЗАМЕНАМ:
- ЕГЭ, ОГЭ (Россия)
- SAT, ACT (США)
- IELTS, TOEFL (английский)
- Даешь советы по подготовке и ресурсы

3. ОФОРМИТЬ ДОКУМЕНТЫ:
- Мотивационное письмо
- Портфолио
- Рекомендательные письма
- Резюме

4. НАЙТИ СТИПЕНДИИ И ГРАНТЫ:
- Государственные программы
- Университетские стипендии
- Частные фонды

5. СРОКИ И ДЕДЛАЙНЫ:
- Напоминаешь о важных датах
- Помогаешь планировать подготовку

ПРАВИЛА ОБЩЕНИЯ:
- Отвечай по-русски, если не попросят иначе
- Будь дружелюбным и поддерживающим
- Давай конкретные, практичные советы
- Если не знаешь точную информацию, предупреди и предложи где её найти
- Мотивируй и вдохновляй абитуриентов

ИСПОЛЬЗОВАНИЕ ДАННЫХ ПРОФИЛЯ:
- Если предоставлены "Данные профиля пользователя", ОБЯЗАТЕЛЬНО учитывай их в ответе
- Не проси пользователя повторно описывать экзамены, проекты, GPA, если они есть
- В рекомендациях явно ссылайся на экзамены, проекты и GPA из профиля
- Если данных недостаточно, аккуратно уточняй недостающие детали, но не игнорируй имеющиеся

ОГРАНИЧЕНИЯ:
- Отвечай ТОЛЬКО на вопросы, связанные с образованием, поступлением, экзаменами, стипендиями
- На нерелевантные вопросы вежливо напомни, что ты специализируешься на помощи с поступлением
- Не давай медицинских, юридических или финансовых консультаций (кроме стипендий)`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages, profileContext } = await req.json();

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error: GEMINI_API_KEY is missing on the server.' 
        }), 
        { status: 500 }
      );
    }

    // Формируем историю сообщений для Gemini
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let systemContent = SYSTEM_PROMPT;
    if (profileContext) {
      systemContent += `\n\nДАННЫЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ:\n${profileContext}`;
    }

    const finalMessages = [
      {
        role: 'user',
        parts: [{ text: systemContent }]
      },
      {
        role: 'model',
        parts: [{ text: 'Принято. Я готов помогать как EduPath AI.' }]
      },
      ...geminiMessages
    ];

    // 1. Validate API Key immediately
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing in environment variables');
      return new Response(JSON.stringify({ 
        error: 'Configuration Error',
        details: 'GEMINI_API_KEY is not set in Vercel Environment Variables. Please add it in Settings > Environment Variables.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trim API key to remove accidental spaces
    const apiKey = GEMINI_API_KEY.trim();

    // Define models in order of preference
    // We use the exact names returned by the 'models/list' endpoint to ensure compatibility
    const models = [
      'gemini-1.5-flash',       // Most stable and fast
      'gemini-2.0-flash',       // Good balance
      'gemini-1.5-pro',         // High quality
    ];

    let response;
    let usedModel = '';
    let errors: string[] = [];

    // Try each model in sequence
    for (const model of models) {
      try {
        console.log(`Attempting to use model: ${model}`);
        
        // Prepare messages for this specific model attempt
        const currentMessages = [
          {
            role: 'user',
            parts: [{ text: systemContent }]
          },
          {
            role: 'model',
            parts: [{ text: 'Принято. Я готов помогать как EduPath AI.' }]
          },
          ...geminiMessages
        ];

        // Try v1beta first, as it has the latest models
        let version = 'v1beta';
        
        response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: currentMessages,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              }
            }),
          }
        );

        if (response.ok) {
          usedModel = model;
          console.log(`Successfully connected to ${model}`);
          break;
        } else {
          const errorText = await response.text();
          console.warn(`Failed to connect to ${model}: ${response.status} ${response.statusText}`);
          errors.push(`${model}: ${response.status} - ${errorText.substring(0, 200)}`);
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        errors.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!response || !response.ok) {
      const errorMessage = typeof lastError === 'string' ? lastError : JSON.stringify(lastError);
      console.error('All models failed. Last error:', errorMessage);

      // DEBUG: Try to list available models to see what is wrong
      let availableModels = 'Could not fetch models';
      try {
        const listResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (listResponse.ok) {
          const listData = await listResponse.json();
          availableModels = (listData.models || [])
            .map((m: any) => m.name.replace('models/', ''))
            .filter((n: string) => n.includes('gemini'))
            .join(', ');
        } else {
            availableModels = `ListModels failed: ${listResponse.status}`;
        }
      } catch (e) {
        availableModels = `ListModels error: ${e}`;
      }
      
      // Return details in the 'error' field so the frontend toast displays it
      return new Response(JSON.stringify({ 
        error: `AI Error: All models failed. Details: ${allErrors}`, 
        details: allErrors
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Gemini API Error (${usedModel})`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Эмулируем SSE поток для совместимости с клиентом
    const encoder = new TextEncoder();
    const sseStream = new ReadableStream({
        start(controller) {
            // Send a custom event with model info first (optional, if frontend supports it)
            // Or just append it to the end of the text if needed, but headers are better.
            
            const chunk = {
                choices: [{ delta: { content: text } }]
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
        }
    });

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Model': usedModel, // Send used model in headers
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
