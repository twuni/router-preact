import { BrowserRouter, Router } from './index.mjs';

import { html } from 'htm/preact';
import { mockWindow } from './spec.mocks.mjs';
import { render } from 'preact';

const DEFAULT_DELAY = 100;

export const delay = (duration = DEFAULT_DELAY) => new Promise((resolve) => setTimeout(resolve, duration));

export const waitFor = (condition) => new Promise((resolve) => {
  const state = {};

  const cancel = () => {
    if (state.interval) {
      clearInterval(state.interval);
      delete state.interval;
    }
  };

  state.interval = setInterval(() => {
    if (condition()) {
      cancel();
      resolve();
    }
  }, 1);
});

export const mount = (component, overrides = {}) => {
  const window = overrides.window || mockWindow();
  const router = overrides.router || new BrowserRouter(window);
  const container = document.createElement('div');

  document.body.appendChild(container);

  render(html`<${Router.Provider} value=${router}>${component}<//>`, container);

  return { container, router, window };
};
