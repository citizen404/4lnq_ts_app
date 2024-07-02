const express = require('express');
const bodyParser = require('body-parser');

import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

import {
    handleConnectCommand,
    handleDisconnectCommand,
    handleSendTXCommand,
    handleShowMyWalletCommand
} from './command-handlers';

import QRCode from 'qrcode';
import { getConnector } from './ton-connect/connector';
import { getWallets } from './ton-connect/wallets';
import { TonConnectStorage } from './ton-connect/storage';
import { IStorage } from '@tonconnect/sdk';

import { bot } from './bot';

const webAppUrl = process.env.WEBAPP_URL; // should be replaced to final deployment server
const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const app = express();
const port = process.env.PORT;

let cost = 0.0;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB.");
    } catch (err) {
        console.error(err);
    }
}
connectToDatabase();
const db = client.db('lnq_test');
const usersCol = db.collection('users');
const itemsCol = db.collection('items');
const tripsCol = db.collection('trips');
const contractsCol = db.collection('contracts');

const extractTonValue = (str: string): number | null => {
    const match = str.match(/\(([^)]+) TON\)/);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    return null;
};

async function matchItemsWithTrip(trip: any) {
    const items = await itemsCol.find({
        status: "new",
        departure: trip.departure,
        arrival: trip.arrival,
        date: { $lte: trip.date }
    }).toArray();
    console.log('Trip:', trip);
    console.log('Founded items:', items);
    return items;
}

async function matchTripsWithItem(item: any) {
    const trips = await tripsCol.find({
        departure: item.departure,
        arrival: item.arrival,
        date: { $gte: item.date }
    }).toArray();
    console.log('Item:', item);
    console.log('Founded trips:', trips);
    return trips;
}

async function notifySenderWithMatches(senderId: string, cost: string, date: string, trip: any) {
    console.log('notify 2:', trip._id, ' ', senderId, ' ', cost);
    await bot.sendMessage(senderId, 'Where is a new match to your item!\nTap the button to view details:', {
        reply_markup: {
            inline_keyboard: [[
                { text: date, callback_data: `transporter_${trip._id}_${cost}` } //here may be input of item also!
            ]]
        }
    });
}

async function getUsernameFromTelegramId(userId: string): Promise<string | null> {
    try {
        const user = await bot.getChat(userId);
        return user.username || null;
    } catch (error) {
        console.error('Error fetching username:', error);
        return null;
    }
}

app.post('/save', async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { sender_uid, date, size, weight, value, urgency, departure, arrival, estimate } = req.body;
        const estimateTon = extractTonValue(estimate);
        console.log('Received data:', req.body);
        console.log('Ton:', estimateTon);
        if (estimateTon !== null) {
            cost = estimateTon;
        } else {
            throw new Error('Invalid TON estimate');
        }
        if (!sender_uid || !size || !weight || !value || !urgency || !departure || !arrival) {
            console.error('Validation error: Missing fields');
            // @ts-ignore
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newItem = { sender_uid, size, weight, value, urgency, departure, arrival, status: "new", date, cost };
        const result = await itemsCol.insertOne(newItem);

        const matches = await matchTripsWithItem(newItem);
        for (let match of matches) {
            await notifySenderWithMatches(newItem.sender_uid, newItem.cost.toString(), match.date, match);
        }

        // @ts-ignore
        res.status(200).json({ message: 'Item saved successfully', itemId: result.insertedId });
    } catch (error) {
        console.error('Error in /save endpoint:', error);
        if (error.message.includes("validation")) {
            // @ts-ignore
            res.status(400).json({ message: 'Validation error', error: error.message });
            console.error('Validation error', error);
        } else {
            // @ts-ignore
            res.status(500).json({ message: 'Error saving item', error: error.message });
            console.error('Error saving item', error);
        }
    }
});

app.post('/newTrip', async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { transporter_uid, departure, arrival, date } = req.body;
        const newTrip = { transporter_uid, departure, arrival, date };
        const result = await tripsCol.insertOne(newTrip);

        const matches = await matchItemsWithTrip(newTrip);
        for (let match of matches) {
            // @ts-ignore
            await notifySenderWithMatches(match.sender_uid, match.cost, match.date, newTrip);
        }

        // @ts-ignore
        res.status(200).json({ message: 'Trip added and matches notified' });
    } catch (error) {
        console.error('Error adding trip:', error);
        // @ts-ignore
        res.status(500).json({ message: 'Error adding trip', error: error.message });
    }
});

