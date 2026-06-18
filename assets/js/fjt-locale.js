/* ═══════════════════════════════════════════════════════════════
   FJT LOCALE — Auto currency + auto language
   Detects country via IP, converts USD prices, triggers translate
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var COUNTRY={KE:{currency:'KES',symbol:'KSh',lang:'en',rate:130},TZ:{currency:'TZS',symbol:'TSh',lang:'sw',rate:2600},UG:{currency:'UGX',symbol:'USh',lang:'sw',rate:3700},RW:{currency:'RWF',symbol:'RF',lang:'fr',rate:1300},ET:{currency:'ETB',symbol:'Br',lang:'am',rate:56},ZA:{currency:'ZAR',symbol:'R',lang:'en',rate:18.5},NG:{currency:'NGN',symbol:'₦',lang:'en',rate:1580},EG:{currency:'EGP',symbol:'E£',lang:'ar',rate:48},GH:{currency:'GHS',symbol:'GH₵',lang:'en',rate:12},MA:{currency:'MAD',symbol:'MAD',lang:'fr',rate:10},SN:{currency:'XOF',symbol:'CFA',lang:'fr',rate:620},DZ:{currency:'DZD',symbol:'DA',lang:'ar',rate:135},TN:{currency:'TND',symbol:'DT',lang:'ar',rate:3.1},CM:{currency:'XAF',symbol:'CFA',lang:'fr',rate:620},CI:{currency:'XOF',symbol:'CFA',lang:'fr',rate:620},AO:{currency:'AOA',symbol:'Kz',lang:'pt',rate:850},MZ:{currency:'MZN',symbol:'MT',lang:'pt',rate:64},ZM:{currency:'ZMW',symbol:'ZK',lang:'en',rate:25},ZW:{currency:'USD',symbol:'$',lang:'en',rate:1},BW:{currency:'BWP',symbol:'P',lang:'en',rate:13.5},NA:{currency:'NAD',symbol:'N$',lang:'en',rate:18.5},MU:{currency:'MUR',symbol:'Rs',lang:'fr',rate:46},SC:{currency:'SCR',symbol:'Rs',lang:'fr',rate:13.5},MG:{currency:'MGA',symbol:'Ar',lang:'fr',rate:4500},GB:{currency:'GBP',symbol:'£',lang:'en',rate:0.79},DE:{currency:'EUR',symbol:'€',lang:'de',rate:0.92},FR:{currency:'EUR',symbol:'€',lang:'fr',rate:0.92},IT:{currency:'EUR',symbol:'€',lang:'it',rate:0.92},ES:{currency:'EUR',symbol:'€',lang:'es',rate:0.92},NL:{currency:'EUR',symbol:'€',lang:'nl',rate:0.92},BE:{currency:'EUR',symbol:'€',lang:'fr',rate:0.92},PT:{currency:'EUR',symbol:'€',lang:'pt',rate:0.92},CH:{currency:'CHF',symbol:'Fr',lang:'de',rate:0.9},SE:{currency:'SEK',symbol:'kr',lang:'sv',rate:10.5},NO:{currency:'NOK',symbol:'kr',lang:'no',rate:10.7},DK:{currency:'DKK',symbol:'kr',lang:'da',rate:6.9},PL:{currency:'PLN',symbol:'zł',lang:'pl',rate:4.0},CZ:{currency:'CZK',symbol:'Kč',lang:'cs',rate:23},AT:{currency:'EUR',symbol:'€',lang:'de',rate:0.92},IE:{currency:'EUR',symbol:'€',lang:'en',rate:0.92},RU:{currency:'RUB',symbol:'₽',lang:'ru',rate:92},UA:{currency:'UAH',symbol:'₴',lang:'uk',rate:39},TR:{currency:'TRY',symbol:'₺',lang:'tr',rate:32},GR:{currency:'EUR',symbol:'€',lang:'el',rate:0.92},HU:{currency:'HUF',symbol:'Ft',lang:'hu',rate:370},RO:{currency:'RON',symbol:'lei',lang:'ro',rate:4.7},AE:{currency:'AED',symbol:'AED',lang:'ar',rate:3.67},SA:{currency:'SAR',symbol:'SR',lang:'ar',rate:3.75},QA:{currency:'QAR',symbol:'QR',lang:'ar',rate:3.64},KW:{currency:'KWD',symbol:'KD',lang:'ar',rate:0.31},BH:{currency:'BHD',symbol:'BD',lang:'ar',rate:0.38},OM:{currency:'OMR',symbol:'RO',lang:'ar',rate:0.38},IL:{currency:'ILS',symbol:'₪',lang:'he',rate:3.7},JO:{currency:'JOD',symbol:'JD',lang:'ar',rate:0.71},IN:{currency:'INR',symbol:'₹',lang:'hi',rate:83},CN:{currency:'CNY',symbol:'¥',lang:'zh-CN',rate:7.24},JP:{currency:'JPY',symbol:'¥',lang:'ja',rate:150},KR:{currency:'KRW',symbol:'₩',lang:'ko',rate:1340},SG:{currency:'SGD',symbol:'S$',lang:'en',rate:1.35},HK:{currency:'HKD',symbol:'HK$',lang:'zh-TW',rate:7.82},TH:{currency:'THB',symbol:'฿',lang:'th',rate:36},MY:{currency:'MYR',symbol:'RM',lang:'ms',rate:4.7},ID:{currency:'IDR',symbol:'Rp',lang:'id',rate:15800},PH:{currency:'PHP',symbol:'₱',lang:'tl',rate:57},PK:{currency:'PKR',symbol:'Rs',lang:'ur',rate:278},BD:{currency:'BDT',symbol:'৳',lang:'bn',rate:110},VN:{currency:'VND',symbol:'₫',lang:'vi',rate:25300},US:{currency:'USD',symbol:'$',lang:'en',rate:1},CA:{currency:'CAD',symbol:'C$',lang:'en',rate:1.36},MX:{currency:'MXN',symbol:'MX$',lang:'es',rate:17},BR:{currency:'BRL',symbol:'R$',lang:'pt',rate:4.97},AR:{currency:'ARS',symbol:'ARS',lang:'es',rate:870},CL:{currency:'CLP',symbol:'CLP$',lang:'es',rate:960},CO:{currency:'COP',symbol:'COL$',lang:'es',rate:3900},PE:{currency:'PEN',symbol:'S/',lang:'es',rate:3.7},AU:{currency:'AUD',symbol:'A$',lang:'en',rate:1.54},NZ:{currency:'NZD',symbol:'NZ$',lang:'en',rate:1.63}};
var DEFAULT={currency:'USD',symbol:'$',lang:'en',rate:1};
var CACHE_KEY='fjt_locale_v2';

function fmt(usd,loc){
  var n=Math.round(usd*loc.rate);
  var s=n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return loc.symbol+s;
}

function convertPrices(loc){
  if(loc.rate===1&&loc.currency==='USD')return;
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
  var nodes=[];var node;
  while((node=walker.nextNode())){if(/\$[\d,]+/.test(node.nodeValue))nodes.push(node);}
  nodes.forEach(function(n){
    n.nodeValue=n.nodeValue.replace(/\$([\d,]+)/g,function(m,d){
      var usd=parseInt(d.replace(/,/g,''),10);
      return(isNaN(usd)||usd===0)?m:fmt(usd,loc);
    });
  });
  window._fjtLocale=loc;
}

function triggerTranslate(lang){
  if(!lang||lang==='en')return;
  var tries=0;
  var t=setInterval(function(){
    if(++tries>60){clearInterval(t);return;}
    var sel=document.querySelector('.goog-te-combo');
    if(!sel)return;
    clearInterval(t);
    sel.value=lang;
    sel.dispatchEvent(new Event('change'));
  },250);
}

function showBadge(loc){
  if(loc.currency==='USD')return;
  var b=document.createElement('div');
  b.style.cssText='position:fixed;bottom:168px;left:24px;z-index:199;background:rgba(8,8,8,0.85);border:1px solid rgba(212,175,55,0.35);color:rgba(212,175,55,0.9);font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:6px 12px;pointer-events:none;backdrop-filter:blur(8px);transition:opacity 1s ease;opacity:0;';
  b.textContent=loc.currency+' · auto-converted';
  document.body.appendChild(b);
  setTimeout(function(){b.style.opacity='1';},400);
  setTimeout(function(){b.style.opacity='0';},5000);
  setTimeout(function(){if(b.parentNode)b.remove();},6200);
}

function apply(loc){
  convertPrices(loc);
  showBadge(loc);
  triggerTranslate(loc.lang);
}

function run(){
  var cached=sessionStorage.getItem(CACHE_KEY);
  if(cached){try{apply(JSON.parse(cached));return;}catch(e){}}
  var bl=(navigator.language||'en').toLowerCase().split('-');
  var langCode=bl[0];
  var countryHint=bl[1]?bl[1].toUpperCase():null;
  fetch('https://ipapi.co/json/')
    .then(function(r){return r.json();})
    .then(function(d){
      var cc=(d.country_code||countryHint||'US').toUpperCase();
      var loc=Object.assign({},COUNTRY[cc]||DEFAULT);
      if(langCode&&langCode!=='en')loc.lang=langCode;
      sessionStorage.setItem(CACHE_KEY,JSON.stringify(loc));
      apply(loc);
    })
    .catch(function(){
      var loc=Object.assign({},DEFAULT,{lang:langCode});
      sessionStorage.setItem(CACHE_KEY,JSON.stringify(loc));
      apply(loc);
    });
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(run,800);});}
else{setTimeout(run,800);}
})();
