import url from 'url';

import config from 'config';

import { loadEntities } from 'core/actions';
import {
  categoriesGet,
  categoriesLoad,
  categoriesFail,
} from 'core/actions/categories';
import { categories, fetchAddon } from 'core/api';
import {
  API_ADDON_TYPES_MAPPING,
  VISIBLE_ADDON_TYPES_MAPPING,
} from 'core/constants';
import log from 'core/logger';
import purify from 'core/purify';


export function gettext(str) {
  return str;
}

export function ngettext(singular, plural, n) {
  if (n === 1) {
    return singular;
  }
  return plural;
}

export function getClientConfig(_config) {
  const clientConfig = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key of _config.get('clientConfigKeys')) {
    clientConfig[key] = _config.get(key);
  }
  return clientConfig;
}

export function convertBoolean(value) {
  switch (value) {
    case true:
    case 1:
    case '1':
    case 'true':
      return true;
    default:
      return false;
  }
}

/*
 * This is a very simplistic check of the user-agent string in order to redirect to
 * the right set of AMO data.
 *
 * More complete UA detection for compatibility will take place elsewhere.
 *
 */
export function getClientApp(userAgentString) {
  // We are going to return android as the application if it's *any* android browser.
  // whereas the previous behaviour was to only return 'android' for FF Android.
  // This way we are showing more relevant content, and if we prompt for the user to download
  // firefox we can prompt them to download Firefox for Android.
  if (/android/i.test(userAgentString)) {
    return 'android';
  }
  return 'firefox';
}

export function isValidClientApp(value, { _config = config } = {}) {
  return _config.get('validClientApplications').includes(value);
}

export function sanitizeHTML(text, allowTags = []) {
  // TODO: Accept tags to allow and run through dom-purify.
  return {
    __html: purify.sanitize(text, { ALLOWED_TAGS: allowTags }),
  };
}

// Convert new lines to HTML breaks.
export function nl2br(text) {
  return (text || '').replace(/(?:\r\n|\r|\n)/g, '<br />');
}

export function findAddon(state, slug) {
  return state.addons[slug];
}

// asyncConnect() helper for loading an add-on by slug.
//
// This accepts component properties and returns a promise
// that resolves when the requested add-on has been dispatched.
// If the add-on has already been fetched, the add-on value is returned.
//
export function loadAddonIfNeeded(
  { store: { dispatch, getState }, params: { slug } }
) {
  const state = getState();
  const addon = findAddon(state, slug);
  if (addon) {
    log.info(`Found addon ${addon.id} in state`);
    return addon;
  }
  log.info(`Fetching addon ${slug} from API`);
  return fetchAddon({ slug, api: state.api })
    .then(({ entities }) => dispatch(loadEntities(entities)));
}

// asyncConnect() helper for loading categories for browsing and displaying
// info.
export function getCategories({ dispatch, api }) {
  dispatch(categoriesGet());
  return categories({ api })
    .then((response) => dispatch(categoriesLoad(response)))
    .catch(() => dispatch(categoriesFail()));
}

export function isLoaded({ state }) {
  return state.categories.length && !state.loading;
}

export function loadCategoriesIfNeeded({ store: { dispatch, getState } }) {
  const state = getState();
  if (!isLoaded({ state: state.categories })) {
    return getCategories({ dispatch, api: state.api });
  }
  return true;
}

export function isAllowedOrigin(urlString, { allowedOrigins = [config.get('amoCDN')] } = {}) {
  let parsedURL;
  try {
    parsedURL = url.parse(urlString);
  } catch (e) {
    log.error(`invalid urlString provided to isAllowedOrigin: ${urlString}`);
    return false;
  }
  return allowedOrigins.includes(`${parsedURL.protocol}//${parsedURL.host}`);
}

export function addQueryParams(urlString, queryParams = {}) {
  const urlObj = url.parse(urlString, true);
  // Clear search, since query object will only be used if search
  // property doesn't exist.
  urlObj.search = undefined;
  urlObj.query = { ...urlObj.query, ...queryParams };
  return url.format(urlObj);
}

export function browserBase64Decode(str) {
  // This is from MDN, formatting left as is so we can compare it to the source if MDN updates.
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  /* global atob */
  // eslint-disable-next-line prefer-arrow-callback, func-names
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    // eslint-disable-next-line prefer-template
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function apiAddonType(addonType) {
  if (!Object.prototype.hasOwnProperty.call(
    API_ADDON_TYPES_MAPPING, addonType
  )) {
    throw new Error(`"${addonType}" not found in API_ADDON_TYPES_MAPPING`);
  }
  return API_ADDON_TYPES_MAPPING[addonType];
}

export function visibleAddonType(addonType) {
  if (!Object.prototype.hasOwnProperty.call(
    VISIBLE_ADDON_TYPES_MAPPING, addonType
  )) {
    throw new Error(`"${addonType}" not found in VISIBLE_ADDON_TYPES_MAPPING`);
  }
  return VISIBLE_ADDON_TYPES_MAPPING[addonType];
}
