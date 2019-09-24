## Scopes

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Introduction](#introduction)
  - [Definition](#definition)
  - [Specification](#specification)
  - [Examples](#examples)
  - [Workflow](#workflow)
- [Implementation](#implementation)
  - [Configuration](#configuration)
  - [Scopes endpoint](#scopes-endpoint)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Introduction

#### Definition

The definition of a scope is:

> A filter containing one value that is always required by the API, so the API only returns data relevant for that filter, thus scoping the request.

#### Specification

A scope has the following requirements:

-   is a required filter by the API
-   only one filter value can be used at the same time
-   data returned by the API is only suitable for the applied filter

#### Examples

Some examples of scopes are:

-   clients
-   sub accounts
-   users
-   profiles
-   domains

#### Workflow

Users of the custom integration are required to select a scope before they can take any other action.
All subsequent actions will be limited to this scope, unless they select a new one.

_Note: A user is always required to select a scope, even when the custom integration does not support one(defaults to integration name)._

### Implementation

#### Configuration

Scopes are part of the adapter definition and can have one or more parts.
It is required to specify where the values are requested from, the `endpoint` and the `fields`.
The `key` property specifies as what key the `id` value will be returned as in the connector options.

```javascript
const scope = {
    parts: [
        {
            key: 'client_id',
            optionsRequest: {
                endpointId: 'example-adapter:scopes',
                idField: 'clientId',
                nameField: 'clientName',
            },
        },
    ],
};
```

The scope object will be available in the connector options.

```javascript
async function connector(options) {
    console.log(options.scope);
    ...
```

The scope object int his case will contain:

```javascript
{
    client_id: 'ff26bb4e-6cb8-46eb-8cf9-919f3c88ac25',
}
```

For more info see:

-   The [adapter reference documentation](../reference/adapterConfiguration.md#adapter).
-   The [connector reference documentation](../reference/adapterConfiguration.md#connector).

#### Scopes endpoint

In order to retrieve the values that can be selected as a scope they must be request-able with an endpoint.
It is recommended to create a separate scope endpoint, these usually differ from normal data endpoints + it separates scope values from data values.

```javascript
const endpoint = {
    id: 'scopes',
    name: 'Scopes',
    isSelectable: false, // Scope endpoints are not supposed to be selectable by the user to retrieve data from.
    dateRange: {
        enabled: false,
        required: false,
    },
    fields: [
        {
            id: 'clientId',
            name: 'Client Id',
            type: 'String',
            isDimension: true,
            isMetric: true,
        },
        {
            id: 'clientName',
            name: 'Client name',
            type: 'String',
            isDimension: true,
            isMetric: true,
        },
    ],
};
```
