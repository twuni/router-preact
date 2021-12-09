import { useContext, useEffect, useState } from 'preact/hooks';

import { createContext } from 'preact';
import { html } from 'htm/preact';

export const browserRouter = Object.freeze({
  addEventListener,
  history,
  location
});

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

const state = {
  callbacks: []
};

const notifyCallbacks = () => {
  for (const callback of state.callbacks) {
    callback(browserRouter.location.pathname);
  }
};

(({ addEventListener }) => {
  addEventListener('popstate', () => {
    notifyCallbacks();
  });
})(browserRouter);

export const navigate = (path) => {
  browserRouter.history.pushState({}, '', path);
  notifyCallbacks();
};

export const onNavigate = (callback) => () => {
  state.callbacks.push(callback);

  return () => {
    const index = state.callbacks.indexOf(callback);

    if (index >= 0) {
      state.callbacks.splice(index, 1);
    }
  };
};

const butIsItReallyActiveTho = (router, path) => {
  if (typeof path === 'function') {
    try {
      path(router.location.pathname);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (router.location.pathname === path) {
    return true;
  }

  return false;
};

const getQuery = (router) => {
  const query = {};

  for (const [key, value] of new URL(router.location).searchParams) {
    query[key] = value;
  }

  return query;
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
  const [query, setQuery] = useState(getQuery(router));

  useEffect(onNavigate(() => {
    const willBeActive = butIsItReallyActiveTho(router, path);

    if (willBeActive !== isActive) {
      setActive(willBeActive);
    }

    const nextQuery = getQuery(router);

    if (JSON.stringify(nextQuery) !== JSON.stringify(query)) {
      setQuery(nextQuery);
    }
  }), [router, path, query]);

  if (isActive) {
    if (typeof render === 'function') {
      return render({
        params: typeof path === 'function' ? path(router.location.pathname) : {},
        path: router.location.pathname,
        query: getQuery(router)
      });
    }

    return children;
  }

  return null;
};
