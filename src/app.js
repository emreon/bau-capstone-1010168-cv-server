import sharp from 'sharp';
import WebSocket from 'ws';

// #region Web Socket Client

// const WS_ADDR = 'ws://192.168.2.68:8888';
const WS_ADDR = 'wss://bau-capstone-1010168.herokuapp.com';
const td = new TextDecoder();
let sendFrameIntervalId = -1;

console.log('Connecting to the server...');
const ws = new WebSocket(WS_ADDR, { handshakeTimeout: 3000 });

ws.sendMessage = (msg, cb) => {
    const msgStr = JSON.stringify(msg);
    ws.send(msgStr);
};

ws.on('open', () => {
    console.log(`Connected to "${WS_ADDR}"`);
    ws.sendMessage('👁️');
});

let waitingFrame = false;
let pos = null;
ws.on('message', (data, isBinary) => {
    // TEXT MESSAGE
    if (!isBinary) {
        const msgStr = td.decode(data);
        const msg = JSON.parse(msgStr);

        // WAIT FOR FRAME
        if (msg.name === 'CV' && !waitingFrame) {
            pos = msg.pos;
            waitingFrame = true;
            console.log(msg);
        }
    }

    // BINARY MESSAGE
    else {
        // waitingFrame = false
        saveImage(data);

        // data
        // exec('ls -lh', (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`error: ${error.message}`);
        //         return;
        //     }
        //     if (stderr) {
        //         console.error(`stderr: ${stderr}`);
        //         return;
        //     }
        //     console.log(`stdout:\n${stdout}`);
        // });
    }
});

ws.on('error', (error) => {
    console.error('Socket Error:', error);
});

ws.on('close', (code, reason) => {
    console.log('Connection closed:', code, reason);
    console.log('Exiting in 10 seconds...');
    setTimeout(() => {
        console.log('BYE 👋');
        process.exit();
    }, 10_000);
});

// ...

// #endregion

// #region CV

async function saveImage(buffer) {
    //  {
    //     format: 'jpeg',
    //     width: 1920,
    //     height: 1080,
    //     channels: 3,
    //     premultiplied: false,
    //     size: 50472
    //  }

    const data = await sharp(buffer);
    console.log(data);
}

// #endregion
