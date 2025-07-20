/* config-overrides.js */
const { override, adjustStyleLoaders } = require('customize-cra');

module.exports = override(
  adjustStyleLoaders(({ use: [, css] }) => {
    if (css) {
      css.options.url = {
        filter: (url) => !url.startsWith('/'), // Ignore absolute paths (public folder)
      };
    }
  })
);