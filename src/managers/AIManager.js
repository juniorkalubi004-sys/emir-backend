import { OllamaService } from "../services/ollamaService.js";
import { LMStudioService } from "../services/lmService.js";

class AIManager {
    constructor() {
        this.provider = "ollama";
    }

    setProvider(provider) {
        if (!["ollama", "openai", "lmstudio"].includes(provider)) {
            throw new Error(`Fournisseur IA non pris en charge : ${provider}`);
        }
        this.provider = provider;
    }

    async getService() {
        switch (this.provider) {
            case "ollama":
                return OllamaService;
            case "lmstudio":
                return LMStudioService;
            case "openai":
                return (await import("../services/openaiService.js")).OpenAIService;
        }
    }

    async chat(options) {
        return (await this.getService()).chat(options);
    }

    async stream(options) {
        return (await this.getService()).stream(options);
    }
}

export default new AIManager();