# custom-integrations

[![CircleCI](https://img.shields.io/circleci/build/github/Swydo/custom-integrations/master.svg?label=circleci&style=flat-square)](https://circleci.com/gh/Swydo/custom-integrations) [![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg?style=flat-square)](https://istanbul.js.org/) [![npm](https://img.shields.io/npm/v/@swydo/custom-integrations.svg?style=flat-square)](https://www.npmjs.com/package/@swydo/custom-integrations) [![node](https://img.shields.io/node/v/@swydo/custom-integrations.svg?style=flat-square)](https://nodejs.org/) [![conventionalCommits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org) [![GitHub](https://img.shields.io/github/license/Swydo/custom-integrations.svg?style=flat-square)](https://github.com/Swydo/custom-integrations/blob/master/LICENSE) [![Gitter](https://img.shields.io/gitter/room/Swydo/custom-integrations?color=%2351ba9a&style=flat-square)](https://gitter.im/Swydo/custom-integrations?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

<img src="https://user-images.githubusercontent.com/2283434/52522860-25eee400-2c8b-11e9-8602-f8de0d158600.png">

<br/>
<br/>

Swydo custom integrations enables any online platform to connect to Swydo. Join us on [Gitter](https://gitter.im/Swydo/custom-integrations).

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Get started](#get-started)
- [Quick start](#quick-start)
  - [Install](#install)
  - [Create your adapter configuration](#create-your-adapter-configuration)
  - [Export your custom integration](#export-your-custom-integration)
- [Example implementation](#example-implementation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## Get started

To get started with building custom integrations for the Swydo platform we recommend going through the following steps
to get accustomed to the terminology and workflow.

-   [Build and test a Hello World integration](docs/guides/helloWorld.md).

**Next:** Adapt and connect your data.

-   Have a look at the [Star Wars custom integration](https://github.com/Swydo/star-wars-integration).
-   Read our [tips and tricks](docs/guides/tipsAndTricks.md).
-   Be inspired and explore our [common fields](docs/guides/commonFields.md).
-   Learn all about data [scopes](docs/guides/scopes.md).

**References:** Detailed references to explore all possibilities.

-   [Adapter configuration specification](docs/reference/adapterConfiguration.md)
-   [CLI commands](docs/reference/cli.md)

## Quick start

The supported Node.js version is `10.x`.

### Install

```bash
npm install @swydo/custom-integrations
```

### Create your adapter configuration

Have a look at the [Adapter configuration specification](docs/reference/adapterConfiguration.md) for all options and possibilities.

`src/adapter.js`

```javascript
const adapter = {
    id: 'my-custom-integration',
    authentication: {
        // Your authentication method
    },
    endpoints: [
        // Your endpoints.
    ],
};

module.exports = {
    adapter,
};
```

### Export your custom integration

`src/index.js`

```javascript
const { buildCustomIntegration } = require('@swydo/custom-integrations');
const config = require('./adapter');

const customIntegration = buildCustomIntegration(config);

module.exports = {
    customIntegration,
};
```

Your module defines the file the custom integration is exported from (the entrypoint) as "main" in your package.json file.

`package.json`

```json
{
    "name": "my-swydo-integration",
    "version": "0.0.1",
    "main": "src/index.js",
    "dependencies": {
        "@swydo/custom-integrations ": "latest"
    }
}
```

[Learn more](https://docs.npmjs.com/files/package.json) about `package.json` on npmjs.com.

## Example implementation

A complete custom integration example integrating the [Star Wars API](https://swapi.co/) can be found here: [github.com/Swydo/star-wars-integration](https://github.com/Swydo/star-wars-integration)
