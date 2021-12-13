/* eslint-disable max-lines */

import { BrowserRouter, Link, Route, Router, browserRouter, navigate, onNavigate, pattern } from './index.mjs';
import { delay, mount, waitFor } from './spec.utils.mjs';
import { describe, it } from 'mocha';
import { mockLocation, mockWindow } from './spec.mocks.mjs';

import { expect } from 'chai';
import { fake } from 'sinon';
import { html } from 'htm/preact';

describe('BrowserRouter', () => {
  it('is a function', () => {
    expect(BrowserRouter).to.be.a('function');
  });

  describe('when constructed', () => {
    /* eslint-disable no-new */

    it('calls the given addEventListener()', () => {
      const window = mockWindow();
      new BrowserRouter(window);
      expect(window.addEventListener).to.have.been.calledOnce;
    });

    it('triggers the callback when hitting the Back button (popping history state)', () => {
      const window = mockWindow();
      const router = new BrowserRouter(window);
      const callback = fake();
      const unsubscribe = router.onNavigate(callback)();
      window.addEventListener.getCall(0).args[1]();
      unsubscribe();
      expect(callback).to.have.been.calledOnce;
    });

    /* eslint-enable no-new */
  });
});

describe('<Link>', () => {
  it('is a function', () => {
    expect(Link).to.be.a('function');
  });

  describe('prop: children', () => {
    it('renders', () => {
      const { container } = mount(html`<${Link} to="/place">Children<//>`);
      expect(container.textContent).to.equal('Children');
    });
  });

  describe('prop: onActiveChange()', () => {
    describe('when link is inactive', () => {
      it('is initialized to false', async () => {
        const onActiveChange = fake();
        const window = mockWindow({ location: mockLocation({ pathname: '/the-shire' }) });
        mount(html`<${Link} onActiveChange=${onActiveChange} to="/mordor">Children<//>`, { window });
        await waitFor(() => onActiveChange.callCount > 0);
        expect(onActiveChange).to.have.been.calledWith(false);
      });

      describe('when link transitions to active', () => {
        it('is called again with true', async () => {
          const onActiveChange = fake();
          const window = mockWindow({ location: mockLocation({ pathname: '/the-shire' }) });
          const { router } = mount(html`<${Link} onActiveChange=${onActiveChange} to="/mordor">Children<//>`, { window });
          await waitFor(() => onActiveChange.callCount > 0);
          router.navigate('/mordor');
          await waitFor(() => onActiveChange.callCount > 1);
          expect(onActiveChange).to.have.been.calledWith(true);
        });
      });
    });

    describe('when link is active', () => {
      it('is initialized to true', async () => {
        const onActiveChange = fake();
        const window = mockWindow({ location: mockLocation({ pathname: '/the-shire' }) });
        mount(html`<${Link} onActiveChange=${onActiveChange} to="/the-shire">Children<//>`, { window });
        await waitFor(() => onActiveChange.callCount > 0);
        expect(onActiveChange).to.have.been.calledWith(true);
      });

      describe('when link transitions to inactive', () => {
        it('is called again with false', async () => {
          const onActiveChange = fake();
          const window = mockWindow({ location: mockLocation({ pathname: '/the-shire' }) });
          const { router } = mount(html`<${Link} onActiveChange=${onActiveChange} to="/the-shire">Children<//>`, { window });
          await waitFor(() => onActiveChange.callCount > 0);
          router.navigate('/mordor');
          await waitFor(() => onActiveChange.callCount > 1);
          expect(onActiveChange).to.have.been.calledWith(false);
        });
      });
    });
  });

  describe('when clicked', () => {
    it('triggers a router navigation', () => {
      const router = { ...new BrowserRouter(mockWindow()), navigate: fake() };
      const { container } = mount(html`<${Link} to="/the-shire">Go home, Sam.<//>`, { router });
      container.querySelector('a').click();
      expect(router.navigate).to.have.been.calledWith('/the-shire');
    });
  });
});

describe('<Route>', () => {
  it('is a function', () => {
    expect(Route).to.be.a('function');
  });

  describe('when a query parameter changes', () => {
    it('provides the updated query parameters to the render() prop', async () => {
      const window = mockWindow();
      const { container, router } = mount(html`<${Route} path=${window.location.pathname} render=${({ query }) => html`The ringbearer is ${query.bearer || 'no one'}`}/>`, { window });
      await delay();
      router.navigate(`${window.location.pathname}?bearer=Frodo`);
      await waitFor(() => container.textContent === 'The ringbearer is Frodo');
      expect(container.textContent).to.equal('The ringbearer is Frodo');
    });
  });

  describe('when the path is currently active', () => {
    it('renders its children', () => {
      const { container } = mount(html`<${Route} path=${window.location.pathname}>Abacchio<//>`, { window });
      expect(container.textContent).to.equal('Abacchio');
    });

    describe('when navigating somewhere else', () => {
      it('does not render its children', async () => {
        const window = mockWindow();
        const { container, router } = mount(html`<${Route} path=${window.location.pathname}>Good stuff.<//>`, { window });
        await delay();
        router.navigate('/badlands');
        await waitFor(() => container.textContent !== 'Good stuff.');
        expect(container.textContent).not.to.equal('Good stuff.');
      });
    });
  });

  describe('when the path is NOT currently active', () => {
    it('does not render its children', () => {
      const { container } = mount(html`<${Route} path="/somewhere-else">Children<//>`, { window });
      expect(container.textContent).not.to.equal('Children');
    });

    describe('when navigating into an active state', () => {
      it('renders its children', async () => {
        const window = mockWindow();
        const { container, router } = mount(html`<${Route} path="/badlands">Entered the Badlands.<//>`, { window });
        await delay();
        router.navigate('/badlands');
        await waitFor(() => container.textContent === 'Entered the Badlands.');
        expect(container.textContent).to.equal('Entered the Badlands.');
      });
    });
  });
});

