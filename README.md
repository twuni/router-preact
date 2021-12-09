# 📡 Router | Preact

A tiny router for Preact apps. It connects your app with the address bar. That's it.

## Features

 * Tiny footprint, minimal dependencies. Less than 2KB, + Preact and HTM.

## Installing

```bash
npm install --save router-preact
```

Yarn users, you know what to do instead.

## Usage

```javascript
import { Link, Route, pattern } from 'router-preact';

import { html } from 'htm/preact';
import { render } from 'preact';

render(html`
  <${Route} path="/" render=${() => html`
    <p>
      <${Link} to="/houses/mine">Go to my house<//>
    <//>
    <p>
      <${Link} to="/houses/yours">Go to your house<//>
    <//>
  `}/>
  <${Route} path=${pattern`/houses/${'whose'}`} render=${({ params: { whose } }) => html`
    <p>This house is ${whose}.<//>
    <p>
      <${Link} to=${`/houses/${whose === 'mine' ? 'yours' : 'mine'}`}>Go to the other house<//>
    <//>
  `}/>
`, document.body);
```
