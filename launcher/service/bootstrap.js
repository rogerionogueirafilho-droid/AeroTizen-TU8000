'use strict';
// TU8000: only launch at startup/resume. Never infer Home from visibility flags.
var http = require('http');
var state = { started: 0, launches: 0, reason: null, result: null, lastTick: 0, power: null, powerChanges: [] };
var timers = [], server = null, powerBusy = false, pendingHome = null;

function scheduleHome(reason, delay) {
  if (pendingHome) { clearTimeout(pendingHome); }
  pendingHome = setTimeout(function () {
    pendingHome = null;
    if (state.power === 'standby' || state.power === 'off') { return; }
    openHome(reason, 1);
  }, delay);
  timers.push(pendingHome);
}

function pollPower() {
  if (powerBusy) { return; }
  powerBusy = true;
  var finished = false;
  function done() { if (finished) { return; } finished = true; powerBusy = false; }
  var req = http.get({host: '127.0.0.1', port: 8001, path: '/api/v2/', timeout: 1500}, function (res) {
    var body = '';
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function () {
      done();
      var power;
      try { power = String(JSON.parse(body).device.PowerState).toLowerCase(); } catch (e) { return; }
      if (power !== 'on' && power !== 'standby' && power !== 'off') { return; }
      var previous = state.power;
      state.power = power;
      if (previous !== power) {
        state.powerChanges.push({at: Date.now(), from: previous, to: power});
        state.powerChanges = state.powerChanges.slice(-12);
        if (power === 'on' && previous) { scheduleHome('power-on', 5000); }
        else if (power !== 'on' && pendingHome) { clearTimeout(pendingHome); pendingHome = null; }
      }
    });
    res.on('error', done);
  });
  req.on('error', done);
  req.setTimeout(1500, function () { req.destroy(); done(); });
}

function openHome(reason, attempt) {
  state.reason = reason;
  state.launches++;
  try {
    tizen.application.launch('DclHome001.Home', function () {
      state.result = 'opened';
    }, function (e) {
      state.result = e.name + ': ' + e.message;
      if (attempt < 3) { timers.push(setTimeout(function () { openHome(reason, attempt + 1); }, 5000)); }
    });
  } catch (e) { state.result = e.message; }
}

module.exports.onStart = function () {
  state.started = Date.now(); state.lastTick = Date.now();
  server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
  });
  server.on('error', function (e) { state.serverError = e.message; });
  server.listen(47790, '127.0.0.1');
  scheduleHome('startup', 1000);
  pollPower();
  timers.push(setInterval(function () {
    var now = Date.now(), elapsed = now - state.lastTick;
    state.lastTick = now;
    if (elapsed > 12000) { scheduleHome('resume', 5000); }
    pollPower();
  }, 2000));
};
module.exports.onRequest = function () {};
module.exports.onStop = module.exports.onExit = function () {
  timers.forEach(clearTimeout);
  if (server) { server.close(); }
};