describe('<Router.Provider>', () => {
  it('is a function', () => {
    expect(Router.Provider).to.be.a('function');
  });
});

describe('browserRouter', () => {
  describe('#match()', () => {
    it('is a function', () => {
      expect(browserRouter.match).to.be.a('function');
    });

    describe('when given a value that matches the current path', () => {
      it('is an object', () => {
        expect(browserRouter.match(window.location.pathname)).to.be.an('object');
      });
    });

    describe('when given a value that matches the current path', () => {
      it('is undefined', () => {
        expect(browserRouter.match('/not-a-match')).to.be.undefined;
      });
    });

    describe('when given a function', () => {
      it('calls the function', () => {
        const path = fake();
        browserRouter.match(path);
        expect(path).to.have.been.calledOnce;
      });
    });
  });

  describe('#navigate()', () => {
    it('is a function', () => {
      expect(browserRouter.navigate).to.be.a('function');
    });

    describe('when called', () => {
      it('calls #pushState() on the underlying History object', () => {
        const window = mockWindow();
        const router = new BrowserRouter(window);

        router.navigate('/place');

        expect(window.history.pushState).to.have.been.calledOnce;
      });
    });
  });

  describe('#onNavigate()', () => {
    it('is a function', () => {
      expect(browserRouter.onNavigate).to.be.a('function');
    });

    describe('when called', () => {
      it('returns a function', () => {
        const callback = fake();
        expect(browserRouter.onNavigate(callback)).to.be.a('function');
      });

      describe('when called', () => {
        it('returns a function', () => {
          const callback = fake();
          expect(browserRouter.onNavigate(callback)()).to.be.a('function');
        });

        it('triggers the callback when navigating', () => {
          const callback = fake();
          const unsubscribe = browserRouter.onNavigate(callback)();
          browserRouter.navigate('/place');
          unsubscribe();
          expect(callback).to.have.been.calledOnce;
        });

        describe('when called', () => {
          it('no longer triggers the callback when navigating', () => {
            const callback = fake();
            browserRouter.onNavigate(callback)()();
            browserRouter.navigate('/place');
            expect(callback).not.to.have.been.called;
          });
        });
      });
    });
  });

  describe('#path()', () => {
    it('is a function', () => {
      expect(browserRouter.path).to.be.a('function');
    });

    describe('when called', () => {
      it('returns the #pathname of the underlying Location object', () => {
        const window = mockWindow();
        const router = new BrowserRouter(window);
        expect(router.path()).to.equal(window.location.pathname);
      });
    });
  });

  describe('#query()', () => {
    it('is a function', () => {
      expect(browserRouter.query).to.be.a('function');
    });

    it('returns the query parameters as an object', () => {
      const window = mockWindow({ location: mockLocation({ href: 'https://example.com/?foo=bar' }) });
      const router = new BrowserRouter(window);
      expect(router.query()).to.deep.equal({ foo: 'bar' });
    });
  });
});

describe('navigate()', () => {
  it('aliases browserRouter.navigate', () => {
    expect(navigate).to.equal(browserRouter.navigate);
  });
});

describe('onNavigate()', () => {
  it('aliases browserRouter.onNavigate', () => {
    expect(onNavigate).to.equal(browserRouter.onNavigate);
  });
});

describe('pattern', () => {
  it('is a function', () => {
    expect(pattern).to.be.a('function');
  });

  describe('when used as a tagged template', () => {
    describe('its return value', () => {
      it('is a function', () => {
        expect(pattern`/widgets`).to.be.a('function');
      });

      describe('when called', () => {
        describe('with a matching path', () => {
          it('returns an object', () => {
            expect(pattern`/widgets`('/widgets')).to.be.an('object');
          });

          it('maps named parameters to their values', () => {
            expect(pattern`/widgets/${'id'}`('/widgets/purple')).to.have.property('id', 'purple');
          });
        });

        describe('with a non-matching path', () => {
          it('returns undefined', () => {
            expect(pattern`/widgets`('/something-else')).to.be.undefined;
          });
        });

        describe('with a path having too many path elements', () => {
          it('returns undefined', () => {
            expect(pattern`/widgets/${'id'}`('/widgets/123/thing')).to.be.undefined;
          });
        });
      });
    });
  });
});
