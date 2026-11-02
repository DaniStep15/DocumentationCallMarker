'use strict'
// Builds the self-contained, bilingual callmarker_integration.html (Russian + English, one switch).
// Content: page.ru.js (+ data.js, status.js) and page.en.js (+ data.en.js, status.en.js).
// The English copy gets an "en-" prefix on every id and internal link, so both languages share one
// file without ID clashes; the switch maps the current position to the same anchor in the other language.
// Run: node build.js <output path>
const fs = require('fs')

const pages = [require('./page.ru')(), require('./page.en')()]
const prefixIds = (html, p) => html.replace(/ id="([^"]+)"/g, ` id="${p}$1"`).replace(/href="#([^"]+)"/g, `href="#${p}$1"`)
const PREFIX = { ru: '', en: 'en-' }

const CSS = `:root{--bg:#f7f7f5;--panel:#fff;--ink:#1d2129;--muted:#5b6270;--line:#e2e3e0;--accent:#2457c5;--code:#f0f1ee;
--api:#2457c5;--api-bg:#eef3fd;--cur:#a15c00;--cur-bg:#fdf5e8;--live:#0f7285;--live-bg:#e9f6f8;--int:#1f7a4a;--int-bg:#ecf7f0;--open:#a3243b;--open-bg:#fcf0f2;
--b-now:#1f7a4a;--b-later:#6b4fbb;--b-notused:#6b7280;--b-deferred:#6b7280;--b-pending:#b45309;}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15171b;--panel:#1d2026;--ink:#e6e7ea;--muted:#a1a7b3;--line:#30343c;--accent:#7fa6ff;--code:#262a31;
--api:#8fb0ff;--api-bg:#1c2538;--cur:#f0b45a;--cur-bg:#2d2416;--live:#6fd0e0;--live-bg:#16282c;--int:#6fd39b;--int-bg:#17291f;--open:#ff8fa3;--open-bg:#2e1a1f;
--b-now:#6fd39b;--b-later:#b9a4ff;--b-notused:#a1a7b3;--b-deferred:#a1a7b3;--b-pending:#f0b45a;}}
:root[data-theme="dark"]{--bg:#15171b;--panel:#1d2026;--ink:#e6e7ea;--muted:#a1a7b3;--line:#30343c;--accent:#7fa6ff;--code:#262a31;
--api:#8fb0ff;--api-bg:#1c2538;--cur:#f0b45a;--cur-bg:#2d2416;--live:#6fd0e0;--live-bg:#16282c;--int:#6fd39b;--int-bg:#17291f;--open:#ff8fa3;--open-bg:#2e1a1f;
--b-now:#6fd39b;--b-later:#b9a4ff;--b-notused:#a1a7b3;--b-deferred:#a1a7b3;--b-pending:#f0b45a;}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
a{color:var(--accent)}
code{font:12.5px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--code);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
bdi{unicode-bidi:isolate}
[hidden]{display:none!important}
.layout{display:grid;grid-template-columns:280px minmax(0,1fr);max-width:1440px;margin:0 auto}
nav.toc{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;padding:24px 18px;border-right:1px solid var(--line)}
nav.toc h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 10px}
nav.toc ol{margin:0;padding-left:22px}
nav.toc li{margin:4px 0;font-size:14px}
nav.toc a{text-decoration:none;color:var(--ink)}
nav.toc a:hover{color:var(--accent);text-decoration:underline}
main{padding:28px 36px 80px;min-width:0}
header.top h1{margin:0 0 6px;font-size:28px;line-height:1.2}
header.top .meta{color:var(--muted);font-size:14px}
.callout{border:1px solid var(--line);border-left:4px solid var(--b-pending);background:var(--panel);padding:12px 16px;border-radius:6px;margin:16px 0}
.callout.danger{border-left-color:var(--open);background:var(--open-bg)}
section{margin-top:44px}
h2{font-size:22px;border-bottom:1px solid var(--line);padding-bottom:6px;margin:0 0 14px}
h3{font-size:17px;margin:26px 0 10px}
.filters{padding:10px 0;margin-top:20px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid var(--line)}
.filters input,.filters select{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}
.filters input{flex:1 1 260px;min-width:0}
.filters .count{color:var(--muted);font-size:13px}
.tablewrap{overflow-x:auto;margin:10px 0}
table{border-collapse:collapse;width:100%;background:var(--panel);font-size:14px}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
th{background:var(--code);font-weight:600}
td code{white-space:normal}
.extable td:first-child code{white-space:nowrap;overflow-wrap:normal}.extable td:nth-child(2) code{word-break:break-all}
.badge{display:inline-block;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:999px;border:1px solid currentColor;white-space:nowrap;margin:1px 4px 1px 0}
.s-now{color:var(--b-now)}.s-later{color:var(--b-later)}.s-notused{color:var(--b-notused)}.s-deferred{color:var(--b-deferred)}.s-pending{color:var(--b-pending)}
.i-match{color:var(--int)}.i-differs{color:var(--open)}.i-partial{color:var(--cur)}.i-temp{color:var(--cur)}.i-absent{color:var(--muted)}.i-absent-ok{color:var(--muted)}.i-prepared{color:var(--b-pending)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;margin:14px 0;break-inside:avoid}
.card header{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;padding:10px 14px;border-bottom:1px solid var(--line)}
.card h4{margin:0;font-size:15.5px}
.card h4 code{font-size:14px}
.bn{color:var(--muted);font-weight:600}
.unknown{color:var(--open);font-style:italic}
.card dl{margin:0}
.card dl>div{display:grid;grid-template-columns:220px minmax(0,1fr);border-top:1px solid var(--line)}
.card dl>div:first-child{border-top:0}
.card dt{padding:7px 14px;font-size:12.5px;font-weight:600;color:var(--muted)}
.card dd{margin:0;padding:7px 14px}
.card dd ul{margin:4px 0;padding-left:20px}
.card .k-api dt{color:var(--api)}.card .k-api{background:var(--api-bg)}
.card .k-cur dt{color:var(--cur)}.card .k-cur{background:var(--cur-bg)}
.card .k-live dt{color:var(--live)}.card .k-live{background:var(--live-bg)}
.card .k-int dt{color:var(--int)}.card .k-int{background:var(--int-bg)}
.card .k-open dt{color:var(--open)}.card .k-open{background:var(--open-bg)}
.legend{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.legend div{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:10px 12px;font-size:14px}
.swatch{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px}
ol.steps{counter-reset:s;list-style:none;padding:0}
ol.steps>li{position:relative;padding:8px 12px 8px 46px;background:var(--panel);border:1px solid var(--line);border-radius:6px;margin:8px 0}
ol.steps>li::before{counter-increment:s;content:counter(s);position:absolute;left:12px;top:8px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:var(--panel);font-weight:700;font-size:13px;display:grid;place-items:center}
pre{background:var(--code);padding:12px 14px;border-radius:6px;overflow:auto;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all}
figure.example{margin:18px 0;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 14px}
figure.example.warn{border-left:4px solid var(--open)}
figcaption{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.note{color:var(--muted);font-size:14px}
ul.check{list-style:none;padding-left:0}
ul.check li{margin:4px 0;display:flex;gap:8px;align-items:flex-start}
ul.check input{margin-top:4px}
.done{color:var(--live);font-size:13px;font-weight:600;max-width:45%}
.top-link{font-size:13px}
@media (max-width:960px){.layout{display:block}nav.toc{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line);padding:16px}
main{padding:20px 16px 60px}.card dl>div{grid-template-columns:1fr}.card dt{padding-bottom:0}ul.check li{flex-wrap:wrap}.done{white-space:normal}}
@media print{nav.toc,.filters,.top-link{display:none!important}.layout{display:block}main{padding:0}body{background:#fff;color:#000;font-size:11pt}
.card[hidden]{display:block!important}tr[hidden]{display:table-row!important}.card,figure,tr{break-inside:avoid}
section{margin-top:24px}h2{break-after:avoid}a{color:#000;text-decoration:none}.print-toc{display:block!important}
.card dl>div{grid-template-columns:170px 1fr}}
.print-toc{display:none}
.toc-overview{margin:0 0 18px;font-size:14px;font-weight:600}.toc-overview a{color:var(--accent)!important}
.status-page{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin-top:24px}
.status-page h2{font-size:24px}.status-page h3{border-top:1px solid var(--line);padding-top:18px;margin-top:28px}
.meta-line{color:var(--muted);font-size:14px}.status-legend div{font-size:13.5px}
.subtoc{margin:14px 0;font-size:14px;line-height:1.9}
.tag{display:inline-block;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:4px;color:var(--panel);white-space:nowrap;vertical-align:1px}
.t-impl{background:var(--cur)}.t-live{background:var(--live)}.t-dec{background:var(--int)}.t-open{background:var(--open)}.t-next{background:var(--api)}.t-exist{background:var(--muted)}
ul.status-list{list-style:none;padding-left:0}ul.status-list li{margin:7px 0}ol.status-steps li{margin:7px 0}
.ok{color:var(--int);font-weight:700}.bad{color:var(--open)}
@media print{.status-page{border:0;padding:0}.tag{color:#000;border:1px solid #000;background:none}}
.lang-switch{position:fixed;top:10px;right:16px;z-index:20;display:flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.lang-switch button{font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;padding:7px 12px;border:0;background:none;color:var(--muted);cursor:pointer}
.lang-switch button[aria-pressed="true"]{background:var(--accent);color:var(--panel)}
@media print{.lang-switch{display:none!important}}
`

