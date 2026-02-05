const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const topGif = document.querySelector('.top-gif');
const mainQuestion = document.getElementById('mainQuestion');
const subtitleEl = document.getElementById('subtitle');

let noClickCount = 0;
const gifSequence = ['asking.gif','begging.gif','begs2.gif','crying.gif'];
const questionSequence = [
  {title: 'Will You Go Out With Me? 😊', subtitle: 'I really like you, would love to spend time together 💫'},
  {title: 'Are you sure? 😢', subtitle: 'It would mean a lot to me...'},
  {title: 'Please!!!! Say yes!!! 🙏🥺', subtitle: "I'll make it special,promise!"},
  {title: "I'm sad now... 😭", subtitle: 'This hurts ,please reconsider.'}
];
let evasiveEnabled = false;

// Initialize top gif and texts
if (topGif) {
  topGif.src = gifSequence[0];
  topGif.setAttribute('role','img');
  topGif.setAttribute('aria-label','Cute animation. Click to pause or resume.');
  topGif.addEventListener('click', () => {
    topGif.classList.toggle('paused');
    topGif.setAttribute('aria-pressed', topGif.classList.contains('paused'));
  });
}
if (mainQuestion) mainQuestion.innerText = questionSequence[0].title;
if (subtitleEl) subtitleEl.innerText = questionSequence[0].subtitle;

// Helper to get a safe random position
function randomPosForBtn(btn, margin = 12) {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const rect = btn.getBoundingClientRect();
  const maxX = Math.max(vw - rect.width - margin, margin);
  const maxY = Math.max(vh - rect.height - margin, margin);
  const x = Math.floor(Math.random() * (maxX - margin + 1)) + margin;
  const y = Math.floor(Math.random() * (maxY - margin + 1)) + margin;
  return {x,y};
}

// Move on click (used for first two clicks) - transform-based for smooth GPU-accelerated motion
let _lastTarget = null;
function moveNoButtonOnClick() {
  const {x,y} = randomPosForBtn(noBtn, 18);
  const rect = noBtn.getBoundingClientRect();
  // fix the button at its current viewport position so transforms move it from there
  noBtn.style.position = 'fixed';
  noBtn.style.left = rect.left + 'px';
  noBtn.style.top = rect.top + 'px';
  noBtn.style.zIndex = 9999;
  // reset transform baseline
  noBtn.style.transform = 'translate3d(0,0,0)';
  const dx = x - rect.left;
  const dy = y - rect.top;
  _lastTarget = {x,y};
  requestAnimationFrame(()=>{
    noBtn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  });
}

// After transform finishes, add landing animation and 'commit' final position
noBtn.addEventListener('transitionend', (e)=>{
  if (e.propertyName === 'transform' && _lastTarget) {
    noBtn.classList.add('land');
    setTimeout(()=> noBtn.classList.remove('land'), 240);
    // commit final coordinates and clear transform so subsequent moves start clean
    noBtn.style.transform = 'none';
    noBtn.style.left = _lastTarget.x + 'px';
    noBtn.style.top = _lastTarget.y + 'px';
    _lastTarget = null;
  }
});

// Evasive move (only active when enabled)
function moveNoButton() {
  if (!evasiveEnabled) return;
  moveNoButtonOnClick();
}

// small helper to animate and update text
function updateQuestionText(idx){
  const i = Math.min(idx, questionSequence.length - 1);
  if (mainQuestion) {
    mainQuestion.classList.remove('pop');
    void mainQuestion.offsetWidth;
    mainQuestion.innerText = questionSequence[i].title;
    mainQuestion.classList.add('pop');
    setTimeout(()=> mainQuestion.classList.remove('pop'), 700);
  }
  if (subtitleEl) {
    subtitleEl.classList.remove('pop');
    void subtitleEl.offsetWidth;
    subtitleEl.innerText = questionSequence[i].subtitle;
    subtitleEl.classList.add('pop');
    setTimeout(()=> subtitleEl.classList.remove('pop'), 700);
  }
}

