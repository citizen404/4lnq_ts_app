"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonConnectStorage = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379' // Update this with your Redis URL if needed
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
// Connect the client asynchronously
(async () => {
    await redisClient.connect();
})();
class TonConnectStorage {
    constructor(chatId) {
        this.chatId = chatId;
        console.log(`TonConnectStorage instance created for chatId: ${chatId}`);
    }
    getKey(key) {
        const compositeKey = `${this.chatId}:${key}`; // `:` is often used as a separator in Redis keys
        console.log(`Generated key: ${compositeKey} for input key: ${key}`);
        return compositeKey;
    }
    async removeItem(key) {
        const compositeKey = this.getKey(key);
        await redisClient.del(compositeKey);
        console.log(`Removed item with key: ${compositeKey}`);
    }
    async setItem(key, value) {
        const compositeKey = this.getKey(key);
        await redisClient.set(compositeKey, value);
        console.log(`Set item with key: ${compositeKey}, value: ${value}`);
    }
    async getItem(key) {
        const compositeKey = this.getKey(key);
        const value = await redisClient.get(compositeKey);
        console.log(`Retrieved item with key: ${compositeKey}, value: ${value}`);
        return value;
    }
}
exports.TonConnectStorage = TonConnectStorage;
//# sourceMappingURL=storage_redis.js.map