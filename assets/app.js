/* ============================================================
   MortuPro — App JS
   Quiz engine + Chat bubble + Scroll animations
   Pure vanilla JS. No dependencies.
   ============================================================ */

// ── Quiz Engine ────────────────────────────────────────────
const QUIZ_CONFIG = {
  'funeral-home': {
    emoji: '🕊️',
    label: 'Funeral Home',
    subline: 'Dispatch, billing, driver tracking, and escalation — built specifically for funeral homes like yours.',
    stat: '127 funeral homes trust MortuPro',
    param: 'funeral-home'
  },
  'crematory': {
    emoji: '🔥',
    label: 'Crematory',
    subline: 'Streamline every removal, track every transfer, and bill every family — built for crematories.',
    stat: '40+ crematories run on MortuPro',
    param: 'crematory'
  },
  'transport': {
    emoji: '🚐',
    label: 'Transport Company',
    subline: 'Dispatch, routing, partner forwarding, and auto-billing — the operating system for transport companies.',
    stat: '60+ transport operations use MortuPro daily',
    param: 'transport'
  }
};

let activeQuizType = null;

function initQuiz() {
  const tiles = document.querySelectorAll('.quiz-tile');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const type = tile.dataset.type;
      selectQuizType(type, tile);
    });
  });
}

function selectQuizType(type, tile) {
  const config = QUIZ_CONFIG[type];
  if (!config) return;

  activeQuizType = type;

  // Update active tile
  document.querySelectorAll('.quiz-tile').forEach(t => t.classList.remove('active'));
  tile.classList.add('active');

  // Update hero subline
  const subline = document.getElementById('hero-subline');
  if (subline) {
    subline.style.opacity = '0';
    setTimeout(() => {
      subline.textContent = config.subline;
      subline.style.opacity = '1';
    }, 200);
  }

  // Update CTA links with query param
  document.querySelectorAll('a[href*="firstcallremovals.com/onboard"]').forEach(link => {
    link.href = `https://firstcallremovals.com/onboard?type=${config.param}`;
  });

  // Smooth scroll to features
  setTimeout(() => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 300);
}


// ── Chat Bubble State Machine ───────────────────────────────
const CHAT_STATES = {
  HIDDEN: 'hidden',
  INIT: 'init',
  PRICING: 'pricing',
  HOW_IT_WORKS: 'how-it-works',
  TALK: 'talk',
  BROWSING: 'browsing',
  QUALIFY_TYPE: 'qualify-type',
  QUALIFY_DRIVERS: 'qualify-drivers',
  DEMO_FORM: 'demo-form',
  DONE: 'done'
};

const chatState = {
  current: CHAT_STATES.HIDDEN,
  opType: null,
  drivers: null
};

function initChat() {
  const trigger = document.getElementById('chat-trigger');
  const window_ = document.getElementById('chat-window');
  if (!trigger || !window_) return;

  // Show after 12 seconds
  const showTimer = setTimeout(() => showChatTrigger(), 12000);

  // Or after scrolling past features
  const featureSection = document.getElementById('features');
  if (featureSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          clearTimeout(showTimer);
          showChatTrigger();
          observer.disconnect();
        }
      });
    }, { threshold: 0 });
    observer.observe(featureSection);
  }

  trigger.addEventListener('click', toggleChat);
}

function showChatTrigger() {
  const trigger = document.getElementById('chat-trigger');
  if (trigger) trigger.classList.add('visible');
}

function toggleChat() {
  const trigger = document.getElementById('chat-trigger');
  const window_ = document.getElementById('chat-window');
  const isOpen = window_.classList.contains('open');

  if (isOpen) {
    window_.classList.remove('open');
    trigger.classList.remove('open');
    trigger.textContent = '💬';
  } else {
    window_.classList.add('open');
    trigger.classList.add('open');
    trigger.innerHTML = '<span style="font-size:1rem">✕</span>';
    if (chatState.current === CHAT_STATES.HIDDEN) {
      chatState.current = CHAT_STATES.INIT;
      renderChatState();
    }
  }
}

