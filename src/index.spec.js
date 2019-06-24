const { describe, it } = require('mocha');
const { expect } = require('chai');
const index = require('./index');

describe('index', function () {
    describe('module exports', function () {
        it('only exports buildCustomIntegration', function () {
            expect(Object.keys(index)).to.deep.equal(['buildCustomIntegration']);
        });
    });
});
