const { describe, it } = require('mocha');
const { expect } = require('chai');
const { createRowProjector } = require('./createRowProjector');

describe('createRowProjector', function () {
    it('creates a function', function () {
        const projector = createRowProjector([]);

        expect(projector).to.be.a('function');
    });

    describe('rowProjector', function () {
        it('selects fields from the given data object', function () {
            const fieldNames = ['foo', 'bar'];
            const rowProjector = createRowProjector(fieldNames);

            const row = {
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
            };
            const projectedRow = rowProjector(row);

            expect(projectedRow).to.have.all.keys(fieldNames);
        });
    });
});
