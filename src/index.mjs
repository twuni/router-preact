import { useEffect, useState } from 'preact/hooks';

import { html } from 'htm/preact';

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
    callback(location.pathname);
  }
};

addEventListener('popstate', () => {
  notifyCallbacks();
});

export const navigate = (path) => {
  history.pushState({}, '', path);
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

const butIsItReallyActiveTho = (path) => {
  if (typeof path === 'function') {
    try {
      path(location.pathname);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (location.pathname === path) {
    return true;
  }

  return false;
};

const getQuery = () => {
  const query = {};

  for (const [key, value] of new URL(location).searchParams) {
    query[key] = value;
  }

  return query;
};

export const Link = (props) => {
  const [isActive, setActive] = useState(butIsItReallyActiveTho(props.to));

  useEffect(onNavigate(() => {
    const willBeActive = butIsItReallyActiveTho(props.to);

    if (willBeActive !== isActive) {
      setActive(willBeActive);
    }
  }), [props.to]);

  const onClick = (event) => {
    event.preventDefault();
    navigate(props.to);
  };

  const childProps = { ...props };

  delete childProps.to;

  return html`<a ...${childProps} href=${props.to} onClick=${onClick}/>`;
};

export const Route = ({ children, path = '/', render }) => {
  const [isActive, setActive] = useState(butIsItReallyActiveTho(path));
  const [query, setQuery] = useState(getQuery());

  useEffect(onNavigate(() => {
    const willBeActive = butIsItReallyActiveTho(path);

    if (willBeActive !== isActive) {
      setActive(willBeActive);
    }

    const nextQuery = getQuery();

    if (JSON.stringify(nextQuery) !== JSON.stringify(query)) {
      setQuery(nextQuery);
    }
  }), [path, query]);

  if (isActive) {
    if (typeof render === 'function') {
      return render({
        params: typeof path === 'function' ? path(location.pathname) : {},
        path: location.pathname,
        query: getQuery()
      });
    }

    return children;
  }

  return null;
};
