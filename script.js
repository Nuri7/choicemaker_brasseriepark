// BRASSERIE PARK KEUZE MAKER — Main Application Logic

// --- APP STATE ---
const state = {
  currentScreen: 'landing', quizStep: 0, answers: {}, menuItems: [],
  questions: [...DEFAULT_QUIZ_QUESTIONS], scoringRules: { ...DEFAULT_SCORING_RULES },
  recommendation: null, deferredInstallPrompt: null
};

// --- MENU PARSER ---
async function loadMenuFiles() {
  const items = [];
  for (const filePath of MENU_FILES) {
    try {
      const filename = filePath.split('/').pop();
      let content = localStorage.getItem('bp_menu_' + filename);
      if (!content) {
        const response = await fetch(filePath);
        if (!response.ok) continue;
        content = await response.text();
      }
      items.push(...parseMenuMarkdown(content, filename));
    } catch (err) { console.warn('Error loading menu:', filePath, err); }
  }
  return items;
}

function parseMenuMarkdown(content, filename) {
  const items = []; const lines = content.split('\n');
  let currentSection = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;
    if (line.startsWith('## ')) { currentSection = line.replace('## ', '').trim(); continue; }
    if (line.startsWith('### ')) {
      const sub = line.replace('### ', '').trim();
      // Merge subsection into section for tag lookup (e.g. "BIER TAP")
      const parentSection = currentSection.split(/\n/)[0];
      currentSection = parentSection + ' ' + sub;
      continue;
    }
    if (line.startsWith('+') || line.startsWith('*') && !line.startsWith('**')) continue;
    if (!line.startsWith('**')) continue;
    const item = parseMenuLine(line, lines[i + 1], currentSection, filename);
    if (item) { item.tags = getItemTags(item, currentSection); items.push(item); }
  }
  return items;
}

function parseMenuLine(line, nextLine, section, filename) {
  // Format 1: **Name - Price** (food style)
  const foodMatch = line.match(/^\*\*(.+?)\s*-\s*([\d,\.]+(?:\/[\d,\.]+)?)\*\*\s*$/);
  if (foodMatch) {
    const desc = (nextLine && !nextLine.startsWith('**') && !nextLine.startsWith('##') && !nextLine.startsWith('#') && nextLine.trim())
      ? nextLine.trim().replace(/^\(.*?\)\s*-?\s*/, '') : '';
    return { name: foodMatch[1].trim(), price: foodMatch[2].trim(), description: desc,
      section, filename, type: filename.includes('dranken') ? 'drink' : 'food' };
  }
  // Format 2: **Name** description - Price (drink style)
  const drinkMatch = line.match(/^\*\*(.+?)\*\*\s*(.+?)?\s*-\s*([\d,\.]+(?:\/[\d,\.]+)?)\s*$/);
  if (drinkMatch) {
    return { name: drinkMatch[1].trim(), price: drinkMatch[3].trim(),
      description: (drinkMatch[2] || '').trim(), section, filename,
      type: filename.includes('dranken') ? 'drink' : 'food' };
  }
  return null;
}

function getItemTags(item, section) {
  const tags = new Set([item.type]);
  const sectionKey = Object.keys(SECTION_TAG_MAP).find(key =>
    section.toUpperCase().includes(key.replace(/\\/g, '').toUpperCase())
  );
  if (sectionKey) SECTION_TAG_MAP[sectionKey].forEach(t => tags.add(t));
  const text = `${item.name} ${item.description}`.toLowerCase();
  KEYWORD_TAGS.forEach(({ pattern, tags: kwTags }) => {
    if (pattern.test(text)) kwTags.forEach(t => tags.add(t));
  });
  return Array.from(tags);
}

// --- SCORING ENGINE ---
function calculateRecommendation(answers, menuItems) {
  const rules = state.scoringRules;
  const scored = menuItems.map(item => {
    let score = 0;
    Object.entries(answers).forEach(([qId, answer]) => {
      const qRules = rules[qId];
      if (!qRules || !qRules[answer]) return;
      Object.entries(qRules[answer]).forEach(([tag, weight]) => {
        if (item.tags.includes(tag)) score += weight;
      });
    });
    return { ...item, score };
  });
  const sortFn = (a, b) => b.score === a.score ? Math.random() - 0.5 : b.score - a.score;
  const food = scored.filter(i => i.type === 'food' && i.score > 0).sort(sortFn);
  const drink = scored.filter(i => i.type === 'drink' && i.score > 0).sort(sortFn);
  return { food: food[0] || null, drink: drink[0] || null, allFood: food.slice(0, 5), allDrinks: drink.slice(0, 5) };
}

