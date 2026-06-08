window.scrollTo(0,0);document.documentElement.scrollTop=0;

// Defer all background preloading until after first paint — does not block render
window.addEventListener('load', function(){
  var imgs = [
    'assets/maasaimara.webp',
    'assets/dianibeach.webp',
    'assets/amboseli.webp',
    'assets/lakenakuru.webp',
    'assets/mountkenya.webp',
    'assets/maasaimen.webp',
    'assets/jwmarriott.webp',
    'assets/girraffefeeding.webp',
    'assets/jungle.webp',
    'assets/Coolelephant.webp',
    'assets/zebra.webp',
    'assets/team-filmer.webp',
    'assets/team-amara.webp',
    'assets/team-githaiga.webp'
  ];
  var i = 0;
  function loadNext() {
    if (i >= imgs.length) return;
    var img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = function(){ i++; setTimeout(loadNext, 80); };
    img.src = imgs[i];
  }
  // Start after a short idle gap so UI is fully responsive first
  setTimeout(loadNext, 1200);
});


function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'fr,de,es,it,pt,zh-CN,zh-TW,ja,ko,ar,sw,hi,nl,ru,pl',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false
  }, 'google_translate_element');
}
