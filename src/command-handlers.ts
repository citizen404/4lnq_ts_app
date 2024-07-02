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
    text: string;
    cost: string;
    address: string
}): Promise<void> {
    const chatId = msg.chat.id;
    const trueCost = toNano(msg.cost)

    // Log the incoming message
    console.log('handleSendTXCommand received message:', msg.address, trueCost);

    const connector = getConnector(chatId);
    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, 'Connect wallet to send transaction');
        return;
    }

    try {
        // Option 1: Send transaction request directly to the wallet application
        const walletInfo = await getWalletInfo(connector.wallet!.device.appName);
        await bot.sendMessage(chatId, `Open ${walletInfo?.name || connector.wallet!.device.appName} and confirm transaction`)

        await connector.sendTransaction({
            validUntil: Math.round(Date.now() / 1000) + 600, // timeout is SECONDS
            messages: [
                {
                    amount: trueCost.toString(),
                    address: msg.address
                }
            ]
        });

        await bot.sendMessage(chatId, `Transaction sent successfully`);
    } catch (e) {
        if (e instanceof UserRejectsError) {
            await bot.sendMessage(chatId, `You rejected the transaction`);
        } else {
            await bot.sendMessage(chatId, `Unknown error happened`);
        }
        throw e; // Re-throw the error to handle it in the main code
    } finally {
        await connector.pauseConnection();
    }

    // Option 2: Provide a deep link for the user to confirm the transaction in the wallet application
    //let deeplink = '';
    //const walletInfo = await getWalletInfo(connector.wallet!.device.appName);
    //if (walletInfo) {
    //    if ("universalLink" in walletInfo) { // kostyl
    //        deeplink = walletInfo.universalLink;
    //    }

    //    if (deeplink) {
    //       await bot.sendMessage(
    //            chatId,
    //            `Open ${walletInfo?.name || connector.wallet!.device.appName} and confirm transaction`,
    //            {
    //                reply_markup: {
    //                    inline_keyboard: [
    //                        [
    //                            {
    //                                text: 'Open Wallet',
    //                                url: deeplink
    //                            }
    //                        ]
    //                    ]
    //                }
    //           }
    //        );
    //    }
    //}
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