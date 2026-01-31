// src/ton-connect/connector.ts
import TonConnect from '@tonconnect/sdk';
//import { TonConnectStorage } from './storage';
import { TonConnectStorage } from './storage_redis';
import * as process from 'process';

export function getConnector(chatId: number): TonConnect {
    return new TonConnect({
        manifestUrl: process.env.MANIFEST_URL,
        storage: new TonConnectStorage(chatId)
    });
}