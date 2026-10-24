// App tiles: Android-TV-style banners (brand background + official logo) and icons.
(function (A) {
  'use strict';

  // match: lower-case name prefix; logo: Simple Icons slug from logos.js; fill: logo colour;
  // text: wordmark beside the logo (null = the logo is the wordmark); big: oversized logo.
  var BRANDS = [
    { match: 'youtube', bg: '#ffffff', logo: 'youtube', fill: '#ff0000', text: 'YouTube', ink: '#0f0f0f' },
    { match: 'netflix', bg: 'linear-gradient(135deg,#e50914,#8a0610)', logo: 'netflix', fill: '#ffffff', text: null },
    { match: 'prime video', bg: 'linear-gradient(135deg,#1a98ff,#0f4c81)', logo: 'primevideo', fill: '#ffffff', text: null, big: true },
    { match: 'spotify', bg: 'linear-gradient(135deg,#1ed760,#0f8a3c)', logo: 'spotify', fill: '#000000', text: 'Spotify', ink: '#000000' },
    { match: 'stremio', bg: 'linear-gradient(135deg,#7b5bf5,#2b1d68)', logo: 'stremio', fill: '#ffffff', text: 'Stremio', ink: '#ffffff' },
    { match: 'hbo', bg: '#080808', image: 'assets/apps/hbomax-wordmark.png', text: null },
    { match: 'max', bg: '#080808', image: 'assets/apps/hbomax-wordmark.png', text: null },
    { match: 'hulu', bg: '#1ce783', logo: 'hulu', fill: '#0b0c0f', text: null },
    { match: 'apple tv', bg: 'linear-gradient(135deg,#4a4a4f,#1c1c1e)', logo: 'appletv', fill: '#ffffff', text: null },
    { match: 'plex', bg: '#1f1f1f', logo: 'plex', fill: '#ebaf00', text: null },
    { match: 'twitch', bg: '#9146ff', logo: 'twitch', fill: '#ffffff', text: 'Twitch', ink: '#ffffff' },
    { match: 'crunchyroll', bg: '#f47521', logo: 'crunchyroll', fill: '#ffffff', text: 'Crunchyroll', ink: '#ffffff' },
    { match: 'paramount', bg: '#0064ff', logo: 'paramountplus', fill: '#ffffff', text: null },
    { match: 'tubi', bg: '#7408ff', logo: 'tubi', fill: '#ffffff', text: null },
    { match: 'jellyfin', bg: 'linear-gradient(135deg,#aa5cc3,#00a4dc)', logo: 'jellyfin', fill: '#ffffff', text: 'Jellyfin', ink: '#ffffff' },
    { match: 'disney', bg: 'linear-gradient(135deg,#057b8b,#001f36)', image: 'assets/apps/disneyplus.png', text: 'Disney+', ink: '#ffffff' },
    { match: 'nuvio', bg: 'linear-gradient(135deg,#20203c,#101019)', image: 'assets/nuvio.png', text: 'Nuvio', ink: '#ffffff' },
    { match: 'smart iptv', bg: 'linear-gradient(135deg,#173e68,#07182b)', symbol: 'tv', text: 'Smart IPTV', ink: '#ffffff' },
    { match: 'smart stb', bg: 'linear-gradient(135deg,#6648a8,#24143f)', symbol: 'box', text: 'Smart STB', ink: '#ffffff' },
    { match: 'internet', bg: 'linear-gradient(135deg,#1466b2,#122943)', symbol: 'globe', text: 'Internet', ink: '#ffffff' },
    { match: 'gallery', bg: 'linear-gradient(135deg,#714fbd,#c04f8e)', symbol: 'gallery', text: 'Galeria', ink: '#ffffff' },
    { match: 'amazon alexa', bg: 'linear-gradient(135deg,#126da0,#0d263e)', symbol: 'mic', text: 'Alexa', ink: '#ffffff' },
    { match: 'xbox', bg: 'linear-gradient(135deg,#107c10,#093b09)', symbol: 'game', text: 'Xbox', ink: '#ffffff' },
    { match: 'e-manual', bg: 'linear-gradient(135deg,#334563,#172033)', symbol: 'book', text: 'Manual', ink: '#ffffff' },
    { match: 'tizenbrew', bg: 'linear-gradient(135deg,#ff9e1b,#7a2c00)', logo: null, text: 'TizenBrew', ink: '#ffffff', useIcon: true }
  ];

  function svg(viewBoxContent, className) {
    return '<svg' + (className ? ' class="' + className + '"' : '') + ' viewBox="0 0 24 24">' + viewBoxContent + '</svg>';
  }
  var BADGE = '<rect width="24" height="24" rx="5" fill="#2c2c30"/>';
  var ICONS = {
    store: svg('<path d="M5 7h14l2 5H3zM4 12v9h16v-9M9 21v-6h6v6M8 7V5a4 4 0 0 1 8 0v2" fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>', 'logo'),
    globe: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="white" stroke-width="1.5"/><path d="M3 12h18M5 7h14M5 17h14" stroke="white" stroke-width="1.5"/>', 'logo'),
    gallery: svg('<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="white" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="white"/><path d="m4 18 5-6 4 4 3-4 5 6" fill="none" stroke="white" stroke-width="1.5"/>', 'logo'),
    mic: svg('<rect x="9" y="2" width="6" height="13" rx="3" fill="white"/><path d="M6 11v2a6 6 0 0 0 12 0v-2M12 19v3M8 22h8" fill="none" stroke="white" stroke-width="1.5"/>', 'logo'),
    book: svg('<path d="M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1v16" fill="none" stroke="white" stroke-width="1.6"/>', 'logo'),
    flame: svg('<path fill="#ffd27a" d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.5 0 2.2-1.2 2-3 2.3 1.9 3.7 4.3 3.7 7A6.5 6.5 0 0 1 12 22.5 6.5 6.5 0 0 1 5.5 16c0-4.6 3.6-7.4 4.8-10.4C11 4.2 11.6 3 12 2z"/>', 'flame'),
    plus: svg('<circle cx="12" cy="12" r="10.5" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>', 'logo'),
    hdmi: svg(BADGE + '<path fill="#fff" d="M5 9h14v3l-2 3H7l-2-3zM8 11v1h1v-1zm3 0v1h2v-1zm4 0v1h1v-1z"/>'),
    tv: svg(BADGE + '<path fill="none" stroke="#fff" stroke-width="1.6" d="M5 8h14v9H5zM9 5l3 3 3-3"/>'),
    game: svg(BADGE + '<path fill="#fff" d="M7.5 8h9a3.5 3.5 0 0 1 3.4 4.3l-.8 3.2a2 2 0 0 1-3.4.9L14.3 15H9.7l-1.4 1.4a2 2 0 0 1-3.4-.9l-.8-3.2A3.5 3.5 0 0 1 7.5 8zM8 10v1H7v1h1v1h1v-1h1v-1H9v-1zm7.5.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6zm-1.6 1.6a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"/>'),
    pc: svg(BADGE + '<path fill="none" stroke="#fff" stroke-width="1.6" d="M5 6.5h14v9H5zM9 19h6M12 15.5V19"/>'),
    box: svg(BADGE + '<path fill="none" stroke="#fff" stroke-width="1.6" d="M4.5 10h15v5h-15z"/><circle cx="16.5" cy="12.5" r="1" fill="#fff"/>')
  };

  function shortName(name) { return name.replace(/ - .*/, '').replace(/NextGeneration$/, ''); }

  function brandFor(name) {
    var n = name.toLowerCase().replace(/^\s+|\s+$/g, '');
    for (var i = 0; i < BRANDS.length; i++) { if (n.indexOf(BRANDS[i].match) === 0) { return BRANDS[i]; } }
    // Unknown apps: a stable colour derived from the name, plus the app's own icon.
    var h = 0;
    for (var j = 0; j < n.length; j++) { h = (h * 31 + n.charCodeAt(j)) % 360; }
    return { bg: 'linear-gradient(135deg,hsl(' + h + ',55%,42%),hsl(' + ((h + 40) % 360) + ',65%,14%))',
             logo: null, text: shortName(name), ink: '#ffffff', useIcon: true };
  }

  function logoSvg(slug, fill) {
    var d = window.LOGOS && window.LOGOS[slug];
    return d ? svg('<path fill="' + fill + '" d="' + d + '"/>', 'logo') : '';
  }

  // A banner tile for an app; `onSelect` runs when the tile is chosen.
  function banner(app, extraClass, onSelect) {
    var b = brandFor(app.name), tile = A.el('div');
    tile.className = 'tile' + (extraClass ? ' ' + extraClass : '') + (b.text ? '' : ' logo-only') + (b.big ? ' logo-big' : '');
    tile.style.background = b.bg;
    function monogram() {
      var letters = shortName(app.name).split(/\s+/).map(function (s) { return s.charAt(0); }).slice(0, 2).join('');
      tile.insertBefore(A.el('div', 'app-monogram', letters.toUpperCase()), tile.firstChild);
    }
    // Keep a visible symbol and label even when an asset is unavailable.
    function fallback() {
      monogram();
      if (!b.text) {
        tile.classList.remove('logo-only');
        tile.appendChild(A.el('div', 'name', shortName(app.name)));
      }
    }
    if (b.symbol) {
      tile.innerHTML = ICONS[b.symbol];
    } else if (b.logo) {
      var markup = logoSvg(b.logo, b.fill);
      if (markup) { tile.innerHTML = markup; } else { fallback(); }
    } else if (b.image || (b.useIcon && app.icon)) {
      var img = new Image();
      img.className = 'logo'; img.alt = '';
      img.onerror = function () { if (img.parentNode) { tile.removeChild(img); } fallback(); };
      img.src = b.image || app.icon;
      tile.appendChild(img);
    } else {
      monogram();
    }
    if (b.text) {
      var name = A.el('div', 'name', b.text);
      name.style.color = b.ink;
      tile.appendChild(name);
    }
    tile.onclick = onSelect;
    return tile;
  }

  // A compact card (icon + label), used for inputs.
  function card(label, iconSvg, onSelect) {
    var tile = A.el('div', 'tile');
    tile.innerHTML = iconSvg;
    tile.appendChild(A.el('div', 'name', label));
    tile.onclick = onSelect;
    return tile;
  }

  A.tiles = { ICONS: ICONS, banner: banner, card: card, shortName: shortName };
})(window.AeroTizen);
