# 📡 Router | Preact

![Code Coverage by Test Suite][coverage]
![License][license]
[![Bundle Size][footprint]][bundlephobia]
[![Current Release Version][version]][npm]
![Weekly Downloads][downloads]
[![Sponsors][sponsors]][become-a-sponsor]
[![Known Vulnerabilities][vulnerabilities-badge]][vulnerabilities]

A tiny router for Preact apps. It connects your app with the address bar. That's it.

## Features

 * Tiny footprint (less than 1KB gzipped!)
 * No dependencies (BYO Preact/HTM)
 * Comprehensive test suite (100% code coverage)
 * Suitable for production use
 * MIT license
 * Browser-native ESM friendly (designed specifically to require zero build tools to run)

## Installing

```bash
npm install --save router-preact
```

Yarn users, you know what to do instead.

## Usage

The following examples are written in JSX format, for brevity.

### Example: Basic Usage

```jsx
import { Link, Route } from 'router-preact';

const App = () => <>
  <Route path="/">
    <Link to="/next">Next page</Link>
  </Route>

  <Route path="/next">
    <Link to="/">First page</Link>
  </Route>
</>;
```

### Example: Parameterized Routes

```jsx
import { Link, Route, pattern } from 'router-preact';

const App = () => <>
  <Route path="/">
    <Link to="/pages/1">Go to page 1</Link>
  </Route>

  <Route path={pattern`/pages/${'pageNumber'}`} render={({ params: { pageNumber } }) => <>
    <p>Thank you for visiting page {pageNumber}.</p>
    <Link to={`/pages/${pageNumber + 1}`}>Go to next page</Link>
  </>}/>
</>;
```

### Example: Redirection

```jsx
import { Redirect, Route } from 'router-preact';

const App = () => <>
  <Route path="/">
    <Redirect to="/pages/1"/>
  </Route>
</>;
```

### Advanced Example: Intercepting the Router

If you really want to, you can swap out the router implementation by
using the `Router` *context* provided by this package. For example, if
you want to test a component that involves routing.

```jsx
import { Router } from 'router-preact';

const myRouter = {
  match(path) {
    // If the given path matches the currently active route, then return an object with key-value pairs for each path parameter
    // Otherwise, return `undefined`
  },
  navigate(path) {
    // Transition the currently active route to the given path and notify any callbacks registered via onNavigate() of the new path
  },
  onNavigate: (callback) => () => {
    // Register the callback so that it gets notified when the active route changes
    // Return a function that, when called, will deregister the callback
  },
  path() {
    // Return the path of the currently active route
  },
  query() {
    // Return the query parameters of the currently active route as an object
  }
};

const App = () => <Router.Provider value={myRouter}>
  ...
</>;
```

[coverage]: https://img.shields.io/badge/coverage-100%25-success
[license]: https://img.shields.io/npm/l/router-preact
[footprint]: https://img.shields.io/bundlephobia/minzip/router-preact
[version]: https://img.shields.io/npm/v/router-preact
[downloads]: https://img.shields.io/npm/dw/router-preact
[sponsors]: https://img.shields.io/github/sponsors/canterberry
[become-a-sponsor]: https://github.com/sponsors/canterberry
[npm]: https://npmjs.com/package/router-preact
[bundlephobia]: https://bundlephobia.com/package/router-preact
[vulnerabilities-badge]: https://snyk.io/test/npm/router-preact/badge.svg
[vulnerabilities]: https://snyk.io/test/npm/router-preact
