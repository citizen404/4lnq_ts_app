"use strict";
console.log("scanner.js loaded successfully!");
function sendQrCodeToBot(qrCodeMessage) {
    // Replace with your bot's webhook URL
    // const botWebhookUrl = "https://your-bot-webhook-url";
    // Replace 'localhost' with your local IP address and keep the port
    const backendUrl = "https://192.168.0.106:3000/receive-qr-data";
    // Make a POST request to the bot with the QR code data
    fetch(backendUrl, {
        //fetch(botWebhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ qrCodeData: qrCodeMessage })
    })
        .then(response => response.json())
        .then(data => {
        console.log('Success:', data);
    })
        .catch((error) => {
        console.error('Error:', error);
    });
}
// Make sure to use 'DOMContentLoaded' to ensure all elements are ready
document.addEventListener("DOMContentLoaded", function () {
    // Initialize QR Code scanner
    const html5QrCode = new Html5Qrcode("qr-reader"); // Use the ID of a container div
    console.log(`Starting QR Code scanning...`);
    html5QrCode.start({ facingMode: "environment" }, // Use the back camera environment user
    {
        fps: 10, // Scans per second
        qrbox: 250 // Scanning box width
    }, qrCodeMessage => {
        // When a QR code is successfully scanned
        console.log(`QR Code detected: ${qrCodeMessage}`);
        document.getElementById('output').textContent = `QR Code detected: ${qrCodeMessage}`;
        sendQrCodeToBot(qrCodeMessage);
        // Stop scanning after a successful scan
        html5QrCode.stop().then(() => {
            console.log("QR Code scanning stopped.");
        }).catch(err => {
            console.error("Failed to stop scanning: ", err);
        });
    }, errorMessage => {
        // Handle scanning errors
        console.log(`QR Code scan error: ${errorMessage}`);
    }).catch(err => {
        console.error(`Unable to start scanning, error: ${err}`);
    });
});
//# sourceMappingURL=scanner.js.map