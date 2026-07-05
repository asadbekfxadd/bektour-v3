/* ============================================================
   BEK TOUR — автогалерея (фото + видео)
   Как работает: кладёшь файлы в папку с именами 1.jpg, 2.mp4, 3.webp...
   Скрипт сам находит всё и показывает на странице.
   Ничего в коде менять не нужно!
   ============================================================ */

const GALLERY_MAX_ITEMS = 30; // максимум файлов в одной папке
const GALLERY_IMG_EXT = ['webp', 'jpg', 'jpeg', 'png'];
const GALLERY_VIDEO_EXT = ['mp4', 'webm'];

/**
 * Проверяет, существует ли картинка по URL
 */
function imageExists(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Проверяет, существует ли видео по URL (лёгкий HEAD-запрос)
 */
function videoExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);
}

/**
 * Находит все файлы в папке (1, 2, 3... до первого пропуска).
 * Для каждого номера пробует сначала фото, потом видео.
 * Возвращает массив вида: [{url, type: 'image'|'video'}, ...]
 */
async function findMedia(folder) {
  const items = [];
  for (let i = 1; i <= GALLERY_MAX_ITEMS; i++) {
    let found = null;

    for (const ext of GALLERY_IMG_EXT) {
      const url = `${folder}/${i}.${ext}`;
      if (await imageExists(url)) { found = { url, type: 'image' }; break; }
    }
    if (!found) {
      for (const ext of GALLERY_VIDEO_EXT) {
        const url = `${folder}/${i}.${ext}`;
        if (await videoExists(url)) { found = { url, type: 'video' }; break; }
      }
    }

    if (!found) break; // пропуск в нумерации = конец
    items.push(found);
  }
  return items;
}

/**
 * Заполняет галерею фото и видео.
 * Использование в HTML:
 *   <div class="auto-gallery" data-folder="images/cities/samarkand"></div>
 */
async function initGallery(el) {
  const folder = el.dataset.folder;
  if (!folder) return;

  const items = await findMedia(folder);
  if (items.length === 0) {
    el.style.display = 'none'; // нет файлов — скрываем блок
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
        <img src="${item.url}" alt="Фото ${idx + 1}" loading="lazy">
      </div>`;
  }).join('');
}

/**
 * Простой лайтбокс (фото на весь экран по клику)
 */
function openLightbox(url) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `<img src="${url}" alt=""><span class="lightbox-close">&times;</span>`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

/**
 * Hero-слайдер: берёт фото из images/hero и крутит их.
 * Если в папке hero лежит видео (например 1.mp4) — оно станет
 * фоновым видео баннера вместо слайдера.
 */
async function initHeroSlider() {
  const hero = document.querySelector('[data-hero-slider]');
  if (!hero) return;

  const items = await findMedia('images/hero');
  if (items.length === 0) return;

  // Если первый файл — видео, делаем видеофон
  if (items[0].type === 'video') {
    const video = document.createElement('video');
    video.src = items[0].url;
    video.autoplay = true;
    video.muted = true;       // без mute автоплей не сработает
    video.loop = true;
    video.playsInline = true;
    video.className = 'hero-bg-video';
    hero.prepend(video);
    return;
  }

  // Иначе — слайдер из фото
  const photos = items.filter(i => i.type === 'image').map(i => i.url);
  let current = 0;
  const setBg = () => {
    hero.style.backgroundImage = `url('${photos[current]}')`;
  };
  setBg();

  if (photos.length > 1) {
    setInterval(() => {
      current = (current + 1) % photos.length;
      setBg();
    }, 5000); // смена каждые 5 секунд
  }
}

/* Запуск при загрузке страницы */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.auto-gallery').forEach(initGallery);
  initHeroSlider();
});
