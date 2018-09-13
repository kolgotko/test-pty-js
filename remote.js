#!/usr/bin/env node

'use strict';

const Redis = require('ioredis');
const input = new Redis;
const output = new Redis;
const eventsOut = new Redis;
const eventsIn = new Redis;

(async _ => {

    process.stdin.setRawMode(true);
    process.stdin.on('data', async chunk => {

        await input.publish('remote_stdin', chunk);

    });

    await output.subscribe('remote_stdout');
    await eventsIn.subscribe('events');

    output.on('message', async (channel, message) => {

        process.stdout.write(message);

    });

    eventsIn.on('message', async (channel, message) => {

        let event = JSON.parse(message);
        if (event.name === 'exit') process.exit();

    });

    process.stdout.on('resize', async _ => {

        let message = {
            name: 'resize',
            data: {
                columns: process.stdout.columns,
                rows: process.stdout.rows,
            }
        }

        await eventsOut.publish('events', JSON.stringify(message));

    })

})();
