import OpenAI from "openai";
import { buildTextFieldsPrompt, buildMultipleChoicePrompt } from "../../utils/cvPrompt";

export const interpreterAI = async (
  formData: any,
  type: 'text' | 'boolean' | 'multipleChoice', 
  label?: string,
  options?: string[]
) => {
    
    // Configurar cliente DeepSeek
    const deepseek = new OpenAI({
        apiKey: process.env.LLM_API_KEY,
        baseURL: process.env.LLM_API_BASE_URL
    })
  
    var prompt = '' 

    switch(type){
        case 'text':
            prompt = buildTextFieldsPrompt(JSON.stringify(formData), label)
            break;
        case 'boolean':
            //other
            break;
        case 'multipleChoice':
            if (!label || !options) {
                throw new Error('Label and options are required for multipleChoice type');
            }
            prompt = buildMultipleChoicePrompt(JSON.stringify(formData), label, options)
            break;
        default:
            break;
    }

    
      
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en completar formularios de solicitud de empleo. Tu tarea es analizar un campo de formulario y generar la respuesta más apropiada basándote en la información del usuario.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Baja temperatura para respuestas más consistentes
      max_tokens: 100
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error('No response from DeepSeek AI')
    }
    
    return aiResponse.trim()
}
