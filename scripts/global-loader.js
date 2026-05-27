/**
 * Global config loader + placeholder replacer.
 * Loads content/config.json once and injects known tokens into HTML placeholders.
 */
(function () {
  var CONFIG_PATH = '../../content/config.json';
  var configPromise = null;

  function readPath(obj, path) {
    return path.split('.').reduce(function (acc, part) {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) return acc[part];
      return undefined;
    }, obj);
  }

  function buildTokens(config) {
    var tokens = {};

    tokens.COMPANY_NAME = readPath(config, 'company.name');
    tokens.CITY = readPath(config, 'location.city');
    tokens.COVERAGE_SUFFIX = readPath(config, 'location.coverageSuffix');

    tokens.PHONE_NUMBER = readPath(config, 'contact.phoneNumber');
    tokens.PHONE_DISPLAY = readPath(config, 'contact.phoneDisplay') || tokens.PHONE_NUMBER;
    tokens.EMAIL_ADDRESS = readPath(config, 'contact.email');

    tokens.HOURS_DESCRIPTION = readPath(config, 'contact.hoursDescription');
    tokens.REVIEW_COUNT = readPath(config, 'social.reviewCount');

    return tokens;
  }

  function replacePlaceholders(text, tokens) {
    return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, function (_, key) {
      return tokens[key] !== undefined && tokens[key] !== null ? String(tokens[key]) : '{{' + key + '}}';
    });
  }

  function replaceInNodeTree(root, tokens) {
    if (!root) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(function (textNode) {
      if (!textNode.nodeValue || textNode.nodeValue.indexOf('{{') === -1) return;
      textNode.nodeValue = replacePlaceholders(textNode.nodeValue, tokens);
    });

    var elements = root.querySelectorAll('*');
    Array.prototype.forEach.call(elements, function (el) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      Array.prototype.forEach.call(el.attributes, function (attr) {
        if (attr.value && attr.value.indexOf('{{') !== -1) {
          el.setAttribute(attr.name, replacePlaceholders(attr.value, tokens));
        }
      });
    });
  }

  function getConfig() {
    if (!configPromise) {
      configPromise = fetch(CONFIG_PATH, { cache: 'no-store' }).then(function (response) {
        if (!response.ok) throw new Error('Failed to load config.json (' + response.status + ')');
        return response.json();
      });
    }
    return configPromise;
  }

  function apply(root) {
    return getConfig().then(function (config) {
      var tokens = buildTokens(config);
      replaceInNodeTree(root || document, tokens);
      window.__SITE_CONFIG__ = config;
      window.__SITE_TOKENS__ = tokens;
    });
  }

  window.SiteConfigLoader = {
    apply: apply,
    getConfig: getConfig
  };
})();