const roots = pages
    .map(p => `<div class="lang-root" data-lang="${p.lang}" lang="${p.lang}" data-title="${p.title}"${p.lang === 'ru' ? '' : ' hidden'}>\n${prefixIds(p.body, PREFIX[p.lang])}\n</div>`)
    .join('\n')

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pages[0].title}</title>
<style>
${CSS}</style>
</head>
<body>
<div class="lang-switch" role="group" aria-label="Язык / Language">
  <button type="button" data-set-lang="ru" aria-pressed="true">RU</button><button type="button" data-set-lang="en" aria-pressed="false">EN</button>
</div>
${roots}
<script>
(function(){
  var PREFIX={ru:'',en:'en-'};
  var roots={};
  [].forEach.call(document.querySelectorAll('.lang-root'),function(root){
    roots[root.getAttribute('data-lang')]=root;
    // Parameter filter, one per language.
    var q=root.querySelector('.f-q'),fs=root.querySelector('.f-scope'),fi=root.querySelector('.f-impl'),count=root.querySelector('.f-count');
    var items=[].slice.call(root.querySelectorAll('[data-param]'));
    items.forEach(function(el){el._t=el.textContent.toLowerCase()});
    function apply(){
      var t=q.value.trim().toLowerCase(),n=0,total=0;
      items.forEach(function(el){
        var ok=(!t||el._t.indexOf(t)>-1)&&(!fs.value||el.dataset.scope===fs.value)&&(!fi.value||el.dataset.impl===fi.value);
        el.hidden=!ok;
        if(el.tagName==='ARTICLE'){total++;if(ok)n++}
      });
      var tpl=n===total?count.getAttribute('data-tpl-all'):count.getAttribute('data-tpl-some');
      count.textContent=tpl.replace('{n}',n).replace('{t}',total);
    }
    q.addEventListener('input',apply);fs.addEventListener('change',apply);fi.addEventListener('change',apply);
  });
  var current='ru';
  function baseId(id,lang){return PREFIX[lang]&&id.indexOf(PREFIX[lang])===0?id.slice(PREFIX[lang].length):id}
  // Topmost anchored element at or above the top of the viewport in the visible language.
  function currentAnchor(){
    var els=roots[current].querySelectorAll('[id]'),best=null;
    for(var i=0;i<els.length;i++){var top=els[i].getBoundingClientRect().top;if(top<=80){if(top>-1e6&&els[i].offsetParent!==null)best=els[i]}else break}
    return best?baseId(best.id,current):null;
  }
  function setLang(lang,anchor){
    if(!roots[lang])return;
    var keep=anchor===undefined?currentAnchor():anchor;
    current=lang;
    for(var l in roots)roots[l].hidden=l!==lang;
    document.documentElement.lang=lang;
    document.title=roots[lang].getAttribute('data-title');
    [].forEach.call(document.querySelectorAll('[data-set-lang]'),function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-set-lang')===lang))});
    try{localStorage.setItem('callmarker-doc-lang',lang)}catch(e){}
    var target=keep&&document.getElementById(PREFIX[lang]+keep);
    if(target){var html=document.documentElement,sb=html.style.scrollBehavior;html.style.scrollBehavior='auto';target.scrollIntoView();html.style.scrollBehavior=sb}
    else if(anchor===undefined)window.scrollTo(0,0);
  }
  [].forEach.call(document.querySelectorAll('[data-set-lang]'),function(b){
    b.addEventListener('click',function(){var l=b.getAttribute('data-set-lang');if(l!==current)setLang(l)});
  });
  // Initial language: ?lang=, then an English anchor in the URL, then the saved choice.
  var m=/[?&]lang=(ru|en)(?:&|$)/.exec(location.search),hash=location.hash.slice(1),saved=null;
  try{saved=localStorage.getItem('callmarker-doc-lang')}catch(e){}
  var start=m?m[1]:hash.indexOf('en-')===0?'en':(saved==='en'?'en':'ru');
  if(start!=='ru')setLang(start,hash?baseId(hash,'en'):null);
})();
</script>
</body>
</html>
`

fs.writeFileSync(process.argv[2], html)
console.log('wrote', process.argv[2], html.length, 'bytes;', pages.map(p => `${p.lang}: ${p.total} parameters`).join(', '))
