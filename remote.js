#!/usr/bin/env node

'use strict';

const TTYClient = require('./tty-client.js');
const ttyId = 'test';

(async _ => {

    let tty = await TTYClient.factory(ttyId);

    process.stdin.setRawMode(true);

    process.stdin.on('data', async chunk => await tty.write(chunk));

    tty.on('data', chunk => process.stdout.write(chunk));

    tty.on('exit', event => process.exit());

    process.stdout.on('resize', async _ => {

        let message = {
            name: 'resize',
            data: {
                columns: process.stdout.columns,
                rows: process.stdout.rows,
            }
        }

        await tty.sendEvent(message);

    })

})();
