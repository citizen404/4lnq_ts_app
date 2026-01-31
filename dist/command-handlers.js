"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnectCommand = handleConnectCommand;
exports.handleSendTXCommand = handleSendTXCommand;
exports.handleDisconnectCommand = handleDisconnectCommand;
exports.handleShowMyWalletCommand = handleShowMyWalletCommand;
exports.handleAboutCommand = handleAboutCommand;
// src/commands-handlers.ts
const bot_1 = require("./bot");
const qrcode_1 = __importDefault(require("qrcode"));
const connector_1 = require("./ton-connect/connector");
const sdk_1 = require("@tonconnect/sdk");
const wallets_1 = require("./ton-connect/wallets");
const core_1 = require("@ton/core");
const main_1 = require("./main");
async function handleConnectCommand(msg) {
    const chatId = msg.chat.id;
    const wallets = await (0, wallets_1.getWallets)();
    const connector = (0, connector_1.getConnector)(chatId);
    connector.onStatusChange(wallet => {
        if (wallet) {
            bot_1.bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
            (0, main_1.updateUserWalletAddress)(chatId); // Update the wallet address in the database AWAIT
        }
    });
    const link = connector.connect(wallets);
    const image = await qrcode_1.default.toBuffer(link);
    await bot_1.bot.sendPhoto(chatId, image, {
        reply_markup: {
            inline_keyboard: [
                [
                    //{
                    //    text: 'Choose a Wallet',
                    //    callback_data: JSON.stringify({ method: 'chose_wallet' })
                    //},
                    {
                        text: 'Open Link',
                        url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(link)}`
                    }
                ]
            ]
        }
    });
}
async function handleSendTXCommand(msg) {
    const chatId = msg.chat.id;
    const trueCost = (0, core_1.toNano)(msg.cost);
    const feePercentage = BigInt(2); // get 2%
    const hundred = BigInt(100);
    const trueFee = (trueCost * feePercentage) / hundred;
    // Log the incoming message
    console.log('handleSendTXCommand received message:', msg.address, trueCost, trueFee);
    const connector = (0, connector_1.getConnector)(chatId);
    await connector.restoreConnection();
    if (!connector.connected) {
        await bot_1.bot.sendMessage(chatId, 'Connect the wallet to send transaction. Use /connect command');
        return;
    }
    try {
        const walletInfo = await (0, wallets_1.getWalletInfo)(connector.wallet.device.appName);
        const amount = msg.type === 'fee' ? trueFee.toString() : trueCost.toString();
        // Provide a deep link for the user to confirm the transaction in the wallet application
        let deeplink = '';
        if (walletInfo) {
            if (walletInfo && "universalLink" in walletInfo) { // kostyl
                deeplink = walletInfo.universalLink;
            }
            if (deeplink) {
                await bot_1.bot.sendMessage(chatId, `Open ${walletInfo.name || connector.wallet.device.appName} to confirm TON transaction`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Open Wallet', url: deeplink }]
                        ]
                    }
                });
            }
            // Send transaction request directly to the wallet application
            await connector.sendTransaction({
                validUntil: Math.round(Date.now() / 1000) + 600,
                messages: [
                    { amount: amount, address: msg.address }
                ]
            });
        }
        await bot_1.bot.sendMessage(chatId, `Transaction completed!`);
    }
    catch (e) {
        if (e instanceof sdk_1.UserRejectsError) {
            await bot_1.bot.sendMessage(chatId, `You rejected the transaction`);
        }
        else {
            await bot_1.bot.sendMessage(chatId, `Unknown error occurred`);
        }
        throw e;
    }
    finally {
        await connector.pauseConnection();
    }
}
async function handleDisconnectCommand(msg) {
    const chatId = msg.chat.id;
    const connector = (0, connector_1.getConnector)(chatId);
    await connector.restoreConnection();
    if (!connector.connected) {
        await bot_1.bot.sendMessage(chatId, "You didn't connect a wallet");
        return;
    }
    await connector.disconnect();
    await bot_1.bot.sendMessage(chatId, 'Wallet has been disconnected');
}
async function handleShowMyWalletCommand(msg) {
    const chatId = msg.chat.id;
    const connector = (0, connector_1.getConnector)(chatId);
    await connector.restoreConnection();
    if (!connector.connected) {
        await bot_1.bot.sendMessage(chatId, "You didn't connect a wallet");
        return;
    }
    const walletName = (await (0, wallets_1.getWalletInfo)(connector.wallet.device.appName))?.name ||
        connector.wallet.device.appName;
    await bot_1.bot.sendMessage(chatId, `Connected wallet: ${walletName}\nYour address: ${(0, sdk_1.toUserFriendlyAddress)(connector.wallet.account.address, connector.wallet.account.chain === sdk_1.CHAIN.TESTNET)}`);
}
async function handleAboutCommand(msg) {
    const chatId = msg.chat.id;
    await bot_1.bot.sendMessage(chatId, 'Use /start first. If you are a Sender - please create an 📦Item. As soon as we will find a match - you will be updated. ' +
        '\nAfter getting contacts - contact any Transporter you want' +
        '\n\nIf you are a Transporter - just create a ✈️Trip and wait till Sender contact you. Collect the Item, ' +
        'and deliver it. Scan QR to confirm and get your bonus' +
        '\n\nUse /connect to connect your TON wallet (requires Tonkeeper app). You will be able to make smart-contracts with Transporters (we take a 2% fee)' +
        '\n\n\n\nThis is an alfa-version. We will add features soon. Stay tuned.' +
        '\n\nAll rights reserved.\nx4lnq_bot v1.1a. 2024');
}
async function handleScanCommand(msg) {
    const chatId = msg.chat.id;
    await bot_1.bot.sendMessage(chatId, "Scan a QR code", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Open Scanner",
                        web_app: { url: "https://your-hosted-web-app-url.com" }
                    },
                ],
            ],
        },
    });
}
//# sourceMappingURL=command-handlers.js.map