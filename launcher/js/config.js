// AeroTizen launcher: every constant in one place.
window.AeroTizen = window.AeroTizen || {};

AeroTizen.config = {
  APP_ID: 'DclHome001.Home',
  SERVICE_ID: 'DclHome001.Watcher',
  SERVICE_URL: 'http://127.0.0.1:47790',
  WATCHER_ENABLED: true,

  STORAGE_KEY: 'aerotizen.settings.v1',
  LEGACY_STORAGE_KEYS: ['hearth.home.v1', 'declutter.home.v5'],

  // Remote control key codes (Tizen TV).
  KEY: { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27, IME_DONE: 65376, IME_CANCEL: 65385 },

  // Apps placed on the home grid the first time, by name prefix, in this order.
  DEFAULT_HOME_APPS: ['netflix', 'disney', 'hbo', 'apple tv', 'prime video', 'youtube', 'nuvio', 'smart iptv'],

  // Real user apps: Samsung-store packages plus the preinstalled streamers.
  STORE_PACKAGE: /^[A-Za-z0-9]{10}$/,
  PRELOADED_APPS: { 'org.tizen.netflix-app': '3201907018807', 'org.tizen.primevideo': '3201910019365', 'com.samsung.tv.aria-video': '3201807016597', 'org.tizen.browser': '3201907018784', 'com.samsung.tv.gallery': '3201710015037' },
  HIDDEN_APPS: /(?:\.service$|companion|dummy|widget|DclHome001|webaccount|multiscreen|lowmem)/i,
  STORE_APP_IDS: ['com.samsung.tv.store', 'org.volt.apps', 'com.samsung.tv.coba.apps'],

  FIREPLACE_ID: '__fire',
  STORE_ID: '__store',
  FIREPLACE_VIDEO: 'WuHSBSLK3_A',

  GRID_COLUMNS: 3,
  LONG_PRESS_MS: 600,
  SPEED: { MIN: 0.25, MAX: 3, STEP: 0.25 },

  DEFAULTS: {
    home: [],
    background: 'aurora',
    speed: 1,
    tempUnit: 'auto',
    dateFormat: 'weekday',
    timeFormat: '12',
    inputNames: {}
  }
};
