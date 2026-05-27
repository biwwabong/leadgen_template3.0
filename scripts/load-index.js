/**
 * Loads index page components in order (vanilla JS, no frameworks).
 * Requires a local web server — fetch() does not work with file:// URLs.
 */
(function () {
  var mount = document.getElementById('page-content');
  if (!mount) return;

  var components = [
    '../../components/global/header.html',
    '../../components/index/hero.html',
    '../../components/index/trust_strip.html',
    '../../components/index/home-problem-solution.html',
    '../../components/index/service_repairs.html',
    '../../components/index/service_installations.html',
    '../../components/index/home-gallery.html',
    '../../components/index/home-process.html',
    '../../components/index/localised_proof.html',
    '../../components/index/faq.html',
    '../../components/index/home-cta.html',
    '../../components/index/home_area_directory.html',
    '../../components/global/footer.html'
  ];

  function loadComponents() {
    var chain = Promise.resolve();

    components.forEach(function (url) {
      chain = chain.then(function () {
        return fetch(url, { cache: 'no-store' }).then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to load ' + url + ' (' + response.status + ')');
          }
          return response.text();
        }).then(function (html) {
          mount.insertAdjacentHTML('beforeend', html);
        });
      });
    });

    return chain.then(function () {
      var applyConfig = window.SiteConfigLoader && window.SiteConfigLoader.apply
        ? window.SiteConfigLoader.apply(mount)
        : Promise.resolve();

      return applyConfig.then(function () {
        mount.removeAttribute('aria-busy');
        var loading = mount.querySelector('.page-loading');
        if (loading) loading.remove();
      });
    });
  }

  loadComponents().catch(function (err) {
    mount.removeAttribute('aria-busy');
    console.error(err);
    mount.innerHTML =
      '<p class="page-load-error">Page content could not be loaded. ' +
      'Open this site through a local web server (for example Live Server in VS Code), not as a file:// link.</p>';
  });
})();
