"use strict";
// src/ton-connect/wallets.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallets = getWallets;
exports.getWalletInfo = getWalletInfo;
const sdk_1 = require("@tonconnect/sdk");
const walletsListManager = new sdk_1.WalletsListManager({
    cacheTTLMs: Number(process.env.WALLETS_LIST_CACHE_TTL_MS)
});
async function getWallets() {
    const wallets = await walletsListManager.getWallets();
    return wallets.filter(sdk_1.isWalletInfoRemote);
}
async function getWalletInfo(walletAppName) {
    const wallets = await getWallets();
    return wallets.find(wallet => wallet.appName.toLowerCase() === walletAppName.toLowerCase());
}
//# sourceMappingURL=wallets.js.map