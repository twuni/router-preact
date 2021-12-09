import { useContext, useEffect, useState } from 'preact/hooks';

import { createContext } from 'preact';
import { html } from 'htm/preact';

export const BrowserRouter = function BrowserRouter() {
  const callbacks = [];

  const notifyCallbacks = () => {
    for (const callback of callbacks) {
      callback(location.pathname);
    }
  };

  Object.assign(this, {
    navigate(path) {
      history.pushState({}, '', path);
      notifyCallbacks();
    },
    onNavigate: (callback) => () => {
      callbacks.push(callback);

      return () => {
        const index = callbacks.indexOf(callback);

        if (index >= 0) {
          callbacks.splice(index, 1);
        }
      };
    },
    path: () => location.pathname,
    query() {
      const query = {};

      for (const [key, value] of new URL(location).searchParams) {
        query[key] = value;
      }

      return query;
    }
  });

  addEventListener('popstate', () => {
    notifyCallbacks();
  });

  return this;
};

export const browserRouter = new BrowserRouter();

export const navigate = browserRouter.navigate;

export const onNavigate = browserRouter.onNavigate;

export const Router = createContext(browserRouter);

export const pattern = (templateParts, ...parameterNames) => (path) => {
  const readable = templateParts.map((it, index) => `${it}${parameterNames[index] ? `{${parameterNames[index]}}` : ''}`).join('');
  const parameters = {};
  let remaining = path;
  let offset = 0;

  while (offset < templateParts.length) {
    const part = templateParts[offset];
    const name = parameterNames[offset];

    offset += 1;

    if (remaining && !part) {
      throw new Error(`${path} does not match pattern: ${readable}`);
    }

    if (!remaining.startsWith(part)) {
      throw new Error(`${path} does not match pattern: ${readable}`);
    }

    remaining = remaining.substring(part.length);

    if (name) {
      const nextSlash = remaining.indexOf('/');

      if (nextSlash < 0) {
        const nextDot = remaining.indexOf('.');
        if (nextDot < 0) {
          parameters[name] = remaining;
          remaining = '';
        } else {
          parameters[name] = remaining.substring(0, nextDot);
          remaining = remaining.substring(nextDot);
        }
      } else {
        parameters[name] = remaining.substring(0, nextSlash);
        remaining = remaining.substring(nextSlash);
      }
    }
  }

  return parameters;
};

const butIsItReallyActiveTho = (router, path) => {
  if (typeof path === 'function') {
    try {
      path(router.path());
      return true;
    } catch (error) {
      return false;
    }
  }

  if (router.path() === path) {
    return true;
  }

  return false;
};

export const Link = (props) => {
  const router = useContext(Router);
  const [isActive, setActive] = useState(butIsItReallyActiveTho(router, props.to));

  useEffect(onNavigate(() => {
    const willBeActive = butIsItReallyActiveTho(router, props.to);

    if (willBeActive !== isActive) {
      setActive(willBeActive);
    }
  }), [router, props.to]);

  const onClick = (event) => {
    event.preventDefault();
    navigate(props.to);
  };

  const childProps = { ...props };

  delete childProps.to;

  return html`<a ...${childProps} href=${props.to} onClick=${onClick}/>`;
};

export const Route = ({ children, path = '/', render }) => {
  const router = useContext(Router);
  const [isActive, setActive] = useState(butIsItReallyActiveTho(router, path));
  const [query, setQuery] = useState(router.query());

  useEffect(onNavigate(() => {
    const willBeActive = butIsItReallyActiveTho(router, path);

    if (willBeActive !== isActive) {
      setActive(willBeActive);
    }

    const nextQuery = router.query();

    if (JSON.stringify(nextQuery) !== JSON.stringify(query)) {
      setQuery(nextQuery);
    }
  }), [router, path, query]);

  if (isActive) {
    if (typeof render === 'function') {
      return render({
        params: typeof path === 'function' ? path(router.path()) : {},
        path: router.path(),
        query: router.query()
      });
    }

    return children;
  }

  return null;
};
