const { buildHelpComponentsV2, HELP_CATEGORIES } = require('./componentsV2');

module.exports = {
  CATEGORIES: HELP_CATEGORIES,
  buildHelpContainer: buildHelpComponentsV2
};
