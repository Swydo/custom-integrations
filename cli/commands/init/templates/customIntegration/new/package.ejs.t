---
to: package.json
---
{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "A Swydo custom integration",
  "main": "src/index.js",
  "scripts": {
    "start": "custom-integrations start --tunnel",
    "validate": "custom-integrations validate",
    "test": "npm run validate"
  },
  "author": "You",
  "license": "ISC",
  "dependencies": {
    "@swydo/custom-integrations": "^<%= customIntegrationsVersion %>"
  }
}
