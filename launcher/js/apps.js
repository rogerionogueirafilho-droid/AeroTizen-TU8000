// Installed apps: discovery, launching, the app store, and the Fireplace tile.
(function (A) {
  'use strict';

  var cfg = A.config, tz = A.tizen;
  var apps = A.apps = { all: [], realIds: [] };

  function isRealApp(a) {
    // TU8000 marks many firmware daemons as show=true. Include user packages of
    // any length, but not Samsung/Tizen infrastructure or app background workers.
    var userPackage = /^[A-Za-z0-9]{8,}$/.test(a.packageId || '');
    return a.name && a.show !== false && !cfg.HIDDEN_APPS.test(a.id) && !cfg.HIDDEN_APPS.test(a.name)
      && !/service|worker|launcher|tvdevicecare/i.test(a.name)
      && (userPackage || Object.prototype.hasOwnProperty.call(cfg.PRELOADED_APPS, a.id));
  }

  apps.load = function (done) {
    if (!tz || !tz.application) {  // desktop browser preview
      apps.all = ['YouTube', 'Netflix', 'Stremio', 'Prime Video', 'Spotify - Music and Podcasts', 'TizenBrew', 'Disney+', 'Plex']
        .map(function (name, i) { return { id: 'demo' + i, name: name, icon: '' }; });
      return done();
    }
    // Paint immediately. Native discovery must never hold the home screen hostage.
    apps.all = apps.all.length ? apps.all : (window.INSTALLED_APPS || []).slice();
    apps.realIds = apps.all.map(function (a) { return a.storeId || cfg.PRELOADED_APPS[a.id] || a.id; });
    done();
    try { tz.application.getAppsInfo(function (list) {
      var known = window.INSTALLED_APPS || [], byId = {};
      list.forEach(function (a) {
        var installed = known.some(function (k) { return k.id === a.id; });
        if (isRealApp(a) || installed) {
          byId[a.id] = { id: a.id, name: a.name, icon: a.iconPath || '' };
        }
      });
      // Some TU8000 preinstalled apps are not exposed by getAppsInfo at all.
      known.forEach(function (a) {
        if (!byId[a.id] && !list.length) { byId[a.id] = { id: a.id, name: a.name, icon: a.icon || '' }; }
        if (byId[a.id]) { byId[a.id].storeId = a.storeId; }
      });
      apps.all = Object.keys(byId).map(function (id) { return byId[id]; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      apps.realIds = apps.all.map(function (a) { return a.storeId || cfg.PRELOADED_APPS[a.id] || a.id; });
      if (A.settingsUi && A.settingsUi.isOpen()) { A.settingsUi.refreshApps(); }
      else if (A.homeScreen) { A.homeScreen.render(); }
    }, function () {}); } catch (e) { /* Keep the local installed-app inventory. */ }
  };

  apps.byId = function (id) {
    for (var i = 0; i < apps.all.length; i++) { if (apps.all[i].id === id) { return apps.all[i]; } }
    return null;
  };

  apps.defaultHome = function () {
    var picked = [];
    cfg.DEFAULT_HOME_APPS.forEach(function (want) {
      apps.all.forEach(function (a) {
        if (picked.indexOf(a.id) < 0 && a.name.toLowerCase().indexOf(want) === 0) { picked.push(a.id); }
      });
    });
    return [cfg.STORE_ID].concat(picked);
  };

  apps.launch = function (app) {
    var label = A.tiles.shortName(app.name);
    if (!tz || !tz.application) { return A.toast('Would open ' + label); }
    A.homewatch.watch(app.id);
    tz.application.launch(app.id, null, function () { A.toast('Could not open ' + label); });
  };

  apps.openStore = function () {
    if (!tz || !tz.application) { return A.toast('Would open the Samsung app store'); }
    var ids = cfg.STORE_APP_IDS.slice();
    (function next() {
      var id = ids.shift();
      if (!id) { return A.toast('Could not open the app store'); }
      A.homewatch.watch(id);
      tz.application.launch(id, null, function () {
        try {
          var control = new tz.ApplicationControl('http://tizen.org/appcontrol/operation/view');
          tz.application.launchAppControl(control, id, null, next);
        } catch (e) { next(); }
      });
    })();
  };

  // Fireplace: a fireplace video in YouTube; the built-in animated fire as a fallback.
  apps.playFireplace = function () {
    var yt = null;
    apps.all.forEach(function (a) { if (!yt && /^youtube$/i.test(a.name)) { yt = a; } });
    if (!tz || !yt) { return window.Fireplace.open(); }
    A.homewatch.watch(yt.id);
    try {
      var data = [new tz.ApplicationControlData('PAYLOAD', [JSON.stringify({ values: 'v=' + cfg.FIREPLACE_VIDEO })])];
      tz.application.launchAppControl(new tz.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, data),
        yt.id, null, function () { window.Fireplace.open(); });
    } catch (e) {
      window.Fireplace.open();
    }
  };
})(window.AeroTizen);
