(function () {
  'use strict';

  var tv = window.tizen;
  var SERVICE_ID = 'DclHome001.Watcher';
  var SERVICE_URL = 'http://127.0.0.1:47790';

  if (!tv || !tv.application) {
    return;
  }

  var app = tv.application;
  var originalLaunch = app.launch;
  var originalLaunchControl = app.launchAppControl;
  var originalGetAppsInfo = app.getAppsInfo;

  var preloaded = {
    'org.tizen.netflix-app': '3201907018807',
    'org.tizen.primevideo': '3201910019365',
    'com.samsung.tv.aria-video': '3201807016597',
    'org.tizen.browser': '3201907018784',
    'com.samsung.tv.gallery': '3201710015037'
  };

  function serviceRequest(path) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', SERVICE_URL + path, false);
      xhr.send();
    } catch (e) {}
  }

  function serviceId(id) {
    return preloaded[id] || id;
  }

  try {
    app.launchAppControl(
      new tv.ApplicationControl('http://tizen.org/appcontrol/operation/service'),
      SERVICE_ID,
      null,
      null
    );
  } catch (e) {}

  app.launch = function (id) {
    serviceRequest('/watch?id=' + encodeURIComponent(serviceId(id)));
    return originalLaunch.apply(app, arguments);
  };

  app.launchAppControl = function (control, id) {
    if (id && id !== SERVICE_ID) {
      serviceRequest('/watch?id=' + encodeURIComponent(serviceId(id)));
    }
    return originalLaunchControl.apply(app, arguments);
  };

  app.getAppsInfo = function (success, error) {
    return originalGetAppsInfo.call(app, function (list) {
      try {
        var ids = (list || []).map(function (item) {
          return serviceId(item.id);
        });
        serviceRequest('/apps?ids=' + ids.map(encodeURIComponent).join(','));
      } catch (e) {}
      if (success) {
        success(list);
      }
    }, error);
  };

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      serviceRequest('/home');
    }
  });

  serviceRequest('/home');
})();
