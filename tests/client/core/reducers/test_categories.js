import { ADDON_TYPE_EXTENSION, ADDON_TYPE_THEME } from 'core/constants';
import categories, { emptyCategoryList } from 'core/reducers/categories';


describe('categories reducer', () => {
  const initialState = {
    categories: emptyCategoryList(), error: false, loading: true,
  };

  it('defaults to an empty set of categories', () => {
    const state = categories(initialState, { type: 'unrelated' });
    assert.deepEqual(state.categories, {
      android: {}, firefox: {},
    });
  });

  it('defaults to not loading', () => {
    const { loading } = categories(undefined, { type: 'unrelated' });
    assert.equal(loading, false);
  });

  it('defaults to not error', () => {
    const { error } = categories(undefined, { type: 'unrelated' });
    assert.equal(error, false);
  });

  describe('CATEGORIES_GET', () => {
    it('sets loading', () => {
      const state = categories(initialState,
        { type: 'CATEGORIES_GET', payload: { loading: true } });
      assert.deepEqual(state.categories, {
        android: {}, firefox: {},
      });
      assert.equal(state.error, false);
      assert.equal(state.loading, true);
    });
  });

  describe('CATEGORIES_LOAD', () => {
    let state;

    before(() => {
      const result = [
        {
          application: 'android',
          name: 'Alerts & Update',
          slug: 'alert-update',
          type: 'extension',
        },
        {
          application: 'android',
          name: 'Games',
          slug: 'Games',
          type: 'extension',
        },
        {
          application: 'android',
          name: 'Blogging',
          slug: 'blogging',
          type: 'extension',
        },
        {
          application: 'android',
          name: 'Naturé',
          slug: 'naturé',
          type: ADDON_TYPE_THEME,
        },
        {
          application: 'android',
          name: 'Painting',
          slug: 'painting',
          type: ADDON_TYPE_THEME,
        },
        {
          application: 'firefox',
          name: 'Anime',
          slug: 'anime',
          type: ADDON_TYPE_THEME,
        },
        {
          application: 'firefox',
          name: 'Alerts & Update',
          slug: 'alert-update',
          type: 'extension',
        },
        {
          application: 'firefox',
          name: 'Security',
          slug: 'security',
          type: 'extension',
        },
        {
          application: 'netscape',
          name: 'I should not appear',
          slug: 'i-should-not-appear',
          type: 'extension',
        },
      ];
      state = categories(initialState, {
        type: 'CATEGORIES_LOAD',
        payload: { result },
      });
    });

    it('sets the categories', () => {
      assert.deepEqual(state.categories, {
        firefox: {
          [ADDON_TYPE_EXTENSION]: {
            'alert-update': {
              application: 'firefox',
              name: 'Alerts & Update',
              slug: 'alert-update',
              type: 'extension',
            },
            security: {
              application: 'firefox',
              name: 'Security',
              slug: 'security',
              type: 'extension',
            },
          },
          [ADDON_TYPE_THEME]: {
            anime: {
              application: 'firefox',
              name: 'Anime',
              slug: 'anime',
              type: ADDON_TYPE_THEME,
            },
          },
        },
        android: {
          [ADDON_TYPE_EXTENSION]: {
            'alert-update': {
              application: 'android',
              name: 'Alerts & Update',
              slug: 'alert-update',
              type: 'extension',
            },
            blogging: {
              application: 'android',
              name: 'Blogging',
              slug: 'blogging',
              type: 'extension',
            },
            Games: {
              application: 'android',
              name: 'Games',
              slug: 'Games',
              type: 'extension',
            },
          },
          [ADDON_TYPE_THEME]: {
            naturé: {
              application: 'android',
              name: 'Naturé',
              slug: 'naturé',
              type: ADDON_TYPE_THEME,
            },
            painting: {
              application: 'android',
              name: 'Painting',
              slug: 'painting',
              type: ADDON_TYPE_THEME,
            },
          },
        },
      });
    });

    it('sets loading', () => {
      const { loading } = state;
      assert.strictEqual(loading, false);
    });

    it('sets no error', () => {
      const { error } = state;
      assert.deepEqual(error, false);
    });
  });

  describe('CATEGORIES_FAILED', () => {
    it('sets error to be true', () => {
      const error = true;
      const loading = false;

      const state = categories(initialState, {
        type: 'CATEGORIES_FAILED', payload: { error, loading },
      });
      assert.deepEqual(state, {
        categories: emptyCategoryList(), error, loading,
      });
    });
  });
});
