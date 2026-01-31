"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonConnectStorage = void 0;
const storage = new Map(); // temporary storage implementation. We will replace it with the redis later
class TonConnectStorage {
    constructor(chatId) {
        this.chatId = chatId;
        console.log(`TonConnectStorage instance created for chatId: ${chatId}`);
    }
    getKey(key) {
        const compositeKey = this.chatId.toString() + key;
        console.log(`Generated key: ${compositeKey} for input key: ${key}`);
        return compositeKey;
    }
    async removeItem(key) {
        const compositeKey = this.getKey(key);
        storage.delete(compositeKey);
        console.log(`Removed item with key: ${compositeKey}`);
    }
    async setItem(key, value) {
        const compositeKey = this.getKey(key);
        storage.set(compositeKey, value);
        console.log(`Set item with key: ${compositeKey}, value: ${value}`);
    }
    async getItem(key) {
        const compositeKey = this.getKey(key);
        const value = storage.get(compositeKey) || null;
        console.log(`Retrieved item with key: ${compositeKey}, value: ${value}`);
        return value;
    }
}
exports.TonConnectStorage = TonConnectStorage;
//# sourceMappingURL=storage.js.map