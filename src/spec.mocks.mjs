import { fake, spy } from 'sinon';

export const mockLocation = (overrides = {}) => ({
  href: 'https://example.com/',
  pathname: '/',
  ...overrides
});

export const mockHistory = (location = mockLocation()) => ({
  pushState: spy((state, title, uri) => {
    location.pathname = uri.replace(/\?.*$/g, '');
    location.href = `${new URL(location.href).origin}${uri}`;
  })
});

export const mockWindow = (overrides = {}) => {
  const location = overrides.location || mockLocation();
  const history = overrides.history || mockHistory(location);
  const addEventListener = overrides.addEventListener || fake();
  return { ...overrides, addEventListener, history, location };
};
