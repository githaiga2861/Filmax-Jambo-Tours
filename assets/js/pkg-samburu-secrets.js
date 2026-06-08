
const cursor=document.getElementById('cursor');
const ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
function animateRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animateRing);}
animateRing();
document.querySelectorAll('a,button,.pkg-highlight-item,.related-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.style.width='20px';cursor.style.height='20px';ring.style.width='60px';ring.style.height='60px';ring.style.borderColor='rgba(212,175,55,.8)';});
  el.addEventListener('mouseleave',()=>{cursor.style.width='12px';cursor.style.height='12px';ring.style.width='40px';ring.style.height='40px';ring.style.borderColor='rgba(212,175,55,.5)';});
});
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>50);});
const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:.06,rootMargin:'0px 0px -30px 0px'});
reveals.forEach(el=>observer.observe(el));
// Mobile float + bar scroll behaviour
const mobileFloatBtn = document.getElementById('mobileFloatBtn');
const mobileBookBar  = document.getElementById('mobileBookBar');
const bespokeBanner  = document.querySelector('.pkg-related');

if (mobileFloatBtn && mobileBookBar) {

  // Pop in the float pill after 1.2s on page load
  setTimeout(() => {
    mobileFloatBtn.classList.add('visible');
  }, 1200);

  window.addEventListener('scroll', () => {
    if (window.innerWidth > 1100) return;

    const scrollY      = window.scrollY;
    const docHeight    = document.body.scrollHeight;
    const windowHeight = window.innerHeight;

    // When user is within 600px of the bottom — show bar, hide pill
    const nearBottom = scrollY + windowHeight >= docHeight - 600;

    if (nearBottom) {
      mobileBookBar.classList.add('visible');
      mobileFloatBtn.classList.add('hide');
      mobileFloatBtn.classList.remove('visible');
    } else {
      mobileBookBar.classList.remove('visible');
      mobileFloatBtn.classList.remove('hide');
      mobileFloatBtn.classList.add('visible');
    }
  });
}  
