import { JSDOM } from 'jsdom';

import chai from 'chai';
import { mockWindow } from './spec.mocks.mjs';
import sinonChai from 'sinon-chai';

const dom = new JSDOM('<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body></body></html>', {
  url: 'https://example.com/test.html'
});
const window = mockWindow(dom.window);

// Intentionally set some globals here to inject browser-specific APIs referenced by this package's default (convenience) implementation
// eslint-disable-next-line no-undef
Object.assign(global, { document: window.document, window });

chai.use(sinonChai);
