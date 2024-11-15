// src/ton-connect/storage_redis.ts
import { IStorage } from '@tonconnect/sdk';
import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379' // Update this with your Redis URL if needed
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect the client asynchronously
(async () => {
    await redisClient.connect();
})();

export class TonConnectStorage implements IStorage {
    constructor(private readonly chatId: number) {
        console.log(`TonConnectStorage instance created for chatId: ${chatId}`);
    }

    private getKey(key: string): string {
        const compositeKey = `${this.chatId}:${key}`; // `:` is often used as a separator in Redis keys
        console.log(`Generated key: ${compositeKey} for input key: ${key}`);
        return compositeKey;
    }

    async removeItem(key: string): Promise<void> {
        const compositeKey = this.getKey(key);
        await redisClient.del(compositeKey);
        console.log(`Removed item with key: ${compositeKey}`);
    }

    async setItem(key: string, value: string): Promise<void> {
        const compositeKey = this.getKey(key);
        await redisClient.set(compositeKey, value);
        console.log(`Set item with key: ${compositeKey}, value: ${value}`);
    }

    async getItem(key: string): Promise<string | null> {
        const compositeKey = this.getKey(key);
        const value = await redisClient.get(compositeKey);
        console.log(`Retrieved item with key: ${compositeKey}, value: ${value}`);
        return value;
    }
}
