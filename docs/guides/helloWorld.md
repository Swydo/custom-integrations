## Hello World

Build a Hello World integration from scratch

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Goals and expectations](#goals-and-expectations)
- [Initialize the project](#initialize-the-project)
- [Default configuration](#default-configuration)
- [A Hello World connector](#a-hello-world-connector)
- [Defining fields](#defining-fields)
- [Testing the integration](#testing-the-integration)
- [Next](#next)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Goals and expectations

-   Build a simple integration using static data.
-   Understand what dimensions and metrics are.
-   Validate your custom integration configuration.
-   Connect your local environment to Swydo for testing.

### Requirements

We recommend having some programming experience. Assuming you have the basics covered you could come a long way by
looking at the examples we've made and generally just messing about.

Besides that you'll need a supported version of Node.js installed. Many of us use `nvm` to install node, but you can
also just grab an installer from the [Node.js website](https://nodejs.org/en/download/).

### Initialize the project

Create your project directory and initialize. You could use `swydo-hello-world` as the identifier when prompted.

```bash
mkdir swydo-hello-world
cd swydo-hello-world
npx @swydo/custom-integrations init
```

Install dependencies

```bash
npm install
```

Now it's time to open the project in your favorite editor, for instance the free
[Visual Studio Code](https://code.visualstudio.com/). Once opened we can see the project created by the `init` command.

```
swydo-hello-world/
    ├── package.json        // Project definition, created by "npm init".
    └── src/
        ├── adapter.js      // This contains the adapter configuration.
        ├── connector.js    // Contains the function to call the external API, in our case SWAPI.
        └── index.js        // This takes the configuration from adapter.js and turns it into a custom integration.
```

### Default configuration

The `init` command provided us with some boilerplate configuration in `src/adapter.js`, so let's go over that quickly.
Starting at the bottom of the file we find the `adapter`. It defines a unique identifier (the one you picked earlier)
as well as `authentication` and `endpoints.

```javascript
const adapter = {
    id: 'swydo-hello-world',
    authentication: {
        /* OAuth 1, OAuth 2 or a form can be defined here */
    },
    endpoints,
};
```

The adapter tells Swydo how to authenticate, this can be through OAuth 1 or 2 as well as by filling out a form. The
`init` script created a form that prompts the user for their username and password. We'll come back to these later
when we get to the `connector`. For now let's look at the endpoints.

```javascript
const fields = [];

const endpoints = [
    {
        id: 'first-endpoint',
        connector: connector,
        fields,
    },
];
```

Again the `init` script provided us with a default here. An endpoint with the identifier "first-endpoint".
Each endpoint has a `connector`, which is a JavaScript function that is going to handle requests for data by the user.
Finally `fields` define all available dimensions, metrics and filters in an endpoint. The `init` command didn't
create any fields for us,but we'll get back to those.

With the default configuration covered we can start looking at the `connector` in `src/connector.js`

```javascript
async function connector(requestOptions) {
    const rows = [];

    return { rows };
}
```

The connector doesn't do anything yet, but we can already see that we're supposed to return an object containing an
array of rows. Each `endpoint` can have its own `connector`, but for the purpose of this integration a single one
suffices.

### A Hello World connector

Instead of making matters more complicated than necessary let's make our connector return a static set of rows.

```javascript
async function connector(requestOptions) {
    const rows = [
        {
            word: 'hello',
            length: 5,
        },
        {
            word: 'world',
            length: 5,
        },
        {
            word: '!',
            length: 1,
        },
    ];

    return { rows };
}

module.exports = {
    connector,
};
```

Our fictional API now returns three rows. Each row has two properties:

-   `word`, just a string, part of the sentence "hello world!.
-   `position`, a number that represents the position of the word in a sentence.
-   `length`, another number that is the total length of that word.

### Defining fields

With our connector now returning some data we should define a `field` for each property so that users of our integration
can select these and display their values in widgets and KPIs. When defining fields it's important to realize how users
are going to use the data, how they want it to be shown in widgets. Let's assume that, after talking with stakeholders,
we can narrow things down to a few use cases.

-   I want to be able to show all words with their length.
-   I want to be able to show the total length of all words.
-   I want to be able to show which words have the same length

To fulfil the first request we have to define a "dimension". A dimension defines how the data is grouped, in this case
"per word" is what our users want.

You can copy these fields to your `adapter.js` file. You'll notice the `init` command created an empty fields array.
You can replace that array with the code below.

```javascript
const wordField = {
    id: 'word',
    name: 'Word',
    type: 'String',
    isDimension: true,
};

const lengthField = {
    id: 'length',
    name: 'Length',
    type: 'Number',
    isMetric: true,
};

const fields = [wordField, lengthField];
```

With these fields added users can create a table that shows _the length of each word, per word`_. Swydo will
automatically detect each unique "word" in our connector's response and show it along with "length".

| Word | Length |
| --- | --- |
| hello  | 5 |
| world  | 5 |
| !  | 1 |

To show the total length of all words we have to tell Swydo how the "length" field should be combined. After all, our
connector returns three rows but our users want to see a single result with the combined length. We can tell Swydo
to sum the "length" field.

```javascript
const lengthField = {
    id: 'length',
    name: 'Length',
    type: 'Number',
    aggregate: 'sum',
};
```

Now, since the result of the `connector` doesn't match what the user wants to show Swydo will
automatically merge rows. In the case of a KPI there is _no_ dimension at all and all rows are condensed in a single row
based on the `aggregate` property of a field.

| Length |
| --- |
| 11 |

We can make good use of this behaviour once more, as our users also want to see which words have the same length. To
facilitate this we can allow users to select the "word" a and "length" fields as both metric and dimension.

```javascript
const wordField = {
    id: 'word',
    name: 'Word',
    type: 'String',
    isDimension: true,
    isMetric: true,
};

const lengthField = {
    id: 'length',
    name: 'Length',
    type: 'Number',
    isDimension: true,
    isMetric: true,
};

const fields = [wordField, lengthField];
```

When the user chooses "length" as the dimension Swydo will detect all unique values of "length" and combine the values
of "word" and "length" automatically.

| Length | World |
| --- | --- |
| 10  | hello, world |
| 1  | ! |

With these changes your `src/adapter.js` file should look like this:

```javascript
const { connector } = require('./connector');

const wordField = {
    id: 'word',
    name: 'Word',
    type: 'String',
    isDimension: true,
    isMetric: true,
};

const lengthField = {
    id: 'length',
    name: 'Length',
    type: 'Number',
    isDimension: true,
    isMetric: true,
};

const fields = [wordField, lengthField];

const endpoints = [
    {
        id: 'first-endpoint',
        name: 'First endpoint',
        connector: connector,
        fields,
    },
];

const adapter = {
    id: 'swydo-hello-world',
    authentication: {
        type: 'form',
        formOptions: {
            fields: [
                {
                    label: 'Username',
                    type: 'text',
                    key: 'name',
                    placeholder: 'Username',
                },
                {
                    label: 'Password',
                    type: 'password',
                    key: 'password',
                    placeholder: 'Password',
                },
            ],
        },
    },
    endpoints,
};

module.exports = {
    adapter,
};
```

### Testing the integration

We've been writing configuration for a while now, so let's see if things are going according to plan. The `init` command
provided us with some useful scripts:

-   `npm run validate` which validates the configuration. Any errors will be shown.
-   `npm start` start a server that Swydo can connect to.

Try running `npm run validate` to check if your configuration is OK. Try removing a property from one of the fields
before running it again to see how errors are reported.

Once the configuration is valid we can run `npm start`. You'll notice this command prints out a URL after a short while.
Swydo can use this URL to connect to your local environment, so let's set that up.

Head over to [Swydo](https://app.swydo.com). From any page click your profile icon in the upper-right of the screen
and select "Custom integrations". From there head over to the "development environment". Copy your unique URL from
the terminal into the input field and activate the environment. After a short while the page should update and you'll
be greeted with, among other things, a green dot and the word "Connected". Swydo is now linked to your computer.

Now lets try it out. Head over to the reporting section by using the side menu and create a new report.

-   Click create new widget.
-   Select your development environment from the list of providers.
-   Connect a new account.
-   Run through the steps and save the data source.
-   Select the only available endpoint (endpoints are displayed as categories to end users).
-   Fill out the settings, select a combination of metrics and dimensions.
-   Click save.

After a short while the widget will load with the data you selected. At this point you might want to dive into the
`connector` function. Try placing a `console.log("Hello World!")` somewhere in the body of the function and refresh the
page. You'll see the message printed on your command line.

### Next

-   Learn about common patterns and use cases.
-   Read up on the reference documentation.
    -   [Adapter configuration specification](../reference/adapterConfiguration.md)
    -   [CLI commands](../reference/cli.md)
-   Have a look at the [Star Wars custom integration](https://github.com/Swydo/star-wars-integration).
-   [Join us on Gitter](https://gitter.im/Swydo/custom-integrations) for any questions.
