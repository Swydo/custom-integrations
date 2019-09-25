const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const express = require('express');
const Prando = require('prando');
const rp = require('request-promise-native');
const { openLocalTunnel, closeLocalTunnel, getLocalTunnel } = require('./localTunnel');

const {
    PORT = 3000,
} = process.env;

describe('localTunnel', function () {
    this.timeout(10000);

    let server;
    let randomString;

    beforeEach(function () {
        randomString = new Prando().nextString(7);
    });

    beforeEach(function () {
        const app = express();

        app.get('/', function (req, res) {
            res.send(randomString);
        });

        server = app.listen(PORT);
    });

    afterEach(async function () {
        closeLocalTunnel();
        server.close();
    });

    it('starts a local tunnel', async function () {
        await openLocalTunnel(PORT);

        const tunnel = getLocalTunnel();

        expect(tunnel).to.have.property('url').that.is.a('string');

        const requestResult = await rp(tunnel.url);
        expect(requestResult).to.equal(randomString);
    });

    it('reconnects when an error occurs', async function () {
        await openLocalTunnel(PORT);

        const originalTunnel = getLocalTunnel();

        // When the tunnel reconnects it'll emit a new URL, so expect that to be called within the timeout.
        const urlPromise = new Promise(function (resolve) {
            setInterval(function () {
                const newTunnel = getLocalTunnel();

                if (newTunnel !== originalTunnel) {
                    resolve();
                }
            }, 50);
        });

        // Pretend an error happened, could be the server restarting.
        originalTunnel.emit('error');

        // We only really expect this to reconnect within the test timeout.
        await urlPromise;
    });

    it('reuses an existing tunnel', async function () {
        const tunnel = await openLocalTunnel(PORT);
        const repeatTunnel = await openLocalTunnel(PORT);

        expect(tunnel).to.equal(repeatTunnel);
    });

    it('ignores a request to close a non-existing tunnel', function () {
        closeLocalTunnel();
    });
});
