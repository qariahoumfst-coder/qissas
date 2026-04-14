/* ═══════════════════════════════
   read.js — Story reader
═══════════════════════════════ */

let currentStoryId = null;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadStory();
  initDeleteModal();
});

function initNav() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
  }
}

function loadStory() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const wrapper = document.getElementById('readWrapper');

  if (!id) {
    wrapper.innerHTML = notFoundHTML();
    return;
  }

  const story = DataStore.getById(id);
  if (!story) {
    wrapper.innerHTML = notFoundHTML();
    return;
  }

  currentStoryId = id;
  document.title = 'قصص — ' + story.title;

  const words = story.words || countWords(story.content);
  const readMin = Math.ceil(words / 200) || 1;
  const catBadge = catClass(story.category);

  wrapper.innerHTML = `
    <a href="../index.html" class="read-back">← العودة إلى الرئيسية</a>
    <article class="read-article">
      <header class="read-article-header">
        <span class="read-cat-badge ${catBadge}">${catEmoji(story.category)} ${story.category}</span>
        <h1 class="read-title">${escHtml(story.title)}</h1>
        <div class="read-meta">
          <span>📅 ${formatDate(story.date)}</span>
          <span>📝 ${words} كلمة</span>
          <span>⏱️ ~${readMin} دقيقة للقراءة</span>
        </div>
      </header>

      <div class="read-body">
        ${story.excerpt ? `<p class="read-excerpt">${escHtml(story.excerpt)}</p>` : ''}
        <div class="read-content">${escHtml(story.content)}</div>
      </div>

      <div class="read-actions">
        <button class="btn-primary" onclick="editStory('${story.id}')">✏️ تعديل القصة</button>
        <button class="btn-secondary btn-danger-ghost" onclick="openDeleteModal()">🗑️ حذف</button>
        <button class="btn-secondary" onclick="window.location.href='../index.html'">← الرئيسية</button>
      </div>
    </article>
  `;

  // Inject ghost danger style
  const s = document.createElement('style');
  s.textContent = `.btn-danger-ghost { color: var(--red) !important; border-color: var(--red) !important; }
  .btn-danger-ghost:hover { background: #fff1ee !important; }`;
  document.head.appendChild(s);
}

function notFoundHTML() {
  return `
    <div style="text-align:center;padding:5rem 1rem;color:var(--gray);">
      <div style="font-size:3rem;margin-bottom:1rem;">📭</div>
      <p style="font-size:1.1rem;margin-bottom:1.5rem;">لم يتم العثور على القصة.</p>
      <a href="../index.html" class="btn-primary">← العودة إلى الرئيسية</a>
    </div>
  `;
}

function editStory(id) {
  window.location.href = 'add.html?id=' + id;
}

// ── Delete modal ──
function openDeleteModal() {
  document.getElementById('deleteModal').style.display = 'flex';
}
function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
}

function initDeleteModal() {
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (!currentStoryId) return;
    DataStore.delete(currentStoryId);
    showToast('تم حذف القصة بنجاح', 'success');
    setTimeout(() => window.location.href = '../index.html', 1000);
  });
  // Close on overlay click
  document.getElementById('deleteModal').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
  });
}

// ── Utils ──
function catEmoji(cat) {
  const map = {
    'إسلامية': '🕌', 'تاريخية': '🏛️', 'رومانسية': '❤️',
    'مغامرات': '⚔️', 'خيال علمي': '🚀', 'أطفال': '🌟',
    'رعب': '👻', 'اجتماعية': '🤝', 'أخرى': '📌'
  };
  return map[cat] || '📖';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function showToast(msg, type = '') {
  let toast = document.getElementById('__toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '__toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}