function generateExplanation(answers, food, drink) {
  const parts = [];
  if (answers.moment && MOMENT_COPY[answers.moment]) parts.push(MOMENT_COPY[answers.moment]);
  if (answers.mood && MOOD_COPY[answers.mood]) parts.push(MOOD_COPY[answers.mood]);
  if (food) { parts.push(HUNGER_COPY[answers.hunger] || ''); parts.push(`${food.name} past hier perfect bij.`); }
  if (drink && DRINK_COPY[answers.drink]) parts.push(DRINK_COPY[answers.drink]);
  parts.push('Geniet ervan! 🌿');
  return parts.filter(Boolean).join(' ');
}

// --- UI CONTROLLER ---
function showScreen(screenId) {
  const cur = document.querySelector('.screen.active');
  const next = document.getElementById('screen-' + screenId);
  if (!next || cur === next) return;
  if (cur) { cur.classList.add('slide-out'); setTimeout(() => cur.classList.remove('active', 'slide-out'), 300); }
  setTimeout(() => { next.classList.add('active'); window.scrollTo({ top: 0, behavior: 'instant' }); }, cur ? 150 : 0);
  state.currentScreen = screenId;
}

function renderQuizQuestion() {
  const q = state.questions[state.quizStep]; if (!q) return;
  const step = state.quizStep + 1, total = state.questions.length;
  document.getElementById('quiz-step-label').textContent = `Vraag ${step} van ${total}`;
  document.getElementById('quiz-step-fraction').textContent = `${step}/${total}`;
  document.getElementById('quiz-progress').style.width = `${(step / total) * 100}%`;
  document.getElementById('quiz-emoji').textContent = q.emoji;
  document.getElementById('quiz-emoji').className = 'text-5xl mb-4 emoji-bounce';
  document.getElementById('quiz-question').textContent = q.question;
  document.getElementById('btn-back').style.visibility = state.quizStep > 0 ? 'visible' : 'hidden';
  const container = document.getElementById('quiz-options');
  container.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option glass-card px-5 py-4 text-left flex items-center gap-4 cursor-pointer border border-white/5 hover:border-park-400/30';
    btn.setAttribute('data-answer', opt.label);
    if (state.answers[q.id] === opt.label) btn.classList.add('selected');
    btn.innerHTML = `<span class="text-2xl flex-shrink-0">${opt.emoji}</span><span class="font-medium text-base">${opt.label}</span>`;
    btn.addEventListener('click', () => handleAnswer(q.id, opt.label));
    btn.style.opacity = '0'; btn.style.transform = 'translateY(10px)';
    setTimeout(() => { btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }, 50 + idx * 60);
    container.appendChild(btn);
  });
}

function handleAnswer(questionId, answer) {
  state.answers[questionId] = answer;
  document.querySelectorAll('#quiz-options .btn-option').forEach(btn => {
    const sel = btn.dataset.answer === answer;
    btn.classList.toggle('selected', sel);
  });
  trackEvent('question_answered', { question: questionId, answer });
  setTimeout(() => {
    if (state.quizStep < state.questions.length - 1) { state.quizStep++; renderQuizQuestion(); }
    else showResults();
  }, 350);
}

