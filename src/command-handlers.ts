// src/commands-handlers.ts
import { bot } from './bot';
import QRCode from 'qrcode';
import TelegramBot from 'node-telegram-bot-api';
import { getConnector } from './ton-connect/connector';
import {CHAIN, toUserFriendlyAddress, UserRejectsError} from "@tonconnect/sdk";
import { getWallets, getWalletInfo } from './ton-connect/wallets';
import {toNano} from "@ton/core";
import { updateUserWalletAddress } from './main';

export async function handleConnectCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const wallets = await getWallets();
    const connector = getConnector(chatId);

    connector.onStatusChange(wallet => {
        if (wallet) {
            bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
            updateUserWalletAddress(chatId); // Update the wallet address in the database AWAIT
        }
    });

    const link = connector.connect(wallets);
    const image = await QRCode.toBuffer(link);
    await bot.sendPhoto(chatId, image, {
        reply_markup: {
            inline_keyboard: [
                [
                    //{
                    //    text: 'Choose a Wallet',
                    //    callback_data: JSON.stringify({ method: 'chose_wallet' })
                    //},
                    {
                        text: 'Open Link',
                        url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
                            link
                        )}`
                    }
                ]
            ]
        }
    });
}

export async function handleSendTXCommand(msg: {
    chat: { id: number };
    from: { id: number };
    //text: string;
    type: string;
    cost: string;
    address: string
}): Promise<void> {
    const chatId = msg.chat.id;
    const trueCost = toNano(msg.cost)
    const feePercentage = BigInt(2); // get 2%
    const hundred = BigInt(100);
    const trueFee = (trueCost * feePercentage) / hundred;

    // Log the incoming message
    console.log('handleSendTXCommand received message:', msg.address, trueCost, trueFee);

    const connector = getConnector(chatId);
    await connector.restoreConnection();

    if (!connector.connected) {
        await bot.sendMessage(chatId, 'Connect the wallet to send transaction. Use /connect command');
        return
    }
    try {
        const walletInfo = await getWalletInfo(connector.wallet!.device.appName);
        const amount = msg.type === 'fee' ? trueFee.toString() : trueCost.toString();
        // Provide a deep link for the user to confirm the transaction in the wallet application
        let deeplink = '';
        if (walletInfo) {
            if (walletInfo && "universalLink" in walletInfo) { // kostyl
                deeplink = walletInfo.universalLink;
            }
            if (deeplink) {
                await bot.sendMessage(chatId, `Open ${walletInfo.name || connector.wallet!.device.appName} to confirm TON transaction`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Open Wallet', url: deeplink}]
                        ]
                    }
                });
            }
            // Send transaction request directly to the wallet application
            await connector.sendTransaction({
                validUntil: Math.round(Date.now() / 1000) + 600,
                messages: [
                    {amount: amount, address: msg.address}
                ]
            });
        }
            await bot.sendMessage(chatId, `Transaction completed!`);
    } catch (e) {
        if (e instanceof UserRejectsError) {
            await bot.sendMessage(chatId, `You rejected the transaction`);
        } else {
            await bot.sendMessage(chatId, `Unknown error occurred`);
        }
        throw e;
    } finally {
        await connector.pauseConnection();
    }
}


export async function handleDisconnectCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const connector = getConnector(chatId);

    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, "You didn't connect a wallet");
        return;
    }

    await connector.disconnect();
    await bot.sendMessage(chatId, 'Wallet has been disconnected');
}

export async function handleShowMyWalletCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const connector = getConnector(chatId);

    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, "You didn't connect a wallet");
        return;
    }

    const walletName =
        (await getWalletInfo(connector.wallet!.device.appName))?.name ||
        connector.wallet!.device.appName;


    await bot.sendMessage(
        chatId,
        `Connected wallet: ${walletName}\nYour address: ${toUserFriendlyAddress(
            connector.wallet!.account.address,
            connector.wallet!.account.chain === CHAIN.TESTNET
        )}`
    );
}

export async function handleAboutCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Use /start first. If you are a Sender - please create an 📦Item. As soon as we will find a match - you will be updated. ' +
        '\nAfter getting contacts - contact any Transporter you want' +
        '\n\nIf you are a Transporter - just create a ✈️Trip and wait till Sender contact you. Collect the Item, ' +
        'and deliver it. Scan QR to confirm and get your bonus'  +
        '\n\nUse /connect to connect your TON wallet (requires Tonkeeper app). You will be able to make smart-contracts with Transporters (we take a 2% fee)' +
        '\n\n\n\nThis is an alfa-version. We will add features soon. Stay tuned.' +
        '\n\nAll rights reserved.\nx4lnq_bot v1.1a. 2024');
}

async function handleScanCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Scan a QR code", {
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