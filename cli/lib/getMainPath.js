const path = require('path');
const { getPackage } = require('./getPackage');

function getMainPath() {
    const { main } = getPackage();

    if (!main) {
        throw new Error('PROJECT_MISSING_MAIN');
    }

    return path.join(process.cwd(), main);
}

module.exports = {
    getMainPath,
};
