import openai from "../config/openai.js";
import emirPrompt from "../prompts/emirPrompt.js";

class OpenAIServiceClass {
    async chat({message, memory}){
        const response = await openai.chat.completions.create({
            model:"gpt-4.1-mini",
            messages:[
                {
                    role:"system",
                    content:emirPrompt
                },
                
                {
                    role:"system",
                    content:
                    `Mémoire utilisateur:
                    ${JSON.stringify(memory)}`
                },
                {
                    role:"user",
                    content:message
                }
            ]
        });
        return response.choices[0].message.content;
    }


    async stream({message,memory,onToken}){
        const stream =
        await openai.chat.completions.create({
            model:"gpt-4.1-mini",
            stream:true,
            messages:[
                {
                    role:"system",
                    content:emirPrompt
                },
                {
                    role:"system",
                    content:JSON.stringify(memory)
                },
                {
                    role:"user",
                    content:message
                }
            ]
        });
        
        let complete="";
        for await (const chunk of stream){
            const token = chunk.choices[0]?.delta?.content || "";
            if(token){
                complete += token;
                onToken(token);
            }
        }
        return complete;
    }
}

export const OpenAIService = new OpenAIServiceClass();