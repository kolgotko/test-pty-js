#!/usr/bin/env node

'use strict';

const pty = require('node-pty');
const Redis = require('ioredis');
const input = new Redis;
const output = new Redis;
const eventsIn = new Redis;
const eventsOut = new Redis;
const shell = '/bin/sh';

(async _ => {

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

        await output.publish('remote_stdout', chunk)

    });

    child.on('exit', async (...data) => {

        console.log(data);
        let message = {
            name: 'exit',
            data: {
                signal: data[0]
            },
        };

        await eventsOut.publish('events', JSON.stringify(message));

        process.exit();

    });

    await input.subscribe('remote_stdin');
    await eventsIn.subscribe('events');

    input.on('message', async (channel, message) => {

        child.write(message);

    });

    eventsIn.on('message', async (channel, message) => {

        let event = JSON.parse(message);
        if (event.name === 'resize') {

            let {columns, rows} = event.data;

            child.resize(columns, rows);

        }

    });

})();