function showResults() {
  const rec = calculateRecommendation(state.answers, state.menuItems);
  state.recommendation = rec;
  if (rec.food) {
    document.getElementById('result-food-name').textContent = rec.food.name;
    document.getElementById('result-food-desc').textContent = rec.food.description || rec.food.section;
    document.getElementById('result-food-price').textContent = `€ ${rec.food.price}`;
    document.getElementById('result-food-emoji').textContent = getFoodEmoji(rec.food);
  } else {
    document.getElementById('result-food-name').textContent = 'Vraag de bediening!';
    document.getElementById('result-food-desc').textContent = 'Onze bediening helpt je graag.';
    document.getElementById('result-food-price').textContent = '';
  }
  if (rec.drink) {
    document.getElementById('result-drink-name').textContent = rec.drink.name;
    document.getElementById('result-drink-desc').textContent = rec.drink.description || rec.drink.section;
    document.getElementById('result-drink-price').textContent = `€ ${rec.drink.price}`;
    document.getElementById('result-drink-emoji').textContent = getDrinkEmoji(rec.drink);
  } else {
    document.getElementById('result-drink-name').textContent = 'Vraag onze bediening!';
    document.getElementById('result-drink-desc').textContent = 'Zij weten precies wat bij je past.';
    document.getElementById('result-drink-price').textContent = '';
  }
  document.getElementById('result-explanation').textContent = generateExplanation(state.answers, rec.food, rec.drink);
  document.getElementById('staff-food').textContent = rec.food ? rec.food.name : '—';
  document.getElementById('staff-drink').textContent = rec.drink ? rec.drink.name : '—';
  showScreen('results');
  launchConfetti();
  trackEvent('quiz_completed', { food: rec.food?.name, drink: rec.drink?.name, answers: state.answers });
  recordCompletion(rec);
}

function getFoodEmoji(item) {
  if (item.tags.includes('breakfast')) return '🥣';
  if (item.tags.includes('sandwich')) return '🥪';
  if (item.tags.includes('salad')) return '🥗';
  if (item.tags.includes('bge') || item.tags.includes('burger')) return '🍔';
  if (item.tags.includes('dessert')) return '🍰';
  if (item.tags.includes('snack') || item.tags.includes('borrel')) return '🍿';
  if (item.tags.includes('soup')) return '🍲';
  if (item.tags.includes('shared')) return '🫕';
  if (item.tags.includes('fish')) return '🐟';
  if (item.tags.includes('starter')) return '🥗';
  return '🍽️';
}

function getDrinkEmoji(item) {
  if (item.tags.includes('coffee-tea')) return '☕';
  if (item.tags.includes('beer') || item.tags.includes('beer-0')) return '🍺';
  if (item.tags.includes('wine') || item.tags.includes('bubbels')) return '🍷';
  if (item.tags.includes('cocktail')) return '🍸';
  if (item.tags.includes('mocktail')) return '🍹';
  if (item.tags.includes('smoothie')) return '🥤';
  return '🥤';
}

// --- CONFETTI ---
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#C8963E', '#E0B060', '#A87A2F', '#FFD699', '#FFFFFF', '#4A7C3F', '#5A9C4F'];
  const shapes = ['●', '■', '▲', '★', '🌿', '🍃'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (8 + Math.random() * 14) + 'px';
    p.style.setProperty('--duration', (2 + Math.random() * 2) + 's');
    p.style.setProperty('--delay', (Math.random() * 0.8) + 's');
    p.style.setProperty('--rotation', (360 + Math.random() * 720) + 'deg');
    p.style.color = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(p);
  }
  setTimeout(() => container.innerHTML = '', 4000);
}

// --- SHARE/COPY ---
function getShareText() {
  const r = state.recommendation; if (!r) return '';
  let t = '🌿 Mijn Brasserie Park Keuze!\n\n';
  if (r.food) t += `🍽️ Eten: ${r.food.name}\n`;
  if (r.drink) t += `🥤 Drinken: ${r.drink.name}\n`;
  t += '\n✨ Gedaan met de Brasserie Park Keuze Maker!\n📍 Houtkamp, Leiderdorp';
  return t;
}

async function copyToClipboard() {
  try { await navigator.clipboard.writeText(getShareText()); showToast('Gekopieerd! 📋'); trackEvent('result_copied'); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = getShareText(); ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('Gekopieerd! 📋'); }
}

async function shareResult() {
  if (navigator.share) {
    try { await navigator.share({ title: 'Mijn Brasserie Park Keuze', text: getShareText(), url: window.location.href }); trackEvent('result_shared'); }
    catch (e) { if (e.name !== 'AbortError') copyToClipboard(); }
  } else copyToClipboard();
}

