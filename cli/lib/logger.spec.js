const { describe, it } = require('mocha');
const { expect } = require('chai');
const Logger = require('./logger');

describe('logger', function () {
    it('creates a logger', function () {
        const logger = Logger('foo');

        expect(logger).to.have.property('log').that.is.a('function');
    });

    it('reuses an existing logger', function () {
        const firstLogger = Logger('bar');
        const secondLogger = Logger('bar');

        expect(firstLogger).to.equal(secondLogger);
    });
});