async function handleDataCallback(callbackQuery: TelegramBot.CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data!;

    if (data === 'remove') {
        try {
            const result = await usersCol.deleteOne({ user_id: userId });
            if (result.deletedCount === 1) {
                await bot.sendMessage(chatId, 'Your data has been removed.');
            } else {
                await bot.sendMessage(chatId, 'No data found to remove.');
            }
        } catch (error) {
            console.error('Error removing user data:', error);
            await bot.sendMessage(chatId, 'Error removing your data. Please try again.');
        }

    } else if (data.startsWith('transporter_')) {
        const parts = data.split('_');
        const tripId = parts[1];
        const cost = parts[2];
        const trip = await tripsCol.findOne({ _id: new ObjectId(tripId) });
        const transporterId = trip!.transporter_uid;
        const TransporterUsername = await getUsernameFromTelegramId(transporterId);

        // trigger handleSendTXCommand
        //const sendTXMessage = {
        //    chat: { id: chatId },
        //    text: `/send_tx ${tripId} ${transporterId}`,
        //    from: { id: callbackQuery.from.id },
        //    cost: cost, // make 2%
        //    address: 'EQBzIBverzenYwgR5Vqih4Je9--TVTdTWol2_0PD6-nnWuFP' //0:73201bdeaf37a7630811e55aa287825ef7ef935537535a8976ff43c3ebe9e75a
        //};

        try {
            // @ts-ignore
        //    await handleSendTXCommand(sendTXMessage);
            await bot.sendMessage(chatId, 'Fee withdrawal done.');

            await bot.sendMessage(chatId, `The transporter's username is: @${TransporterUsername}.\nContact to discuss and make a contract.`, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Make a TON contract", callback_data: `contract_${userId}_${transporterId}_${cost}` }
                    ]]
                }
            });
        } catch (error) {
            await bot.sendMessage(chatId, `Error during withdrawal: ${error.message}`);
        }

    } else if (data.startsWith('contract_')) {
        const parts = data.split('_');
        const senderId = parts[1];
        const transporterId = parts[2];
        const cost = parts[3];
        const sender = await usersCol.findOne({ user_id: senderId });
        const transporter = await usersCol.findOne({ user_id: transporterId });

        if (!sender || !transporter) {
            await bot.sendMessage(chatId, 'Error: Could not find user information.');
            return;
        }

        const senderWallet = sender.address;
        const transporterWallet = transporter.address;
        const newContract = {
            sTW: senderWallet,
            trTW: transporterWallet,
            amount: cost,
            status: "open"
        };
        await contractsCol.insertOne(newContract);
        await bot.sendMessage(chatId, `Contract created successfully`);
        //cost = 0.0;
        const transporterChatId = Number(transporterId);
        const senderName = await getUsernameFromTelegramId(sender!.user_id)
        await bot.sendMessage(transporterChatId, `Contract with ${senderName} created successfully.\nDeliver the item to get paid ${newContract.amount} TON.`);

    } else if (data === 'show_qr_code') {
        const wallets = await getWallets();
        const connector = getConnector(chatId);

        connector.onStatusChange(wallet => {
            if (wallet) {
                bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
            }
        });

        const tonkeeper = wallets.find(wallet => wallet.appName === 'tonkeeper')!;
        const link = connector.connect({
            bridgeUrl: tonkeeper.bridgeUrl,
            universalLink: tonkeeper.universalLink
        });

        const image = await QRCode.toBuffer(link);
        await bot.sendPhoto(chatId, image);
    }
}

async function updateUserWalletAddress(chatId: number): Promise<void> {
    const storage = new TonConnectStorage(chatId);
    const key = "ton-connect-storage_bridge-connection";
    const storedValue = await storage.getItem(key);

    if (!storedValue) {
        console.error(`No value found in storage for chatId: ${chatId}`);
        return;
    }

    const parsedValue = JSON.parse(storedValue);
    const walletAddress = parsedValue.connectEvent.payload.items[0].address;

    // Find the user in the collection
    const user = await usersCol.findOne({ user_id: chatId.toString() });

    if (user) {
        // If the user exists, update the address if it's different
        if (user.address !== walletAddress) {
            await usersCol.updateOne({ user_id: chatId.toString() }, { $set: { address: walletAddress } });
            console.log(`Updated user ${chatId} with new address ${walletAddress}`);
        } else {
            console.log(`Address for user ${chatId} is already up-to-date`);
        }
    } else {
        // If the user does not exist, insert a new user
        await usersCol.insertOne({ user_id: chatId.toString(), address: walletAddress });
        console.log(`Inserted new user ${chatId} with address ${walletAddress}`);
    }
}
export { updateUserWalletAddress };

bot.on('callback_query', handleDataCallback);
bot.onText(/\/connect/, handleConnectCommand);
//bot.onText(/\/send_tx/, handleSendTXCommand);
bot.onText(/\/disconnect/, handleDisconnectCommand);
bot.onText(/\/my_wallet/, handleShowMyWalletCommand);
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text!;
    const userId = msg.from!.id.toString();
    //const user = await usersCol.findOne({ user_id: userId });

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Choose an option:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'New item', web_app: { url: `${webAppUrl}?userId=${userId}` } },
                        { text: 'New trip', web_app: { url: `${webAppUrl}/newTrip?userId=${userId}` } },
                    ],
                    //[
                    //    { text: 'Connect Wallet', callback_data: 'show_qr_code' }
                    //],
                    [
                        { text: 'Remove my data', callback_data: 'remove' }
                    ]
                ]
            }
        });
    }

    if (msg.web_app_data?.data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);
            console.log(data);
            await bot.sendMessage(chatId, 'Thank you');
            await bot.sendMessage(chatId, 'Weight: ' + data.weight);
            await bot.sendMessage(chatId, 'Size: ' + data.size);
            await bot.sendMessage(chatId, 'Value: ' + data.value);
            await bot.sendMessage(chatId, 'Urgency: ' + data.urgency);
            await bot.sendMessage(chatId, 'From: ' + data.departure + ' To: ' + data.arrival);
        } catch (e) {
            console.log('Error parsing web app data:', e);
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
