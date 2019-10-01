function createRowProjector(fieldNames) {
    return function projectRow(data) {
        const projectedData = {};

        fieldNames.forEach(fieldName => (projectedData[fieldName] = data[fieldName]));

        return projectedData;
    };
}

module.exports = {
    createRowProjector,
};
