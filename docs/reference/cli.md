## CLI Reference

The commands below can be configured as script in your package.json or run standalone with the help 
of [npx](https://www.npmjs.com/package/npx), which shipswith supported Node.js versions by default.

As script in your package.json:
```
{
    // ...
    "scripts": {
        "start": "custom-integrations start"
    }
}
```

In your terminal or command prompt:
```
npx custom-integrations start
```

### Help

List supported commands and options. You can run `help` for each sub command as well.

```bash
custom-integrations help
```

### Global options

#### Silent

Disable non-critical logging. Errors and such will still be logged, such as when the `validate` command is used and
it detects an issue with the configuration.

`npx custom-integrations [command] -s`

#### Verbose

Increase the verbosity of logs. Available levels are "info" (default), "http", "verbose", "debug" and "silly", each
additional `v` increases the verbosity level by one.

`npx custom-integrations [command] -v[vvv]`

### Start

Start a local server. It's recommended you configure this command as your "start" script in your package.json file.

Specify `--tunnel` to expose your integration to the internet so that you can hook it up to your Swydo development
environment. You can also use a separate third-party tunnel, such as [ngrok](https://ngrok.com/)
or [localtunnel](https://github.com/localtunnel/localtunnel) if you prefer.

```bash
custom-integrations start [options]
```

### Validate

Validate your adapter configuration. Any configuration errors will be printed to the console.

```bash
custom-integrations validate [options]
```
