/* ═══════════════════════════════
   form.js — Add/Edit story
═══════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForm();
  initCharCounters();
});

function initNav() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
  }
}

function initForm() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  if (editId) {
    // Edit mode
    const story = DataStore.getById(editId);
    if (!story) {
      showToast('القصة غير موجودة', 'error');
      setTimeout(() => window.location.href = '../index.html', 1500);
      return;
    }
    document.getElementById('formTitle').textContent = '✏️ تعديل القصة';
    document.getElementById('formSubtitle').textContent = 'عدّل قصتك وانشرها مجددًا';
    document.getElementById('submitText').textContent = 'حفظ التعديلات';
    document.getElementById('storyId').value = story.id;
    document.getElementById('storyTitle').value = story.title;
    document.getElementById('storyCategory').value = story.category;
    document.getElementById('storyExcerpt').value = story.excerpt || '';
    document.getElementById('storyContent').value = story.content;
    document.title = 'قصص — تعديل: ' + story.title;
    updateCounts();
  }

  document.getElementById('storyForm').addEventListener('submit', handleSubmit);
}

function initCharCounters() {
  const title   = document.getElementById('storyTitle');
  const excerpt = document.getElementById('storyExcerpt');
  const content = document.getElementById('storyContent');

  title.addEventListener('input', () => {
    document.getElementById('titleCount').textContent = title.value.length + '/100';
  });
  excerpt.addEventListener('input', () => {
    document.getElementById('excerptCount').textContent = excerpt.value.length + '/200';
  });
  content.addEventListener('input', () => {
    const words = countWords(content.value);
    document.getElementById('contentCount').textContent = words + ' كلمة';
  });
}

function updateCounts() {
  const title   = document.getElementById('storyTitle');
  const excerpt = document.getElementById('storyExcerpt');
  const content = document.getElementById('storyContent');
  document.getElementById('titleCount').textContent   = title.value.length + '/100';
  document.getElementById('excerptCount').textContent = excerpt.value.length + '/200';
  document.getElementById('contentCount').textContent = countWords(content.value) + ' كلمة';
}

function handleSubmit(e) {
  e.preventDefault();

  const id      = document.getElementById('storyId').value;
  const title   = document.getElementById('storyTitle').value.trim();
  const cat     = document.getElementById('storyCategory').value;
  const excerpt = document.getElementById('storyExcerpt').value.trim();
  const content = document.getElementById('storyContent').value.trim();

  // Validate
  if (!title) { shakeField('storyTitle'); showToast('أدخل عنوان القصة', 'error'); return; }
  if (!cat)   { shakeField('storyCategory'); showToast('اختر التصنيف', 'error'); return; }
  if (!content || content.length < 50) { shakeField('storyContent'); showToast('المحتوى قصير جدًا (50 حرف على الأقل)', 'error'); return; }

  const story = {
    id: id || null,
    title,
    category: cat,
    excerpt: excerpt || content.slice(0, 120) + '...',
    content,
    words: countWords(content)
  };

  DataStore.save(story);

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">✅</span> تم الحفظ!';
  btn.style.background = '#2e6b3e';

  showToast(id ? 'تم تعديل القصة بنجاح' : 'تم نشر القصة بنجاح', 'success');

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 1200);
}

// ── Editor helpers ──
function formatText(cmd) {
  const ta = document.getElementById('storyContent');
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const sel   = ta.value.substring(start, end);
  if (!sel) return;

  let wrapped = sel;
  if (cmd === 'bold')   wrapped = '**' + sel + '**';
  if (cmd === 'italic') wrapped = '_' + sel + '_';

  ta.value = ta.value.substring(0, start) + wrapped + ta.value.substring(end);
  ta.selectionStart = start;
  ta.selectionEnd   = start + wrapped.length;
  ta.focus();
  const words = countWords(ta.value);
  document.getElementById('contentCount').textContent = words + ' كلمة';
}

function insertNewLine() {
  const ta = document.getElementById('storyContent');
  const pos = ta.selectionStart;
  ta.value = ta.value.substring(0, pos) + '\n\n' + ta.value.substring(pos);
  ta.selectionStart = ta.selectionEnd = pos + 2;
  ta.focus();
}

// ── Utils ──
function shakeField(id) {
  const el = document.getElementById(id);
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.style.borderColor = 'var(--red)';
  el.addEventListener('input', () => el.style.borderColor = '', { once: true });
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

// Shake keyframe (injected)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);