function renderChatState() {
  const messages = document.getElementById('chat-messages');
  const options = document.getElementById('chat-options');
  if (!messages || !options) return;

  switch (chatState.current) {
    case CHAT_STATES.INIT:
      addBotMessage("Hey 👋 — what brings you to MortuPro today?");
      setTimeout(() => {
        renderOptions([
          { text: '💰 See pricing', action: () => { chatState.current = CHAT_STATES.PRICING; renderChatState(); } },
          { text: '⚙️ How it works', action: () => { chatState.current = CHAT_STATES.HOW_IT_WORKS; renderChatState(); } },
          { text: '🤝 Talk to someone', action: () => { chatState.current = CHAT_STATES.TALK; renderChatState(); } },
          { text: '👀 Just browsing', action: () => { chatState.current = CHAT_STATES.BROWSING; renderChatState(); } }
        ]);
      }, 400);
      break;

    case CHAT_STATES.PRICING:
      clearOptions();
      addBotMessage("Good call. Let me take you there. 👇");
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
        toggleChat();
        setTimeout(() => {
          document.querySelectorAll('.pricing-card.featured').forEach(card => {
            card.style.transition = 'box-shadow 0.5s ease';
            card.style.boxShadow = '0 0 0 3px var(--accent)';
            setTimeout(() => { card.style.boxShadow = ''; }, 2000);
          });
        }, 800);
      }, 800);
      break;

    case CHAT_STATES.HOW_IT_WORKS:
      clearOptions();
      addBotMessage("MortuPro works in 3 steps:\n\n1️⃣ A call comes in — auto-parsed into a transport record.\n\n2️⃣ Drivers are alerted instantly — they accept, navigate, and advance on mobile.\n\n3️⃣ Transport completes — invoice auto-generated and sent.");
      setTimeout(() => {
        addBotMessage("Want to see it in action?");
        renderOptions([
          { text: '🚀 Start free trial', action: () => { window.open('https://firstcallremovals.com/onboard', '_blank'); toggleChat(); } },
          { text: '📅 Request a demo', action: () => { chatState.current = CHAT_STATES.TALK; renderChatState(); } }
        ]);
      }, 800);
      break;

    case CHAT_STATES.TALK:
      clearOptions();
      addBotMessage("Happy to connect you. Quick question first — what kind of operation do you run?");
      setTimeout(() => {
        renderOptions([
          { text: '🕊️ Funeral Home', action: () => { chatState.opType = 'Funeral Home'; chatState.current = CHAT_STATES.QUALIFY_DRIVERS; renderChatState(); } },
          { text: '🔥 Crematory', action: () => { chatState.opType = 'Crematory'; chatState.current = CHAT_STATES.QUALIFY_DRIVERS; renderChatState(); } },
          { text: '🚐 Transport Company', action: () => { chatState.opType = 'Transport Company'; chatState.current = CHAT_STATES.QUALIFY_DRIVERS; renderChatState(); } }
        ]);
      }, 400);
      break;

    case CHAT_STATES.QUALIFY_DRIVERS:
      clearOptions();
      addBotMessage("Got it. How many drivers or transport vehicles do you typically run?");
      setTimeout(() => {
        renderOptions([
          { text: '1–2 drivers', action: () => { chatState.drivers = '1-2'; chatState.current = CHAT_STATES.DEMO_FORM; renderChatState(); } },
          { text: '3–10 drivers', action: () => { chatState.drivers = '3-10'; chatState.current = CHAT_STATES.DEMO_FORM; renderChatState(); } },
          { text: '10+ drivers', action: () => { chatState.drivers = '10+'; chatState.current = CHAT_STATES.DEMO_FORM; renderChatState(); } }
        ]);
      }, 400);
      break;

    case CHAT_STATES.DEMO_FORM:
      clearOptions();
      const tier = chatState.drivers === '1-2' ? 'Foundational' : chatState.drivers === '3-10' ? 'Professional' : 'Elite';
      addBotMessage(`Perfect. Based on what you've told me, ${tier} sounds like your fit. Drop your info and we'll reach out today.`);
      setTimeout(() => {
        renderDemoForm();
      }, 500);
      break;

    case CHAT_STATES.BROWSING:
      clearOptions();
      addBotMessage("No worries at all! Here are a few things worth knowing:\n\n• 30-day free trial, no card required\n• Built by people who actually run funeral transport\n• < 60 second response time on escalations");
      setTimeout(() => {
        addBotMessage("When you're ready, we're here. 🙌");
        renderOptions([
          { text: '🚀 Start free trial', action: () => { window.open('https://firstcallremovals.com/onboard', '_blank'); toggleChat(); } },
          { text: '💰 See pricing first', action: () => { chatState.current = CHAT_STATES.PRICING; renderChatState(); } }
        ]);
      }, 600);
      break;
  }
}

