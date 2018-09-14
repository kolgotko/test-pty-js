#!/usr/bin/env node

'use strict';

const pty = require('node-pty');
const TTYServer = require('./tty-server.js');
const shell = '/bin/sh';
const ttyId = 'test';

(async _ => {

    let tty = await TTYServer.factory(ttyId);

    let {
        columns = 80,
        rows = 30
    } = process.stdout;

    let child = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: columns,
        rows: rows,
    });

    child.on('data', async chunk => {

        await tty.write(chunk);

    });

    child.on('exit', async (...data) => {

        let message = {
            name: 'exit',
            data: {
                signal: data[0]
            },
        };

        await tty.sendEvent(message);

        process.exit();

    });

    tty.on('data', chunk => {

        child.write(chunk);

    });

    tty.on('resize', async event => {

        let {columns, rows} = event.data;

        child.resize(columns, rows);

    });

})();

