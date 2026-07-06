/* ============================================================
   BEK TOUR - auto gallery (photo + video)
   Photos: put files named 1.jpg, 2.mp4, 3.webp... in a folder
   Hero: images/hero/1.webp = slide 1 bg, 2.jpg = slide 2 bg...
   ============================================================ */

const GALLERY_MAX_ITEMS = 30;
const GALLERY_IMG_EXT = ['webp', 'jpg', 'jpeg', 'png'];
const GALLERY_VIDEO_EXT = ['mp4', 'webm'];

function imageExists(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function videoExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);
}

async function findImageByNumber(folder, n) {
  for (const ext of GALLERY_IMG_EXT) {
    const url = `${folder}/${n}.${ext}`;
    if (await imageExists(url)) return url;
  }
  return null;
}

async function findMedia(folder) {
  const items = [];
  for (let i = 1; i <= GALLERY_MAX_ITEMS; i++) {
    let found = null;

    const imgUrl = await findImageByNumber(folder, i);
    if (imgUrl) found = { url: imgUrl, type: 'image' };

    if (!found) {
      for (const ext of GALLERY_VIDEO_EXT) {
        const url = `${folder}/${i}.${ext}`;
        if (await videoExists(url)) { found = { url, type: 'video' }; break; }
      }
    }

    if (!found) break;
    items.push(found);
  }
  return items;
}

async function initGallery(el) {
  const folder = el.dataset.folder;
  if (!folder) return;

  const items = await findMedia(folder);
  if (items.length === 0) {
    el.style.display = 'none';
    return;
  }

  el.innerHTML = items.map((item, idx) => {
    if (item.type === 'video') {
      return `
        <div class="gallery-item gallery-video">
          <video src="${item.url}" controls preload="metadata" playsinline></video>
        </div>`;
    }
    return `
      <div class="gallery-item" onclick="openLightbox('${item.url}')">
        <img src="${item.url}" alt="Photo ${idx + 1}" loading="lazy">
      </div>`;
  }).join('');
}

function openLightbox(url) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `<img src="${url}" alt=""><span class="lightbox-close">&times;</span>`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

/* Hero backgrounds:
   images/hero/1.webp -> slide 1, 2.jpg -> slide 2, 3.jpg -> slide 3.
   Missing number = slide keeps its current background. */
async function initHeroBackgrounds() {
  const slides = document.querySelectorAll('#heroSlider .hero-slide-bg');
  if (!slides.length) return;

  for (let i = 0; i < slides.length; i++) {
    const url = await findImageByNumber('images/hero', i + 1);
    if (url) {
      slides[i].style.backgroundImage = `url('${url}')`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.auto-gallery').forEach(initGallery);
  initHeroBackgrounds();
});