// --- TOAST ---
function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// --- STAFF OVERLAY ---
function showStaffOverlay() { const o = document.getElementById('staff-overlay'); o.classList.remove('hidden'); o.style.display = 'flex'; trackEvent('staff_view_shown'); }
function hideStaffOverlay() { const o = document.getElementById('staff-overlay'); o.classList.add('hidden'); o.style.display = 'none'; }

// --- PWA ---
function setupPWA() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW fail:', e));
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); state.deferredInstallPrompt = e;
    setTimeout(() => { const b = document.getElementById('install-banner'); if (b && !localStorage.getItem('bp_install_dismissed')) b.classList.add('show'); }, 3000);
  });
  const ib = document.getElementById('btn-install');
  if (ib) ib.addEventListener('click', async () => {
    if (state.deferredInstallPrompt) { state.deferredInstallPrompt.prompt(); await state.deferredInstallPrompt.userChoice; state.deferredInstallPrompt = null; }
    document.getElementById('install-banner').classList.remove('show');
  });
  const db = document.getElementById('btn-dismiss-install');
  if (db) db.addEventListener('click', () => { document.getElementById('install-banner').classList.remove('show'); localStorage.setItem('bp_install_dismissed', 'true'); });
}

// --- ANALYTICS ---
function trackEvent(name, props = {}) {
  try { if (window.posthog && typeof window.posthog.capture === 'function') window.posthog.capture(name, { ...props, app: 'brasserie-park-choice-maker' }); } catch (e) {}
  console.log('📊 Event:', name, props);
}

// --- STATS ---
function recordCompletion(rec) {
  try {
    const s = JSON.parse(localStorage.getItem('bp_stats') || '{}');
    if (!s.completions) s.completions = [];
    s.completions.push({ timestamp: new Date().toISOString(), food: rec.food?.name || null, drink: rec.drink?.name || null, answers: { ...state.answers } });
    localStorage.setItem('bp_stats', JSON.stringify(s));
  } catch (e) { console.warn('Stats save error:', e); }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  document.getElementById('btn-start-quiz').addEventListener('click', () => {
    state.quizStep = 0; state.answers = {}; showScreen('quiz'); renderQuizQuestion(); trackEvent('quiz_started');
  });
  document.getElementById('btn-back').addEventListener('click', () => {
    if (state.quizStep > 0) { state.quizStep--; renderQuizQuestion(); } else showScreen('landing');
  });
  document.getElementById('btn-show-staff').addEventListener('click', showStaffOverlay);
  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
  document.getElementById('btn-share').addEventListener('click', shareResult);
  document.getElementById('btn-restart').addEventListener('click', () => {
    state.quizStep = 0; state.answers = {}; state.recommendation = null; showScreen('landing'); trackEvent('quiz_restarted');
  });
  document.getElementById('btn-close-staff').addEventListener('click', hideStaffOverlay);
  document.getElementById('staff-overlay').addEventListener('click', e => { if (e.target === document.getElementById('staff-overlay')) hideStaffOverlay(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.getElementById('staff-overlay'); if (o.style.display !== 'none' && !o.classList.contains('hidden')) hideStaffOverlay(); } });
}

// --- CUSTOM SETTINGS ---
function loadCustomQuizSettings() {
  try { const q = localStorage.getItem('bp_quiz_questions'); if (q && q.trim().startsWith('[')) state.questions = JSON.parse(q); } catch (e) { state.questions = [...DEFAULT_QUIZ_QUESTIONS]; }
  try { const s = localStorage.getItem('bp_scoring_rules'); if (s && s.trim().startsWith('{')) state.scoringRules = JSON.parse(s); } catch (e) { state.scoringRules = { ...DEFAULT_SCORING_RULES }; }
}

// --- INIT ---
async function init() {
  console.log('🌿 Brasserie Park Keuze Maker — Initializing...');
  loadCustomQuizSettings();
  state.menuItems = await loadMenuFiles();
  console.log(`📋 Loaded ${state.menuItems.length} menu items`);
  if (state.menuItems.length > 0) console.log('Sample:', state.menuItems.slice(0, 3).map(i => ({ name: i.name, type: i.type, tags: i.tags.join(', ') })));
  setupEventListeners();
  setupPWA();
  trackEvent('page_view');
  console.log('✅ Brasserie Park Keuze Maker — Ready!');
}

document.addEventListener('DOMContentLoaded', init);
