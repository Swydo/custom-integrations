## Common fields

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Object fields and sub fields](#object-fields-and-sub-fields)
  - [Using object fields](#using-object-fields)
  - [When and how to use sub fields](#when-and-how-to-use-sub-fields)
- [Counting results](#counting-results)
- [Ratios and percentages](#ratios-and-percentages)
- [Dates](#dates)
- [Filterable fields](#filterable-fields)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Object fields and sub fields

#### Using object fields

Sometimes you need more information to offer a field than just the field's name. For instance, a common occurrence is
when you have one field that represents the thing's name and another to represent it's relative position in a list.
Swydo allows you to define Objects and specify what should be displayed and what Swydo should use for sorting.

```javascript
const fields = [
    {
        id: 'campaign',
        name: 'Campaign',
        type: 'Object',
        sort: {
            path: 'rank',
        },
        display: {
            type: 'text',
            path: 'name',
        },
    },
];
```

When your connector returns a row with `campaign` as an object it'll use the "rank" property for sorting and display the
"name" property in tables and other visualisations.

#### When and how to use sub fields

Sub fields allow you to easily create multiple fields from an object. Let's assume your connector returns the following
row:

```javascript
const rows = [
    // ...
    {
        user: {
            id: 'abc123',
            firstName: 'Foo',
            lastName: 'Bar',
        },
    },
];
```

By defining sub fields you can allow the user to select parts from this object to include in the table without having
to pull the object apart in your connector.

```javascript
const fields = [
    {
        id: 'user',
        name: 'User',
        type: 'Object',
        isSelectable: false,
        subFields: [
            {
                id: 'id',
                name: 'User ID',
                type: 'String',
            },
            {
                id: 'firstName',
                name: 'User first name',
                type: 'String',
            },
            {
                id: 'id',
                name: 'User last name',
                type: 'String',
            },
        ],
    },
];
```

### Counting results

When your connector returns relatively raw data you might want to count the number of rows. For instance, when your
API returns a list of tasks one might want to count the number of tasks. This can be done by creating a field with a
default value.

```javascript
const fields = [
    {
        id: 'tasks',
        name: 'Tasks',
        type: 'Number',
        default: 1,
    },
];
```

In addition to the total number of tasks a user might want to know how many tasks are open. By defining two fields,
you can even allow the user to group the results by task open status.

```javascript
const fields = [
    {
        id: 'open',
        name: 'Open',
        type: 'Boolean',
        isDimension: true,
        isMetric: false,
    },
    {
        id: 'openTasks',
        name: 'Open tasks',
        type: 'Number',
        formula: 'open = 1',
        aggregate: 'sum',
    },
    {
        id: 'closedTasks',
        name: 'Closed tasks',
        type: 'Number',
        formula: 'open != 1',
        aggregate: 'sum',
    },
];
```

### Ratios and percentages

It's common to have ratio or percentage fields, but simply taking the average of these is not good enough. These
fields must be calculated from their root values to be accurate when the data is aggregated by Swydo.

```javascript
const fields = [
    {
        id: 'cost',
        name: 'Cost',
        type: 'Number',
        aggregate: 'sum',
    },
    {
        id: 'clicks',
        name: 'Clicks',
        type: 'Number',
        aggregate: 'sum',
    },
    {
        id: 'costPerClick',
        name: 'Cost per click',
        type: 'Number',
        formula: 'cost / clicks',
        display: {
            type: 'percentage',
        },
    },
];
```

### Dates

Dates are an important aspect of any custom integration that deals with time series. Dates are marked by setting the
`dateTime` property.

```javascript
const fields = [
    {
        id: 'day',
        name: 'Day',
        type: 'String',
        dateTime: {
            type: 'day',
        },
    },
    {
        id: 'week',
        name: 'Week',
        type: 'String',
        dateTime: {
            type: 'week',
        },
    },
    {
        id: 'month',
        name: 'Month',
        type: 'String',
        dateTime: {
            type: 'month',
        },
    },
];
```

Your connector will have to convert any dates you have to our supported formats. For more info see:

-   The [reference documentation](../reference/adapterConfiguration.md#fields).
-   The section on dates in [tips and tricks](tipsAndTricks.md#offering-date-fields).

### Filterable fields

Filters are defined on a per field basis. Swydo supports various methods of filtering, such as INCLUDES and CONTAINS.
You can choose which operators you support and the capabilities of these operators (case-sensitivity, for instance).
Your connector is responsible for filtering the results, preferably you send the filters to your API to minimize the
number of bytes sent back and forth.

A filter with a static list of options:

```javascript
const fields = [
    {
        id: 'deviceType',
        name: 'Device type',
        type: 'String',
        isDimension: true,
        filter: {
            options: [
                {
                    id: 'phone',
                    name: 'Phone',
                },
                {
                    id: 'tablet',
                    name: 'Tablet',
                },
                {
                    id: 'laptop',
                    name: 'Laptop',
                },
                {
                    id: 'desktop',
                    name: 'Desktop',
                },
            ],
            operators: [
                {
                    type: 'INCLUDES',
                    capabilities: {
                        caseSensitive: true,
                        caseInsensitive: false,
                        negate: false,
                    },
                },
            ],
        },
    },
];
```

A filter with a variable list of options requested from your custom integrations:

```javascript
const fields = [
    {
        id: 'campaignId',
        name: 'Campaign ID',
        type: 'String',
        isSelectable: false,
    },
    {
        id: 'campaign',
        name: 'Campaign',
        type: 'String',
        isDimension: true,
        filter: {
            optionsRequest: {
                idField: 'campaignId',
                nameField: 'campaign',
            },
            operators: [
                {
                    // Allows users to select from a list of campaigns.
                    type: 'INCLUDES',
                    capabilities: {
                        caseSensitive: true,
                        caseInsensitive: false,
                        negate: false,
                    },
                },
                {
                    // Allows users to type in a string that should be contained in the campaign name.
                    type: 'CONTAINS',
                    capabilities: {
                        caseSensitive: false,
                        caseInsensitive: true,
                        negate: false,
                    },
                },
            ],
        },
    },
];
```