// NO button click sequence
function onNoClick(e) {
  noClickCount++;
  const idx = Math.min(noClickCount, gifSequence.length - 1);
  if (topGif) topGif.src = gifSequence[idx];

  // update question text based on click count
  updateQuestionText(noClickCount);

  if (noClickCount < 3) {
    // Clicks 1 and 2: move when clicked and stay not evasive
    moveNoButtonOnClick();
  } else if (noClickCount === 3) {
    // 3rd click: stationary but dramatic shake; enable evasive after a moment
    noBtn.classList.add('shake');
    setTimeout(()=> noBtn.classList.remove('shake'), 900);
    setTimeout(()=> { evasiveEnabled = true; }, 1100);
  } else {
    // After sequence: start evasive behavior
    evasiveEnabled = true;
    moveNoButton();
  }
}

noBtn.addEventListener('click', onNoClick);
noBtn.addEventListener('mouseenter', ()=> { if (evasiveEnabled) moveNoButton(); });
noBtn.addEventListener('touchstart', ()=> { if (evasiveEnabled) moveNoButton(); }, {passive:true});

// Enhanced heart burst for YES — layered hearts and sparkles
function popHearts(x, y, count = 12) {
  const heartChars = ['💖','💕','💘','❤','💝'];
  const colors = ['#ff2a63','#ff6aa1','#ff4d86','#ffd1e0'];
  const container = document.getElementById('hearts') || document.body;

  for (let i=0;i<count;i++){
    const delay = Math.random()*160; // stagger

    // Heart
    const heart = document.createElement('span');
    heart.className = 'pop-heart';
    heart.textContent = heartChars[Math.floor(Math.random()*heartChars.length)];
    const size = 16 + Math.floor(Math.random()*30);
    heart.style.fontSize = size + 'px';
    heart.style.left = (x + (Math.random()-0.5)*80) + 'px';
    heart.style.top = (y + (Math.random()-0.5)*30) + 'px';
    heart.style.color = colors[Math.floor(Math.random()*colors.length)];
    heart.style.zIndex = 10006;
    heart.style.animationDelay = delay + 'ms';
    container.appendChild(heart);
    setTimeout(()=> heart.remove(), 1200 + delay);

    // Sparkle
    if (Math.random() < 0.6) {
      const sp = document.createElement('span');
      sp.className = 'pop-sparkle';
      sp.style.left = (x + (Math.random()-0.5)*60) + 'px';
      sp.style.top = (y + (Math.random()-0.5)*40) + 'px';
      const bg = ['#ffd54d','#fff1b8','#ffd1e0'][Math.floor(Math.random()*3)];
      sp.style.background = bg;
      sp.style.zIndex = 10005;
      sp.style.animationDelay = (delay + 30) + 'ms';
      container.appendChild(sp);
      setTimeout(()=> sp.remove(), 900 + delay);
    }
  }
}

