import { exec } from 'node:child_process';
import path from 'node:path';
import { dirname } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';
import { FgCyan, Reset } from './colors.js';

// #region Python Check

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.stdout.write(`${FgCyan}${__dirname}${Reset}\n\n`);

// Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Manage App Execution Aliases.
// Python 2.7.15
// Python 3.8.2
exec('python --version', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    if (stderr) {
        process.stderr.write(stderr);
        return;
    }

    process.stdout.write(stdout);

    if (stdout.startsWith('Python 3')) {
        start();
    } else {
        exit('Please install Python 3 and add it to your path!');
    }
});

// #endregion

// #region Web Socket Client

// const WS_ADDR = 'ws://127.0.0.1:8888';
const WS_ADDR = 'wss://bau-capstone-1010168.herokuapp.com';
const td = new TextDecoder();
let ws = null;

function start() {
    console.log('Connecting to the server...');
    ws = new WebSocket(WS_ADDR, { handshakeTimeout: 3000 });

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
            }
        }

        // BINARY MESSAGE
        else {
            waitingFrame = false;

            // {
            //     format: 'jpeg',
            //     width: 1296,
            //     height: 730,
            //     channels: 3,
            //     premultiplied: false,
            //     size: 51337
            // }
            const timeMs = Date.now();
            const cvPath = `${path.join(__dirname, '../cv')}`;
            const testImgPath = `${path.join(cvPath, 'test.py')}`;
            const imgPath = `${path.join(__dirname, '../img', `${timeMs}_frame.jpg`)}`;
            sharp(data).toFile(testImgPath, (err, info) => {
                if (err) console.error(err);
                console.log(info);

                exec('python test.py', { cwd: cvPath }, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (stderr) {
                        process.stderr.write(stderr);
                        return;
                    }

                    process.stdout.write(stdout);
                });
            });
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
}

// #endregion

// #region App

function exit(msg) {
    console.log(msg);
    ws?.close();
    console.log('BYE 👋');
    process.exit();
}

process.once('SIGINT', (code) => {
    exit(`[APP] SIGINT: ${code}`);
});

process.once('SIGTERM', (code) => {
    exit(`[APP] SIGTERM: ${code}`);
});

// #endregion
