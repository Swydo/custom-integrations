## Tips and tricks

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Fields](#fields)
  - [Marking fields as metric or dimension](#marking-fields-as-metric-or-dimension)
  - [Use default values when possible](#use-default-values-when-possible)
  - [Offering date fields](#offering-date-fields)
  - [Offering filters](#offering-filters)
- [Connector](#connector)
  - [Pagination](#pagination)
  - [Filtering](#filtering)
  - [Response structure and dimensions/grouping](#response-structure-and-dimensionsgrouping)
  - [Reusing your connector](#reusing-your-connector)
- [Structure](#structure)
  - [Default structure](#default-structure)
  - [Multiple endpoints](#multiple-endpoints)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Fields

#### Marking fields as metric or dimension

When defining fields you have the option to mark these as being a metric, a dimension or both of these. Users
can pick dimensions to group the data in a certain way while metrics describe this data. When no dimensions are chosen
metrics can still be shown standalone as a KPI (key performance indicator).

When it comes to marking fields as metrics or dimensions you should first determine what your users expect from your
integration, but there are a few guidelines:

-   Fields of type "Number" are most often metrics.
-   Fields of type "String" or "Object" are usually dimensions, but can also be used as a metric. For instance, when a
    "campaign" has "labels" a user might want to show all labels for a certain campaign while at the same time wanting to
    show how each individual "label" performed by using it as a dimension.
-   Field of type "Boolean" can usually be used as both dimension and metric.

#### Use default values when possible

You'll notice that you have a ton of options when it comes to configuring your fields (see the
[reference documentation](../reference/adapterConfiguration.md)), but do keep in mind that we offer sensible defaults
for many of these.

Some common ones:

-   `isSelectable` is true by default, as we've found most fields are available to the user.
-   `aggregate` has defaults depending on the field's `type`. Usually you won't have to set this for type "String" fields.
-   `filter` will automatically set `endpointId` when filter options are requested. You'll only have to specify `idField`
    and `nameField`.

#### Offering date fields

When you have some sort of time series available in your API Swydo users expect to be able to pick the granularity
in their widgets. For instance, they'll want to show metrics by day, by month or by month of the year. Depending on
the type of data you can also offer fields such as "day of the week".

You can use some logic in your connector to create date time fields from your most granular one using the `moment`
package from npm. For date formats and all supported types have a look at the
[reference documentation](../reference/adapterConfiguration.md#fields).

```javascript
const moment = require('moment');

const supportedDatesTypesMap = {
    week: 'ggggww',
    isoWeek: 'GGGGWW',
    month: 'YYYY-MM',
    quarter: 'YYYY-Q',
    year: 'YYYY',
    isoYear: 'GGGG',
    hourOfDay: 'hourOfDay',
    dayOfWeek: 'dayOfWeek',
};
const supportedDateTypes = Object.keys(supportedDatesTypesMap);

function addDateTimeFields(rows) {
    rows.forEach(function(row) {
        const dayMoment = moment(row.day, 'YYYY-MM-DD');

        supportedDateTypes.forEach(function(dateType) {
            row[dateType] = dayMoment.format(supportedDatesTypesMap[dateType]);
        });
    });
}
```

#### Offering filters

Filters are an important aspect of your integration. It allows Swydo users to show to their clients exactly the thing
they want to show, instead of being stuck with whatever your integration returns. You'll usually want to add filters for
all fields of type "String", or all dimensions.

A filter definition mainly consists of two parts:

-   `operators`, define the way a filter can function. For instance, a filter can be an "INCLUDES" filter, or perhaps a
    "CONTAINS" filter. Each operator type has `capabilities` that tell Swydo whether or not the filter supports case
    insensitivity, or negation.
-   `options` or `optionsRequest` tells Swydo what the available options are for your filter. When you specify `options`
    Swydo users can pick from these options to configure their filter. When you specify `optionsRequest` Swydo will make
    a request to your custom integration to fetch the list dynamically.

A field defining an INCLUDES filter with support for case-sensitive filtering could look like this:

```javscript
const campaignField = {
    id: 'label',
    name: 'Label'
    filter: {
        optionsRequest: {
            idField: 'label',
            nameField: 'label',
        },
        operators: [{
            type: 'INCLUDES',
            capabilities: {
                caseSensitive: true,
                caseInsensitive: false,
                negate: true
            }
        }]
    }
```

This will allow a user to INCLUDE specific labels. Thanks to the `negate` capability the filter can be inversed to
essentially get EXCLUDE functionality too. Because the `options` and `optionsRequest` properties are left out Swydo
will automatically request all possible values for this field to be used as filter options.

### Connector

#### Pagination

To keep request fast and snappy, and to support large data sets you'll want to implement pagination in your custom
integration. Pagination means splitting a data request into bite-size chunks, many APIs implement pagination, so if
yours does we recommend using it.

Pagination is supported in a few different ways:

-   By total result count. Swydo will automatically calculate the number of pages and request them given a total count
    and the number of results per apge.
-   By total page count. Similar to the previous implementation, except you tell Swydo how many pages there are.
-   By `nextPage` property. Each request returns a `nextPage` which Swydo will request one by one.

First enable pagination in your endpoint configuration:

```javascript
const endpoint = {
    // ...
    pagination: {
        enabled: true,
        perPage: 100,
    },
};
```

Choose a sensible number for `perPage`. Bigger numbers aren't necessarily faster as Swydo will try to request multiple
pages in parallel.

With pagination enabled your connector will be called with pagination options. These are:

-   `page`, the page number that should be requested by the connector this request.
-   `perPage`, the value you entered in your endpoint configuration.
-   `nextPage`, the URL to the next page, if returned by the previous request.

The connector should obey these options as usual, for instance by passing the page number into your API, or making an
HTTP request to the `nextUrl`. When pagination is enabled your connector _should only request a single page_.

It's up to the `connector` to return one of `totalPages`, `resultCount` or `nextPage`. When you
do Swydo will automatically call your connector again.

```javascript
return {
    rows,
    // Return one of the following to have Swydo call your connector again for the rest of the data.
    // nextPage,
    // totalCount
    // totalPages
};
```

If your API returns totals these should be returned in the first request together with the rows for the first page.

#### Filtering

When Swydo users select the filter as part of their widget and the widget loads the request to your custom integration
will include the filter. Now it's up to the `connector` to fulfill the request. If your API supports the filter
natively you can pass on the filter `expressions`. Otherwise you can filter the `rows` you're about to return from
your connector manually.

The below example supports the INCLUDES filter with the `negate` capability set to true.

```javascript
let rows = [
    {
        label: 'Foo',
    },
    {
        label: 'Bar',
    },
];

filters.forEach(filter => {
    rows = rows.filter(row => {
        const isIncluded = filter.expressions.includes(row[filter.key]);

        return filter.negate ? !isIncluded : isIncluded;
    });
});
```

#### Response structure and dimensions/grouping

Chances are your API doesn't return the data exactly the way Swydo likes it. Especially when it comes to grouping data
by a specific dimension Swydo offers a lot of functionality that most APIs don't. When your response doesn't exactly
match the request Swydo is going aggregate your data automatically, taking into account the `aggregate` and `formula`
properties of fields. That way your API can return a simple, flat data structure while offering flexibility to Swydo
users.

Some guidelines:

-   Try requesting data keeping in mind the dimensions requested by the user. The closer the output of your connector
    is to the expected result the faster the request is going to be (less data being transferred, less processing
    happening on Swydo servers).
-   Specify `aggregate` on your fields. The `aggregate` field tells Swydo what to do when it needs to squash
    multiple rows into one. You can tell Swydo to sum, average and more, see the
    [reference documentation](../reference/adapterConfiguration.md#fields) for all options.
-   Calculate ratios and percentages. Taking an average of a percentage usually doesn't do what you might expect it to do.
    Use formulas to calculate these fields from their root values. For instance, use two fields "cost" and "clicks" to
    calculate "costPerClick" using the formula "cost / clicks". Swydo will detect you're calculating this field from
    "cost" and "clicks" and requests these fields from your connector instead of "costPerClick".

#### Reusing your connector

When your integration grows and more endpoints are added to expand functionality you should consider reusing parts
of your connector to fulfill the needs of multiple endpoints. Reducing duplication helps with testing and general
stability of your custom integration, as well as making it easier to implement changes later on.

When we want to reuse parts of our connector we have to look at what our connector does in the first place. The
connector is a layer between Swydo and your API and usually has three tasks

-   Taking the options as the first parameter from the connector and transforming them into something your API gets
-   Make the request to your API
-   Transform the response into something Swydo gets.

Depending on your API you can extract much of it into a shared function. You connector can now be described as:

-   Take the options and transform them into something the generic function gets
-   Call the generic function and return the response.

Let's look at the following example:

```javascript
async function connectorA(options) {
    const requestOptions = {
        uri: 'http://example.com/A',
        method: 'GET',
        json: true,
        qs: {
            page: options.page,
        },
        useQuerystring: true,
    };

    const { results: rows } = await rp(requestOptions);

    return { rows };
}

async function connectorB(options) {
    const requestOptions = {
        uri: 'http://example.com/B',
        method: 'GET',
        json: true,
        qs: {
            page: options.page,
        },
        useQuerystring: true,
    };

    const { results: rows, count: resultCount } = await rp(requestOptions);

    return { rows };
}
```

Much of the connector is actually duplicate code! By creating a separate function we can reduce duplication:

```javascript
async function requestData(path, { page }) {
    const requestOptions = {
        uri: `http://example.com${path}`,
        method: 'GET',
        json: true,
        qs: {
            page,
        },
        useQuerystring: true,
    };

    const { results: rows } = await rp(requestOptions);

    return { rows };
}

async function connectorA(options) {
    return requestData('/A', { page: options.page });
}

async function connectorB(options) {
    return requestData('/B', { page: options.page });
}
```

The connector is now an abstraction layer on top of `requestData`, which is in its turn a layer on top of your API.
The connector takes the `options` parameter and extracts only the things you need in `requestData` so that it doesn't
have to deal with the large `options` object anymore.

### Structure

#### Default structure

```
swydo-hello-world/
    ├── package.json        // Project definition, created by "npm init".
    └── src/
        ├── adapter.js      // This contains the adapter configuration.
        ├── connector.js    // Contains the function to call the external API, in our case SWAPI.
        └── index.js        // This takes the configuration from adapter.js and turns it into a custom
```

This is the default structure created by `npx @swydo/custom-integrations init`.
It's a simple structure that separates the configuration and the connector function.
This works best for very simple and small APIs that don't reuse any configuration.

#### Multiple endpoints

```
my-custom-integrations/
    ├── package.json                  // Project definition, created by "npm init".
    └── src/
        ├── endpoints/                // Directory containing endpoints.
        │   ├── my-first-endpoint     // Directory containing all config for the first endpoint.
        │   │   ├── endpoint.js       // This contains the endpoint configuration.
        │   │   ├── fields.js          // This contains the fields configuration for that endpoint.
        │   │   └── connector.js      // This contains the endpoint's connector.
        │   └── my-second-endpoint    // Directory containing all config for the first endpoint.
        │       └── ...               // Same structure as my-first-endpoint.
        ├── lib/                      // Directory containing generic/cross endpoint resources.
        │   ├── baseUrl.js            // This contains the API's base url that can be reused by connectors.
        │   ├── filterCapabilities.js // This contains the filter capabilities fields for every endpoint support.
        │   └── requestData.js        // This contains a function to request data for the given url and request options.
        ├── adapter.js                // This contains the adapter configuration.
        └── index.js                  // This takes the configuration from adapter.js and turns it into a custom integration.
```

For more complex APIs it's recommended to split configuration per endpoint and put parts that can be used by multiple endpoints inside a lib directory.
This makes it clear that any configuration or code inside an endpoint folder is only to be used by that endpoint and reusable parts can be imported from `lib/`.

In this example every endpoint requests data in exactly the same way but for different urls.
This means that every connector for an endpoint calls the function exported from `requestData`.
The connector will also import `baseUrl` and add a suffix to it, for example: `/my-first-endpoint`.
It will call the `requestData` function with the combined url + the options that are always passed into a connector.
