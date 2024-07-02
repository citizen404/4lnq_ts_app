// src/ton-connect/storage.ts

import { IStorage } from '@tonconnect/sdk';

const storage = new Map<string, string>(); // temporary storage implementation. We will replace it with the redis later

export class TonConnectStorage implements IStorage {
    constructor(private readonly chatId: number) {
        console.log(`TonConnectStorage instance created for chatId: ${chatId}`);
    }

    private getKey(key: string): string {
        const compositeKey = this.chatId.toString() + key;
        console.log(`Generated key: ${compositeKey} for input key: ${key}`);
        return compositeKey;
    }

    async removeItem(key: string): Promise<void> {
        const compositeKey = this.getKey(key);
        storage.delete(compositeKey);
        console.log(`Removed item with key: ${compositeKey}`);
    }

    async setItem(key: string, value: string): Promise<void> {
        const compositeKey = this.getKey(key);
        storage.set(compositeKey, value);
        console.log(`Set item with key: ${compositeKey}, value: ${value}`);
    }

    async getItem(key: string): Promise<string | null> {
        const compositeKey = this.getKey(key);
        const value = storage.get(compositeKey) || null;
        console.log(`Retrieved item with key: ${compositeKey}, value: ${value}`);
        return value;
    }
}
