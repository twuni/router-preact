import { useContext, useEffect, useState } from 'preact/hooks';

import { createContext } from 'preact';
import { html } from 'htm/preact';

export const BrowserRouter = function BrowserRouter({ addEventListener, history, location }) {
  const callbacks = [];

  const notifyCallbacks = () => {
    for (const callback of callbacks) {
      callback(location.pathname);
    }
  };

  Object.assign(this, {
    match: (path) => {
      if (typeof path === 'string') {
        return location.pathname === path ? {} : undefined;
      }

      return path(location.pathname);
    },

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

      for (const [key, value] of new URL(location.href).searchParams) {
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

export const browserRouter = new BrowserRouter(window);

export const navigate = browserRouter.navigate;

export const onNavigate = browserRouter.onNavigate;

export const Router = createContext(browserRouter);

export const pattern = (templateParts, ...parameterNames) => function patternMatches(path) {
  const matchResult = new RegExp(`^${templateParts.join('([^/]+)')}$`, 'g').exec(path);

  if (!matchResult) {
    return undefined;
  }

  const parameterValues = matchResult.slice(1);

  return parameterNames.reduce((a, b, index) => {
    a[b] = parameterValues[index];
    return a;
  }, {});
};

export const Link = (props) => {
  const router = useContext(Router);
  const checkActive = () => Boolean(router.match(props.to));
  const [isActive, setActive] = useState(checkActive());

  useEffect(router.onNavigate(() => {
    setActive(checkActive());
  }), [checkActive()]);

  useEffect(() => {
    if (typeof props.onActiveChange === 'function') {
      props.onActiveChange(isActive);
    }
  }, [isActive, props.onActiveChange]);

  const onClick = (event) => {
    event.preventDefault();
    router.navigate(props.to);
  };

  const childProps = { ...props, href: props.to, onClick };

  delete childProps.to;

  return html`<a ...${childProps}/>`;
};

const shallowEquals = (a, b) => Boolean(a) === Boolean(b) && (!(a && b) || Object.keys(a).concat(Object.keys(b)).every((key) => a[key] === b[key]));

export const Route = ({ children, path = '/', render }) => {
  const router = useContext(Router);
  const [params, setParams] = useState(router.match(path));
  const [query, setQuery] = useState(router.query());

  useEffect(router.onNavigate(() => {
    const nextParams = router.match(path);

    if (!shallowEquals(params, nextParams)) {
      setParams(nextParams);
    }

    const nextQuery = router.query();

    if (!shallowEquals(query, nextQuery)) {
      setQuery(nextQuery);
    }
  }), [router, params, path, query]);

  if (params) {
    if (typeof render === 'function') {
      return render({ params, path: router.path(), query });
    }

    return children;
  }

  return null;
};
