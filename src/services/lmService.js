class LMStudio {
    async chat() {
        throw new Error("LM Studio non configuré.");
    }
}
export const LMStudioService = new LMStudio();