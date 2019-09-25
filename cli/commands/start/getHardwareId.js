const hwid = require('hwid'); // Require without destructuring to allow mocking.

async function getHardwareId() {
    try {
        return await hwid.getHWID();
    } catch (e) {
        return null;
    }
}

module.exports = {
    getHardwareId,
};