function addBotMessage(text) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg bot';
  msg.style.whiteSpace = 'pre-line';
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function clearOptions() {
  const options = document.getElementById('chat-options');
  if (options) options.innerHTML = '';
}

function renderOptions(opts) {
  const options = document.getElementById('chat-options');
  if (!options) return;
  options.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-option';
    btn.textContent = opt.text;
    btn.addEventListener('click', opt.action);
    options.appendChild(btn);
  });
}

function renderDemoForm() {
  const options = document.getElementById('chat-options');
  if (!options) return;
  options.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'chat-demo-form';
  form.action = 'https://formspree.io/f/xlgodrwr';
  form.method = 'POST';

  // Hidden fields
  const hiddenType = document.createElement('input');
  hiddenType.type = 'hidden';
  hiddenType.name = 'operation_type';
  hiddenType.value = chatState.opType || '';
  form.appendChild(hiddenType);

  const hiddenDrivers = document.createElement('input');
  hiddenDrivers.type = 'hidden';
  hiddenDrivers.name = 'drivers';
  hiddenDrivers.value = chatState.drivers || '';
  form.appendChild(hiddenDrivers);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.name = 'name';
  nameInput.className = 'chat-input';
  nameInput.placeholder = 'Your name';
  nameInput.required = true;
  form.appendChild(nameInput);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.name = 'email';
  emailInput.className = 'chat-input';
  emailInput.placeholder = 'Email address';
  emailInput.required = true;
  form.appendChild(emailInput);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'chat-submit';
  submit.textContent = 'Request Demo →';
  form.appendChild(submit);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.textContent = 'Sending...';
    submit.disabled = true;
    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (resp.ok) {
        chatState.current = CHAT_STATES.DONE;
        clearOptions();
        addBotMessage("✅ Got it! Someone from our team will reach out within a few hours. Thanks for your interest in MortuPro.");
      } else {
        submit.textContent = 'Try again';
        submit.disabled = false;
      }
    } catch {
      submit.textContent = 'Try again';
      submit.disabled = false;
    }
  });

  options.appendChild(form);
}


// ── Scroll Animations ───────────────────────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}


// ── Nav Hamburger ───────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const isOpen = mobileNav.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}


// ── Demo Modal ──────────────────────────────────────────────
function initDemoModal() {
  const triggers = document.querySelectorAll('[data-demo-trigger]');
  const overlay = document.getElementById('demo-modal');
  const close = document.getElementById('demo-modal-close');
  const form = document.getElementById('demo-form');

  if (!overlay) return;

  triggers.forEach(t => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('open');
    });
  });

  if (close) close.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      try {
        const resp = await fetch('https://formspree.io/f/xlgodrwr', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          form.innerHTML = '<p style="text-align:center;color:var(--accent);font-size:1.1rem;padding:20px 0">✅ Request received! We\'ll be in touch within a few hours.</p>';
        } else {
          btn.textContent = 'Try again';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Try again';
        btn.disabled = false;
      }
    });
  }
}


// ── Nav scroll shadow ───────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });
}


// ── Number counter animation ────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let start = 0;
        const duration = 1800;
        const step = timestamp => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target + suffix;
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}


// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNavScroll();
  initQuiz();
  initChat();
  initScrollAnimations();
  initDemoModal();
  initCounters();
});
