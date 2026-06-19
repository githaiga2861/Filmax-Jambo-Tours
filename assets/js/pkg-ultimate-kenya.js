// Page-specific enhancements — core interactivity handled by pkg-shared.js
(function(){
  // Mobile float pill
  var mobileFloatBtn = document.getElementById('mobileFloatBtn');
  if (mobileFloatBtn) {
    setTimeout(function(){ mobileFloatBtn.classList.add('visible'); }, 1200);
  }
})();
