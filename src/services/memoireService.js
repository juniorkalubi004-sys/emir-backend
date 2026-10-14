
const memoryStore = new Map();

export function getMemory(userId) {
    return memoryStore.get(userId) || {
        nom: "",
        langue: "français",
        objectifs: [],
        projets: []
    };
}

export function updateMemory(userId, data) {
    const current = getMemory(userId);
    const updated = {
        ...current,
        ...data
    };
    memoryStore.set(userId, updated);
    return updated;
}