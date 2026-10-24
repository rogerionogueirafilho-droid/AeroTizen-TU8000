const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const native = JSON.parse(fs.readFileSync('tests/fixtures/tu8000-apps.json', 'utf8').replace(/^\uFEFF/, ''));
  const options = {headless:true};
  if (process.env.CHROME_EXECUTABLE) options.executablePath = process.env.CHROME_EXECUTABLE;
  const browser = await chromium.launch(options);
  const page = await browser.newPage({viewport:{width:1920,height:1080}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(apps => {
    window.fixtureLaunches = [];
    window.tizen = {
      application: {
        getAppsInfo: ok => ok(apps.map(a => ({id:a.id,name:a.name,show:a.show,packageId:a.pkg,iconPath:''}))),
        launch: (id, ok) => { window.fixtureLaunches.push(id); if(ok) ok(); },
        launchAppControl: (control, id, ok) => {window.fixtureLaunches.push(id); if(ok) ok();}
      },
      ApplicationControl: function() {}, ApplicationControlData: function() {}
    };
    localStorage.setItem('aerotizen.settings.v1', JSON.stringify({home:['__fire','org.tizen.netflix-app','com.samsung.tv.aria-video','MCmYXNxgcu.DisneyPlus','5b8c3eb16b.BeamCTVDev','org.tizen.primevideo','NuvioTV001.NuvioTV','O1oM4DEEIN.SmartIPTV']}));
  }, native);
  await page.goto('file:///' + path.join(process.cwd(),'launcher/index.html').replaceAll('\\','/'));
  await page.waitForFunction(() => window.AeroTizen && AeroTizen.apps.all.length > 0);
  const summary = await page.evaluate(() => ({
    names:AeroTizen.apps.all.map(a=>a.name), ids:AeroTizen.apps.all.map(a=>a.id),
    home:AeroTizen.settings.home, grid:document.querySelectorAll('#grid > .tile').length
  }));
  for(const name of ['Netflix','Disney+','Apple TV','HBO Max','Prime Video','Nuvio TV','Smart IPTV','Smart STB']) assert(summary.names.includes(name), name+' missing');
  assert(!summary.names.some(n=>/worker|service|daemon/i.test(n)), 'System services leaked into app selection');
  assert.equal(summary.ids.length, new Set(summary.ids).size);
  assert(!summary.home.includes('__fire'));
  assert(summary.home.includes('__store'));
  await page.locator('#grid .samsung-store').click();
  assert(await page.evaluate(()=>fixtureLaunches.includes('com.samsung.tv.store')));
  await page.screenshot({path:'preview-home.png'});
  await page.evaluate(()=>AeroTizen.settingsUi.open());
  assert.equal(await page.locator('#all-apps > .tile').count(), summary.ids.length+1);
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#all-apps img')).every(img => img.complete && img.naturalWidth > 0));
  const missingIcons = await page.locator('#all-apps > .tile').evaluateAll(tiles => tiles.filter(tile => !tile.querySelector('svg path, img.logo, .app-monogram')).map(tile => tile.textContent));
  assert.deepEqual(missingIcons, [], 'Every installed app must have a visible icon');
  assert.equal(await page.locator('#all-apps img[src="assets/apps/disneyplus.png"]').count(), 1);
  assert.equal(await page.locator('#all-apps img[src="assets/apps/hbomax-wordmark.png"]').count(), 1);
  await page.evaluate(()=>document.getElementById('editor').scrollTop = document.getElementById('all-apps').offsetTop - 120);
  await page.screenshot({path:'preview-apps.png'});
  const fallback = await page.evaluate(() => {
    var saved = LOGOS.netflix;
    delete LOGOS.netflix;
    var tile = AeroTizen.tiles.banner({name:'Netflix'}, '', function () {});
    LOGOS.netflix = saved;
    return {icon:!!tile.querySelector('.app-monogram'), label:tile.textContent};
  });
  assert(fallback.icon && fallback.label.includes('Netflix'), 'Missing vector must retain an icon and app label');
  await page.evaluate(() => {
    var tile = AeroTizen.tiles.banner({name:'Test App',icon:'assets/does-not-exist.png'},'',function () {});
    tile.id = 'failed-icon-test'; document.body.appendChild(tile);
  });
  await page.waitForFunction(() => !!document.querySelector('#failed-icon-test .app-monogram'));
  assert.equal(await page.locator('#failed-icon-test .name').textContent(), 'Test App');
  await page.locator('#failed-icon-test').evaluate(tile => tile.remove());
  assert.deepEqual(errors, []);
  // A stalled native discovery must not block first paint.
  const stalled = await browser.newPage();
  await stalled.addInitScript(() => { window.tizen = { application:{getAppsInfo: function() {}} }; });
  await stalled.goto('file:///' + path.join(process.cwd(),'launcher/index.html').replaceAll('\\','/'));
  assert(await stalled.locator('#grid > .tile').count() >= 6, 'Native discovery blocked the UI');
  await stalled.close();
  // New installs appear, and removed apps disappear after successful discovery.
  await page.evaluate(() => {
    tizen.application.getAppsInfo = function(ok) {
      ok([{id:'NewApp123.Home', name:'New App', show:true, packageId:'NewApp123', iconPath:''}]);
    };
    AeroTizen.apps.load(function() {});
  });
  assert.deepEqual(await page.evaluate(()=>AeroTizen.apps.all.map(a=>a.name)), ['New App']);
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
