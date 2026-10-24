// ==========================================
// themes.js — Saare themes ek jagah + har page par wahi theme
// - Shop (index.html) se kharidi hui theme ab dua / tajweed / asma / games sab par lagti hai
// - Naya theme jodna ho: neeche THEMES mein ek entry (item = shop ka id, cost = XP)
// - Storage: 'theme' (jo lagi hai). Purana 'darkMode' sirf tab padha jata hai jab 'theme' na ho.
// - body par 2 attribute: data-theme = 'light'|'dark' (tone, purane dark rules ke liye)
//                         data-skin  = theme ka naam (rang yahin se aate hain)
// ==========================================
(function () {
    'use strict';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    // ---------- Decoration (SVG patterns) ----------
    function svg(s) { return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")'; }
    var STARS = svg('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><g fill="#fff">' +
        '<circle cx="12" cy="20" r="1" opacity=".7"/><circle cx="70" cy="48" r="1.4" opacity=".55"/><circle cx="130" cy="14" r=".9" opacity=".8"/>' +
        '<circle cx="40" cy="96" r=".8" opacity=".5"/><circle cx="104" cy="88" r="1.2" opacity=".65"/><circle cx="148" cy="132" r="1" opacity=".6"/>' +
        '<circle cx="22" cy="148" r="1.3" opacity=".5"/><circle cx="84" cy="136" r=".8" opacity=".7"/></g>' +
        '<g fill="#F5D77A"><circle cx="58" cy="12" r="1.6" opacity=".9"/><circle cx="118" cy="62" r="1.8" opacity=".85"/><circle cx="30" cy="122" r="1.5" opacity=".8"/></g></svg>');
    var LEAVES = svg('<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"><g fill="none" stroke="#16A34A" stroke-opacity=".16" stroke-width="1.2">' +
        '<path d="M14 62c0-16 10-26 26-28-1 16-10 27-26 28z"/><path d="M14 62l14-16"/>' +
        '<path d="M58 30c0-10 6-16 16-17-1 10-6 16-16 17z"/><path d="M58 30l9-10"/></g>' +
        '<circle cx="70" cy="70" r="2" fill="#E8B84A" fill-opacity=".35"/><circle cx="20" cy="14" r="1.6" fill="#E8B84A" fill-opacity=".3"/></svg>');
    var DIAMONDS = svg('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><g fill="none" stroke="#D4AF37" stroke-opacity=".16" stroke-width="1">' +
        '<path d="M32 4l28 28-28 28L4 32z"/><path d="M32 18l14 14-14 14-14-14z"/></g></svg>');

    // ---------- Themes ----------
    // tone: 'light' | 'dark'   hdr: [header ka upar, neeche]   btn: [a, b, text] (sub-pages ke buttons)
    var THEMES = [
        { id: 'light', free: true, tone: 'light', icon: '☀️', name: 'Default (Roshan)' },
        { id: 'dark', free: true, tone: 'dark', icon: '🌙', name: 'Dark' },

        { id: 'midnight', item: 'theme_midnight', tone: 'dark', icon: '🌙', name: 'Midnight Theme', cost: 300,
          c: { p: '#1E3A8A', pd: '#0F172A', sec: '#F59E0B', gb: '#FBBF24', ink: '#F8FAFC', bg: '#0F172A', card: '#1E293B', soft: '#334155', text: '#F8FAFC', tl: '#94A3B8', border: '#475569', ar: '#FDE68A' },
          hdr: ['#1E3A8A', '#172554'], btn: ['#F59E0B', '#D97706', '#1F1300'] },
        { id: 'royal', item: 'theme_royal', tone: 'dark', icon: '💎', name: 'Royal Theme', cost: 300,
          c: { p: '#4C1D95', pd: '#2E1065', sec: '#FBBF24', gb: '#FCD34D', ink: '#F3F4F6', bg: '#2E1065', card: '#4C1D95', soft: '#5B21B6', text: '#F3F4F6', tl: '#D8B4FE', border: '#7E22CE', ar: '#FDE68A' },
          hdr: ['#6D28D9', '#4C1D95'], btn: ['#FBBF24', '#D99A0B', '#2A1A00'] },
        { id: 'lightblue', item: 'theme_lightblue', tone: 'light', icon: '💧', name: 'Sky Blue Theme', cost: 250,
          c: { p: '#0284C7', pd: '#0369A1', sec: '#D98A0B', gb: '#FBBF24', ink: '#0F172A', bg: '#F0F9FF', card: '#FFFFFF', soft: '#E0F2FE', text: '#0F172A', tl: '#475569', border: '#BAE6FD', ar: '#0C4A6E' },
          hdr: ['#0EA5E9', '#0284C7'], btn: ['#0EA5E9', '#0284C7', '#FFFFFF'] },

        // ----- ✨ Special themes -----
        { id: 'qadr', item: 'theme_qadr', tone: 'dark', rarity: 'epic', icon: '🌌', name: 'Shab-e-Qadr ✨ (sitaron wali raat)', cost: 500,
          c: { p: '#4338CA', pd: '#0A0F2C', sec: '#F5D77A', gb: '#FDE68A', ink: '#EEF0FF', bg: '#0A0F2C', card: '#141B4A', soft: '#1D2660', text: '#EEF0FF', tl: '#A5ADE6', border: '#323E8F', ar: '#FFE9A8' },
          hdr: ['#2B2F8F', '#141B4A'], btn: ['#F5D77A', '#D4AF37', '#1A1440'],
          deco: 'radial-gradient(ellipse at 50% -8%, rgba(99,102,241,.38), transparent 62%), radial-gradient(ellipse at 85% 105%, rgba(245,215,122,.12), transparent 55%), ' + STARS },
        { id: 'jannah', item: 'theme_jannah', tone: 'light', rarity: 'epic', icon: '🌿', name: 'Jannah ka Bagh ✨ (hara-bhara)', cost: 450,
          c: { p: '#15803D', pd: '#14532D', sec: '#C28A1B', gb: '#E8B84A', ink: '#0F3D22', bg: '#EAF8EF', card: '#FFFFFF', soft: '#DDF3E5', text: '#14291C', tl: '#4B6B58', border: '#B6E3C6', ar: '#0B3B20' },
          hdr: ['#22A455', '#15803D'], btn: ['#16A34A', '#15803D', '#FFFFFF'],
          deco: 'radial-gradient(ellipse at 10% 0%, rgba(74,222,128,.22), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(232,184,74,.18), transparent 55%), ' + LEAVES },
        { id: 'haram', item: 'theme_haram', tone: 'dark', rarity: 'legend', icon: '🕋', name: 'Kaala-Sunehra ✨ (Shahi)', cost: 800,
          c: { p: '#8A6A0F', pd: '#000000', sec: '#E6C25A', gb: '#F3D77E', ink: '#F7E7B0', bg: '#0A0A0A', card: '#161412', soft: '#211C14', text: '#F4EBD0', tl: '#B7A77A', border: '#4A3C1A', ar: '#F6DE8C' },
          hdr: ['#000000', '#2E2408'], btn: ['#E6C25A', '#B8923A', '#1A1304'],
          deco: 'radial-gradient(ellipse at 50% -10%, rgba(212,175,55,.22), transparent 60%), ' + DIAMONDS }
    ];

    function byId(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return null; }

    // ---------- CSS (skins ke rang) ----------
    function buildCSS() {
        var css = '';
        THEMES.forEach(function (t) {
            if (!t.c) return;
            var c = t.c, dark = t.tone === 'dark';
            var sel = 'body[data-skin="' + t.id + '"]';
            css += sel + '{' +
                '--primary:' + c.p + ';--primary-deep:' + c.pd + ';--secondary:' + c.sec + ';--gold:' + c.sec + ';--gold-bright:' + c.gb + ';' +
                '--ink:' + c.ink + ';--bg:' + c.bg + ';--card-bg:' + c.card + ';--card:' + c.card + ';--soft-bg:' + c.soft + ';' +
                '--text:' + c.text + ';--text-light:' + c.tl + ';--light:' + c.tl + ';--border:' + c.border + ';--arabic:' + c.ar + ';' +
                '--chip-bg:' + (dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)') + ';' +
                '--shadow:' + (dark ? '0 1px 2px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.4)' : '0 1px 2px rgba(10,46,36,.08),0 8px 24px rgba(10,46,36,.10)') + ';' +
                '--hdr-a:' + t.hdr[0] + ';--hdr-b:' + t.hdr[1] + ';--btn-a:' + t.btn[0] + ';--btn-b:' + t.btn[1] + ';--btn-text:' + t.btn[2] + ';' +
                '--kbc-bg:' + c.pd + ';--kbc-gold:' + c.gb + ';' +
                (t.deco ? 'background-image:' + t.deco + ';background-attachment:fixed;' : '') +
                '}\n';
        });
        return css;
    }
    function injectCSS() {
        if (document.getElementById('fqThemeCss')) return;
        var s = document.createElement('style');
        s.id = 'fqThemeCss';
        s.textContent = buildCSS();
        (document.head || document.documentElement).appendChild(s);
    }

    // ---------- Kaun si theme is profile ki hai ----------
    function ownedIds() {
        if (lsGet('userRole') === 'admin') return null;                 // admin ke liye sab
        var p = lsGet('activeProfile');
        if (!p) return [];
        try { var v = JSON.parse(lsGet('p_' + p + '_ownedItems')); return Array.isArray(v) ? v : []; } catch (e) { return []; }
    }
    function allowed(t) {
        if (!t) return false;
        if (t.free) return true;
        var o = ownedIds();
        return o === null || o.indexOf(t.item) >= 0;
    }
    function available() { return THEMES.filter(allowed); }

    function current() {
        var id = lsGet('theme');
        if (!id) id = lsGet('darkMode') === 'true' ? 'dark' : 'light';   // purana format
        var t = byId(id);
        return allowed(t) ? t.id : 'light';
    }

    // ---------- Lagana ----------
    function metaColor(t) {
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute('content', t && t.hdr ? t.hdr[1] : '#0F4C3A');
    }
    function apply(id) {
        var t = byId(id) || byId('light');
        if (!allowed(t)) t = byId('light');
        var b = document.body;
        if (!b) return t.id;
        b.setAttribute('data-theme', t.tone);
        if (t.c) b.setAttribute('data-skin', t.id); else b.removeAttribute('data-skin');
        metaColor(t);
        paintButtons(t.id);
        return t.id;
    }
    function set(id) {
        var t = byId(id);
        if (!allowed(t)) t = byId('light');
        lsSet('theme', t.id);
        lsSet('darkMode', t.tone === 'dark' ? 'true' : 'false');          // purane pages ke liye
        return apply(t.id);
    }

    // ---------- Toolbar button (🌙 / ☀️ / skin): agli available theme par ----------
    function nextOf(id) {
        var list = available();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[(i + 1) % list.length];
        return list[0];
    }
    function paintButtons(id) {
        var n = nextOf(id);
        var b = document.getElementById('themeBtn');
        if (b && b.getAttribute('data-fqcycle') === '1') { b.textContent = n.icon; b.title = 'Theme: ' + n.name; }
    }
    function cycle() { return set(nextOf(current()).id); }
    // Sub-pages: themeBtn dabane par ek ke baad ek theme (sirf kharidi hui)
    function bindButton() {
        var b = document.getElementById('themeBtn');
        if (!b || b.getAttribute('data-fqcycle')) return;
        b.setAttribute('data-fqcycle', '1');
        b.onclick = function (e) { if (e && e.stopImmediatePropagation) e.stopImmediatePropagation(); cycle(); };
        paintButtons(current());
    }

    window.FQTheme = {
        THEMES: THEMES, get: byId, current: current, apply: apply, set: set, cycle: cycle,
        available: available, owned: ownedIds, allowed: function (id) { return allowed(byId(id)); }, bindButton: bindButton
    };

    injectCSS();
    function init() { apply(current()); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.addEventListener('pageshow', function () { apply(current()); });          // wapas (back) aane par
    window.addEventListener('storage', function (e) { if (e.key === 'theme' || e.key === 'activeProfile') apply(current()); });
})();
