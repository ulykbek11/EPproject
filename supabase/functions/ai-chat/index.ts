import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, profileContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("API Key configuration error");
    }

    // Construct the prompt with system instructions and context
    let systemInstruction = SYSTEM_PROMPT;
    if (profileContext) {
      systemInstruction += `\n\nДанные профиля пользователя:\n${profileContext}`;
    }

    // Map OpenAI-style messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Use a standard model
    const model = "gemini-1.5-flash"; 
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        system_instruction: {
          parts: [{ text: systemInstruction }]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Подождите немного." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Ошибка AI сервиса", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, не удалось сгенерировать ответ.";

    // Format as SSE stream to satisfy the client parser
    // We send one big chunk simulating a stream
    const jsonResponse = JSON.stringify({ 
      choices: [{ 
        delta: { content: generatedText },
        message: { content: generatedText }
      }] 
    });

    const sseString = `data: ${jsonResponse}\n\ndata: [DONE]\n\n`;

    return new Response(sseString, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream" 
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