// Modal handling for love hug
const modal = document.getElementById('loveModal');
const modalClose = modal ? modal.querySelector('.modal-close') : null;
function showModal(){ if(!modal) return; modal.classList.add('visible'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal(){ if(!modal) return; modal.classList.remove('visible'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

// Image modal (paged sets)
const imageModal = document.getElementById('imageModal');
const imageModalClose = imageModal ? imageModal.querySelector('.modal-close') : null;
const imageGrid = document.getElementById('imageGrid');
const prevSetBtn = document.getElementById('prevSetBtn');
const nextSetBtn = document.getElementById('nextSetBtn');

const imageSets = [
  { id: 'main', editable: true, defaults: ['1.jpg','2.jpg','3.jpg'] },
  { id: 'rb', editable: false, defaults: ['RB1.jpg','RB2.jpg','RB3.jpg','RB4.jpg'] }
];
let currentImagePage = 0;

function showImageModal(){ if(!imageModal) return; currentImagePage = 0; renderImageGrid(currentImagePage); imageModal.classList.add('visible'); imageModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeImageModal(){ if(!imageModal) return; imageModal.classList.remove('visible'); imageModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
if (imageModalClose) imageModalClose.addEventListener('click', closeImageModal);
if (imageModal) imageModal.addEventListener('click', (e)=>{ if (e.target === imageModal) closeImageModal(); });

if (prevSetBtn) prevSetBtn.addEventListener('click', ()=>{ if (currentImagePage>0){ currentImagePage--; renderImageGrid(currentImagePage); } });
if (nextSetBtn) nextSetBtn.addEventListener('click', ()=>{ if (currentImagePage < imageSets.length - 1){ currentImagePage++; renderImageGrid(currentImagePage); } else { currentImagePage = 0; renderImageGrid(currentImagePage); } });

// Small envelope inside the letter: show/collapse images (unchanged behavior)
const envelopeBtn = document.querySelector('.envelope-btn');
const envelopeDisplay = document.querySelector('.envelope-display');
function clearEnvelopePhotos(){ const p = document.querySelector('.envelope-photos'); if (!p) return; p.innerHTML = ''; }

function emergeImages(){
  // prefer local images if present, otherwise fall back to packaged 1.jpg,2.jpg,3.jpg
  const arr = JSON.parse(localStorage.getItem('ask_images')||'[]').filter(Boolean);
  const files = arr.length ? arr.slice(0,3) : ['1.jpg','2.jpg','3.jpg'];
  const photos = document.querySelector('.envelope-photos');
  if (!photos || !envelopeDisplay) return;
  if (envelopeDisplay.classList.contains('open')){ // already open -> collapse
    const imgs = photos.querySelectorAll('img');
    imgs.forEach((img, i)=>{ img.style.transform = 'translate3d(-50%,-50%,0) scale(.6) rotate(0deg)'; img.style.opacity = '0'; });
    setTimeout(()=>{ clearEnvelopePhotos(); envelopeDisplay.classList.remove('open'); }, 420);
    return;
  }

  envelopeDisplay.classList.add('open');
  // create images and animate them out with stagger
  clearEnvelopePhotos();
  const positions = [{x:-74,y:-96,rot:-8},{x:0,y:-122,rot:0},{x:74,y:-96,rot:8}];
  files.slice(0,3).forEach((src,i)=>{
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Image ${i+1}`;
    img.setAttribute('aria-hidden','true');
    img.style.objectFit = 'cover';
    photos.appendChild(img);
    // staggered animation
    setTimeout(()=>{
      const pos = positions[i] || {x:(i-1)*70,y:-100,rot: (i-1)*6};
      img.style.transform = `translate3d(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px), 0) rotate(${pos.rot}deg) scale(1)`;
      img.style.opacity = '1';
    }, 80 + i*120);
  });
}

if (envelopeBtn) envelopeBtn.addEventListener('click', showImageModal);

// helper: render a dynamic image grid for the current page
function renderImageGrid(page){
  const set = imageSets[page] || imageSets[0];
  const defaults = set.defaults || [];
  const arr = JSON.parse(localStorage.getItem('ask_images')||'[]').filter(Boolean);
  // when page 0 (main) prefer stored images, otherwise use defaults for that set
  const files = (page === 0 && arr.length) ? arr : defaults;

  // build HTML for slots
  imageGrid.innerHTML = '';
  files.forEach((src, i)=>{
    const idx = i;
    const slot = document.createElement('div');
    slot.className = 'image-slot';
    slot.dataset.index = idx;

    const inner = document.createElement('div');
    inner.className = 'slot-inner';

    const img = document.createElement('img');
    img.className = 'slot-img';
    img.alt = `Image ${i+1}`;
    img.src = src || '';
    if (src) img.style.display = 'block';
    inner.appendChild(img);
    slot.appendChild(inner);

    // if editable (main page) add upload input and remove button
    if (set.editable){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.className = 'img-upload';
      slot.appendChild(input);

      const rem = document.createElement('button');
      rem.className = 'remove-img';
      rem.type = 'button';
      rem.textContent = 'Remove';
      slot.appendChild(rem);
    }

    const label = document.createElement('div');
    label.className = 'slot-label';
    label.textContent = (i+1).toString();
    slot.appendChild(label);

    imageGrid.appendChild(slot);
  });

  // Update prev/next button states
  if (prevSetBtn) prevSetBtn.disabled = (currentImagePage === 0);
  if (nextSetBtn) nextSetBtn.disabled = false;

  // Update modal title/description per set
  const titleEl = document.getElementById('imageModalTitle');
  const descEl = document.getElementById('imageModalDesc');
  if (titleEl) titleEl.innerText = 'Our Memories';
  if (descEl) {
    if (page === 0) descEl.innerText = 'Everything begins somewhere — and here is where our memories start. These are the moments we share that make us who we are.';
    else if (page === 1) descEl.innerText = 'We played our hearts out — whether it was Roblox or Mobile Legends, we shared our time, our laughs, and our stories.';
    else descEl.innerText = '';
  }

  // attach handlers for uploads/removes if editable
  if (set.editable){ setupImageSlotHandlers(); }
}

// upload previews and remove
function setupImageSlotHandlers(){
  document.querySelectorAll('.img-upload').forEach(input=>{
    // avoid duplicate listeners by cloning node technique
    const newInput = input.cloneNode();
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('change', (e)=>{
      const file = e.target.files && e.target.files[0];
      const slot = e.target.closest('.image-slot');
      const img = slot.querySelector('.slot-img');
      if (file){
        const reader = new FileReader();
        reader.onload = ()=>{
          img.src = reader.result;
          img.style.display = 'block';
          slot.classList.add('has-image');
          saveImages();
        };
        reader.readAsDataURL(file);
      }
    });
  });

  document.querySelectorAll('.remove-img').forEach(btn=>{
    // replace to clear old handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e)=>{
      const slot = e.target.closest('.image-slot');
      const img = slot.querySelector('.slot-img');
      const input = slot.querySelector('.img-upload');
      img.src = '';
      img.style.display = 'none';
      slot.classList.remove('has-image');
      if (input) input.value = '';
      saveImages();
    });
  });
}

function saveImages(){
  const slots = [...document.querySelectorAll('.image-slot')];
  const arr = slots.map(s=>{ const img = s.querySelector('.slot-img'); return img && img.src ? img.src : null });
  localStorage.setItem('ask_images', JSON.stringify(arr));
}

function loadImages(){
  // retained for backward compatibility: render current page
  renderImageGrid(currentImagePage || 0);
}

// Global Escape handler closes any open modal
function closeAll(){ closeModal(); closeImageModal(); }
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeAll(); });

// Envelope placement feature removed (big envelope modal and place button)

// YES button flow: show kiss gif, then modal with love hug
yesBtn.addEventListener('click', (e)=>{
  if (topGif) topGif.src = 'kissgif.gif';

  // Update main page text to match the joyful mood
  if (mainQuestion) {
    mainQuestion.classList.remove('pop');
    void mainQuestion.offsetWidth;
    mainQuestion.innerText = 'Yes! 💖';
    mainQuestion.classList.add('pop');
    setTimeout(()=> mainQuestion.classList.remove('pop'), 700);
  }
  if (subtitleEl) {
    subtitleEl.classList.remove('pop');
    void subtitleEl.offsetWidth;
    subtitleEl.innerText = "I'm so happy, let's make plans! 🥰";
    subtitleEl.classList.add('pop');
    setTimeout(()=> subtitleEl.classList.remove('pop'), 700);
  }

  const rect = e.target.getBoundingClientRect();
  popHearts(rect.left + rect.width/2, rect.top + rect.height/2, 14);
  setTimeout(()=> showModal(), 700);
});

// Background raining hearts and flowers
const bgDecor = document.getElementById('bgDecor');
let _bgRainInterval = null;
function startRainingBackground(){
  if (!bgDecor) return;
  const hearts = ['💖','💕','💘','❤','💝'];
  const flowers = ['🌸','🌺','🌼','🌷'];
  const maxOnScreen = 28;
  _bgRainInterval = setInterval(()=>{
    try{
      if (bgDecor.children.length > maxOnScreen) return;
      const el = document.createElement('span');
      const isFlower = Math.random() < 0.18; // mostly hearts
      el.className = 'bg-deco ' + (isFlower ? 'bg-flower' : 'bg-heart');
      el.textContent = isFlower ? flowers[Math.floor(Math.random()*flowers.length)] : hearts[Math.floor(Math.random()*hearts.length)];
      const size = 18 + Math.floor(Math.random()*48);
      el.style.fontSize = size + 'px';
      el.style.left = Math.floor(Math.random()*96) + 'vw';
      el.style.top = '-8vh';
      const duration = 4200 + Math.floor(Math.random()*6400);
      el.style.animation = `fall ${duration}ms linear, sway ${1200 + Math.floor(Math.random()*1600)}ms ease-in-out infinite`;
      el.style.opacity = (0.45 + Math.random()*0.6).toFixed(2);
      bgDecor.appendChild(el);
      // remove after animation completes
      setTimeout(()=>{ if (el && el.parentNode) el.parentNode.removeChild(el); }, duration + 100);
    }catch(e){/* ignore errors */}
  }, 520);
}

// start automatically but allow graceful degradation on low-power devices (rely on requestAnimationFrame slow-down)
if (typeof window !== 'undefined'){
  // start after a short delay so UI loads first
  setTimeout(startRainingBackground, 300);
}

