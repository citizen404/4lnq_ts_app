"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserWalletAddress = updateUserWalletAddress;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const command_handlers_1 = require("./command-handlers");
const qrcode_1 = __importDefault(require("qrcode"));
const connector_1 = require("./ton-connect/connector");
const wallets_1 = require("./ton-connect/wallets");
//import { TonConnectStorage } from './ton-connect/storage';
const storage_redis_1 = require("./ton-connect/storage_redis");
const bot_1 = require("./bot");
const cors_1 = __importDefault(require("cors"));
//import path from 'path';
const process = __importStar(require("process"));
const express = require('express');
const bodyParser = require('body-parser');
const webAppUrl = process.env.WEBAPP_URL;
const scanAppUrl = process.env.SCANAPP_URL; // should be replaced to final deployment server
const port = process.env.PORT;
const bck_address = process.env.BKND_IP;
const address4 = process.env.SC4_ADDRESS;
const blink = process.env.BOOSTY_LINK;
const uri = process.env.MONGO_URI;
const client = new mongodb_1.MongoClient(uri, { serverApi: mongodb_1.ServerApiVersion.v1 });
const app = express();
let cost = 0.0;
// Read SSL certificate and key
const httpsOptions = {
    key: fs_1.default.readFileSync('key.pem'),
    cert: fs_1.default.readFileSync('cert.pem')
};
// Use CORS middleware to allow cross-origin requests
app.use((0, cors_1.default)({
    origin: '*' //'https://localhost:8444' // Allow only the frontend origin or use '*' for all origins
}));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB.");
    }
    catch (e) {
        console.error(e);
    }
}
connectToDatabase();
const db = client.db('lnq_test');
const usersCol = db.collection('users');
const itemsCol = db.collection('items');
const tripsCol = db.collection('trips');
const contractsCol = db.collection('contracts');
const extractTonValue = (str) => {
    const match = str.match(/\(([^)]+) TON\)/);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    return null;
};
async function loadTranslations(lang) {
    const path = require('path');
    const translationFilePath = lang === 'ru'
        ? path.join(__dirname, '..', 'lang', 'RU.json')
        : path.join(__dirname, '..', 'lang', 'EN.json');
    try {
        //const fileContents = await fs.readFile(translationFilePath, 'utf8');
        // @ts-ignore
        return JSON.parse(fileContents);
    }
    catch (error) {
        console.error('Error loading translation file:', error);
        return {};
    }
}
async function matchItemsWithTrip(trip) {
    const items = await itemsCol.find({
        status: { $nin: ["contract", "no_contract"] },
        sender_uid: { $ne: trip.transporter_uid }, //not send to himself
        departure: trip.departure,
        arrival: trip.arrival,
        date: { $lte: trip.date }
    }).toArray();
    console.log('Trip:', trip);
    console.log('Found items:', items);
    return items;
}
async function matchTripsWithItem(item) {
    const trips = await tripsCol.find({
        status: "open",
        transporter_uid: { $ne: item.sender_uid }, //not send to himself
        departure: item.departure,
        arrival: item.arrival,
        date: { $gte: item.date }
    }).toArray();
    console.log('Item:', item);
    console.log('Found trips:', trips);
    return trips;
}
async function notifySenderWithMatches(objectId, senderId, cost, date, trip) {
    console.log('notify 2: ', senderId, ' ', objectId, ' ', trip._id, ' ', cost);
    await bot_1.bot.sendMessage(senderId, 'There is a new match to your item!\nTap the button to view details:', {
        reply_markup: {
            inline_keyboard: [[
                    { text: `Flight date: ${date}`, callback_data: `t_${objectId}_${trip._id}_${cost}` } // 64 bytes limit
                ]]
        }
    });
}
async function getUsernameFromTelegramId(userId) {
    try {
        const user = await bot_1.bot.getChat(userId);
        return user.username || null;
    }
    catch (error) {
        console.error('Error fetching username:', error);
        return null;
    }
}
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
app.post('/newItem', async (req, res) => {
    try {
        // @ts-ignore
        const { sender_uid, date, size, weight, value, urgency, departure, arrival, estimate } = req.body;
        const estimateTon = extractTonValue(estimate);
        console.log('Received data:', req.body);
        console.log('Ton:', estimateTon);
        if (estimateTon !== null) {
            cost = estimateTon;
        }
        else {
            throw new Error('Invalid TON estimate');
        }
        if (!sender_uid || !size || !weight || !value || !urgency || !departure || !arrival) {
            console.error('Validation error: Missing fields');
            // @ts-ignore
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newItem = { sender_uid, size, weight, value, urgency, departure, arrival, date, cost, status: "new" };
        const result = await itemsCol.insertOne(newItem);
        // @ts-ignore
        res.status(200).json({ message: 'Item saved successfully', itemId: result.insertedId });
        await bot_1.bot.sendMessage(sender_uid, `Item saved:\n${newItem.departure} -> ${newItem.arrival}\n` +
            `Size: ${newItem.size}\n` +
            `Weight: ${newItem.weight}\n` +
            `Urgency: ${newItem.urgency}\n` +
            `Value: ${newItem.value}\n\n` +
            'We will update you after finding a match.');
        console.log('Total items:', await itemsCol.countDocuments());
        await delay(5000);
        const matches = await matchTripsWithItem(newItem);
        for (let match of matches) {
            await notifySenderWithMatches(result.insertedId, newItem.sender_uid, newItem.cost.toString(), match.date, match);
        }
    }
    catch (error) {
        console.error('Error in /save endpoint:', error);
        if (error.message.includes("validation")) {
            // @ts-ignore
            res.status(400).json({ message: 'Validation error', error: error.message });
            console.error('Validation error', error);
        }
        else {
            // @ts-ignore
            res.status(500).json({ message: 'Error saving item', error: error.message });
            console.error('Error saving item', error);
        }
    }
});
app.post('/newTrip', async (req, res) => {
    try {
        // @ts-ignore
        const { transporter_uid, departure, arrival, date } = req.body;
        const newTrip = { transporter_uid, departure, arrival, date, status: "open" };
        const result = await tripsCol.insertOne(newTrip);
        // @ts-ignore
        res.status(200).json({ message: 'Trip added', tripId: result.insertedId });
        await bot_1.bot.sendMessage(transporter_uid, `Trip saved:\n${newTrip.departure} -> ${newTrip.arrival}\n` +
            `Date: ${newTrip.date}\n\n` +
            'Sender will contact you in case of match.');
        console.log('Total trips:', await tripsCol.countDocuments());
        await delay(5000);
        const matches = await matchItemsWithTrip(newTrip);
        for (let match of matches) {
            await notifySenderWithMatches(match._id, match.sender_uid, match.cost.toString(), newTrip.date, newTrip);
        }
    }
    catch (error) {
        console.error('Error adding trip:', error);
        // @ts-ignore
        res.status(500).json({ message: 'Error adding trip', error: error.message });
    }
});
app.post('/receive-qr-data', async (req, res) => {
    console.log(`We received QR on backend!`);
    try {
        // @ts-ignore
        const qrCodeData = req.body.qrCodeData;
        console.log('Received QR Code data:', qrCodeData); //data is a contract id
        // Here you can process the QR code data as needed
        const contrSearch = await contractsCol.findOne({ _id: new mongodb_1.ObjectId(qrCodeData) });
        console.log('Received QR Code data:', contrSearch);
        if (contrSearch) {
            const sTw = contrSearch.s.address;
            const trTw = contrSearch.tr.address;
            const senderUser = await usersCol.findOne({ address: sTw });
            const transporterUser = await usersCol.findOne({ address: trTw });
            if (senderUser && transporterUser) {
                const senderChatId = senderUser.user_id; // We store Telegram chatId in the users collection
                const transporterChatId = transporterUser.user_id; // Same for transporter
                console.log('Received QR Code data:', senderUser);
                await delay(3000); // Optional delay before sending the message
                try {
                    // Send message to the sender about the item delivery
                    await bot_1.bot.sendMessage(senderChatId, 'Your item has been delivered.');
                    // Send message to the transporter about successful delivery
                    await bot_1.bot.sendMessage(transporterChatId, 'Congrats! You delivered the item. Funds will be transferred to your account very soon.');
                }
                catch (error) {
                    console.error('Error sending delivery confirmation messages:', error);
                }
                // @ts-ignore
                res.status(200).json({ message: 'QR received and messages sent.' });
            }
            else {
                // Handle case where the sender or transporter cannot be found
                // @ts-ignore
                res.status(404).json({ message: 'Sender or Transporter not found.' });
            }
        }
        else {
            // Handle case where the contract is not found
            // @ts-ignore
            res.status(404).json({ message: 'Contract not found.' });
        }
    }
    catch (error) {
        console.error('Error reading QR:', error);
        // @ts-ignore
        res.status(500).json({ message: 'Error reading QR', error: error.message });
    }
});
async function handleDataCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;
    //const userLang = msg.from.language_code || 'en';
    //const userLang = callbackQuery.from.language_code || 'en';
    //const translations = await loadTranslations(userLang);
    if (data === 'remove') {
        try {
            const result = await usersCol.deleteOne({ user_id: userId });
            if (result.deletedCount === 1) {
                await bot_1.bot.sendMessage(chatId, "Data removed"); // 'translations['data_removed_msg']);
            }
            else {
                await bot_1.bot.sendMessage(chatId, "No data found"); // 'No data found to remove.');
            }
        }
        catch (error) {
            console.error('Error removing user data:', error);
            await bot_1.bot.sendMessage(chatId, "Error"); // translations['data_removed_err']);
        }
    }
    else if (data.startsWith('t_')) { //64 bytes only
        console.log('notify 3:', data);
        const parts = data.split('_');
        const itemId = parts[1];
        const tripId = parts[2];
        const cost = parts[3];
        const trip = await tripsCol.findOne({ _id: new mongodb_1.ObjectId(tripId) });
        const transporterId = trip.transporter_uid;
        const transporterUsername = await getUsernameFromTelegramId(transporterId);
        await bot_1.bot.sendMessage(chatId, `The transporter's username is: @${transporterUsername}.\nContact to discuss and make a contract.`, {
            reply_markup: {
                inline_keyboard: [[
                        { text: "With TON contract", callback_data: `c_${itemId}_${transporterId}_${cost}` },
                        { text: "Without contract", callback_data: `n_${itemId}_${transporterId}_${cost}` }
                    ]]
            }
        });
    }
    else if (data.startsWith('c_')) {
        console.log('notify 4:', data);
        const parts = data.split('_');
        const itemId = parts[1];
        const transporterId = parts[2];
        const cost = parts[3];
        const item = await itemsCol.findOne({ _id: new mongodb_1.ObjectId(itemId) });
        const sender = item.sender_uid;
        const transporter = await usersCol.findOne({ user_id: transporterId });
        //check information for contract opening
        if (!sender || !transporter) {
            await bot_1.bot.sendMessage(chatId, 'Error: Could not find user information.');
            return;
        }
        // trigger handleSendTXCommand
        const sendTXMessage = {
            chat: { id: chatId },
            from: { id: callbackQuery.from.id },
            //text: `/send_tx ${tripId} ${transporterId}`, // paying full amount
            type: 'full',
            cost: cost,
            address: address4 // send full amount from sender's address to contract4
        };
        try {
            // @ts-ignore
            await (0, command_handlers_1.handleSendTXCommand)(sendTXMessage);
        }
        catch (error) {
            await bot_1.bot.sendMessage(chatId, `Error during withdrawal: ${error.message}`);
            return;
        }
        const result1 = await itemsCol.findOneAndUpdate({ _id: new mongodb_1.ObjectId(itemId) }, { $set: { status: 'full' } });
        //await bot.sendMessage(chatId, 'Full withdrawal done');
        await delay(2000);
        const newContract = {
            s: sender,
            tr: transporter,
            item: result1,
            amount: cost,
            status: "open"
        };
        const contractId = await contractsCol.insertOne(newContract);
        const confirmQr = await qrcode_1.default.toBuffer(contractId.insertedId.toString());
        await bot_1.bot.sendMessage(chatId, `Contract is open`);
        await bot_1.bot.sendPhoto(chatId, confirmQr, { caption: 'Delivery initiated. This QR should be used for confirmation.' });
        const result = await itemsCol.findOneAndUpdate({ _id: new mongodb_1.ObjectId(itemId) }, { $set: { status: 'contract' } });
        const senderName = await getUsernameFromTelegramId(sender);
        await bot_1.bot.sendMessage(transporter.user_id, `Contract with ${senderName} created successfully.\nDeliver the item to get paid ${newContract.amount} TON.`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Confirm delivery", web_app: { url: `${scanAppUrl}` } }
                    ]
                ]
            }
        });
    }
    else if (data.startsWith('n_')) {
        console.log('notify 5:', data);
        const parts = data.split('_');
        const itemId = parts[1];
        const transporterId = parts[2];
        const cost = parts[3];
        const item = await itemsCol.findOne({ _id: new mongodb_1.ObjectId(itemId) });
        const sender = await usersCol.findOne({ user_id: item.sender_uid });
        const transporter = await usersCol.findOne({ user_id: transporterId });
        if (!sender || !transporter) {
            await bot_1.bot.sendMessage(chatId, 'Error: Could not find user information.');
            return;
        }
        // Not trigger handleSendTXCommand
        try {
            const result1 = await itemsCol.findOneAndUpdate({ _id: new mongodb_1.ObjectId(itemId) }, { $set: { status: 'full_nc' } });
            const newContract = {
                s: sender,
                tr: transporter,
                item: result1,
                amount: cost,
                status: "open"
            };
            const contractId = await contractsCol.insertOne(newContract);
            const confirmQr = await qrcode_1.default.toBuffer(contractId.insertedId.toString());
            await bot_1.bot.sendPhoto(chatId, confirmQr, { caption: 'Delivery initiated. This QR should be used for confirmation.' });
            const result = await itemsCol.findOneAndUpdate({ _id: new mongodb_1.ObjectId(itemId) }, { $set: { status: 'no_contract' } });
            const senderName = await getUsernameFromTelegramId(sender.user_id);
            await bot_1.bot.sendMessage(transporter.user_id, `Contract with ${senderName} created successfully.\nDeliver the item to get paid ${newContract.amount} TON.`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Confirm delivery", web_app: { url: `${scanAppUrl}` } }
                        ]
                    ]
                }
            });
        }
        catch (error) {
            await bot_1.bot.sendMessage(chatId, `Error during contract settings: ${error.message}`);
        }
    }
    else if (data === 'show_qr_code') {
        const wallets = await (0, wallets_1.getWallets)();
        const connector = (0, connector_1.getConnector)(chatId);
        connector.onStatusChange(wallet => {
            if (wallet) {
                bot_1.bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
            }
        });
        const tonkeeper = wallets.find(wallet => wallet.appName === 'tonkeeper');
        const link = connector.connect({
            bridgeUrl: tonkeeper.bridgeUrl,
            universalLink: tonkeeper.universalLink
        });
        const image = await qrcode_1.default.toBuffer(link);
        await bot_1.bot.sendPhoto(chatId, image);
    }
}
async function updateUserWalletAddress(chatId) {
    const storage = new storage_redis_1.TonConnectStorage(chatId);
    const key = "ton-connect-storage_bridge-connection";
    const storedValue = await storage.getItem(key);
    if (!storedValue) {
        console.error(`No value found in storage for chatId: ${chatId}`);
        return;
    }
    const parsedValue = JSON.parse(storedValue);
    const walletAddress = parsedValue.connectEvent.payload.items[0].address;
    // Find user
    const user = await usersCol.findOne({ user_id: chatId.toString() });
    if (user) {
        // If the user exists, update the address if it's different
        if (user.address !== walletAddress) {
            await usersCol.updateOne({ user_id: chatId.toString() }, { $set: { address: walletAddress } });
            console.log(`Updated user ${chatId} with new address ${walletAddress}`);
        }
        else {
            console.log(`Address for user ${chatId} is already up-to-date`);
        }
    }
    else {
        // If the user does not exist, insert a new user
        await usersCol.insertOne({ user_id: chatId.toString(), address: walletAddress });
        console.log(`Inserted new user ${chatId} with address ${walletAddress}`);
    }
}
bot_1.bot.on('callback_query', handleDataCallback);
bot_1.bot.onText(/\/connect/, command_handlers_1.handleConnectCommand);
bot_1.bot.onText(/\/disconnect/, command_handlers_1.handleDisconnectCommand);
bot_1.bot.onText(/\/my_wallet/, command_handlers_1.handleShowMyWalletCommand);
bot_1.bot.onText(/\/about/, command_handlers_1.handleAboutCommand);
bot_1.bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id.toString();
    const connector = (0, connector_1.getConnector)(chatId);
    if (text === '/start') {
        try {
            await connector.restoreConnection();
            //if (!connector.connected) {
            //    await bot.sendMessage(chatId, 'Please connect TON wallet first. Use /connect command.');
            //return;
            //}
            await bot_1.bot.sendMessage(chatId, 'Choose an option:', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📦 New item', web_app: { url: `${webAppUrl}/newItem?userId=${userId}` } },
                            { text: '✈️ New trip', web_app: { url: `${webAppUrl}/newTrip?userId=${userId}` } },
                        ],
                        [
                            { text: '💸 Donate with Boosty', web_app: { url: `${blink}` } }
                        ]
                        //,[
                        //    {text: '❌ Remove my data', callback_data: 'remove'}
                        //]
                    ]
                }
            });
        }
        catch (e) {
            console.log('Wallet not connected', e);
        }
    }
});
// Create HTTPS server
https_1.default.createServer(httpsOptions, app).listen(port, () => {
    console.log(`HTTPS Server running at https://${bck_address}:${port}`);
});
//# sourceMappingURL=main.js.map