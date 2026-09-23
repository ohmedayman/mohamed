/**
 * Mohamed Ayman - Site Runtime Sync Engine
 * Real-time synchronization of contact, profile, stats, and SEO data across all pages
 */
(function () {
  const CONFIG_KEY = 'ma_site_config';
  const CONFIG_PATH = 'assets/site-config.json';

  function applyConfig(config) {
    if (!config || !config.profile) return;
    const p = config.profile;

    // 1. Sync Phone Numbers
    if (p.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.href = 'tel:' + p.phone;
        const textSpan = el.querySelector('span:last-child');
        if (textSpan && textSpan.textContent.match(/\d{5,}/)) {
          textSpan.textContent = p.phone;
        } else if (!el.children.length || el.children.length === 1 && el.textContent.match(/\d{5,}/)) {
          el.textContent = p.phone;
        }
      });
      document.querySelectorAll('[data-sync="phone"]').forEach(el => {
        el.textContent = p.phone;
      });
    }

    // 2. Sync WhatsApp
    if (p.whatsapp) {
      const cleanWa = p.whatsapp.replace(/\+/g, '').replace(/\s+/g, '');
      document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
        el.href = 'https://wa.me/' + cleanWa;
      });
      document.querySelectorAll('[data-sync="whatsapp"]').forEach(el => {
        el.textContent = p.phone || p.whatsapp;
      });
      document.querySelectorAll('[data-sync="whatsapp-label"]').forEach(el => {
        el.innerHTML = 'واتساب: <span>' + (p.phone || p.whatsapp) + '</span>';
      });
    }

    // 3. Sync Email
    if (p.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.href = 'mailto:' + p.email;
        const textSpan = el.querySelector('span:last-child');
        if (textSpan && textSpan.textContent.includes('@')) {
          textSpan.textContent = p.email;
        } else if (!el.children.length) {
          el.textContent = p.email;
        }
      });
      document.querySelectorAll('[data-sync="email"]').forEach(el => {
        el.textContent = p.email;
      });
    }

    // 4. Sync LinkedIn
    if (p.linkedin) {
      document.querySelectorAll('a[href*="linkedin.com"]').forEach(el => {
        el.href = p.linkedin;
      });
      document.querySelectorAll('[data-sync="linkedin"]').forEach(el => {
        el.textContent = p.linkedin.replace(/^https?:\/\/(www\.)?/, '');
      });
    }

    // 5. Sync GitHub
    if (p.github) {
      document.querySelectorAll('a[href*="github.com"]').forEach(el => {
        el.href = p.github;
      });
    }

    // 6. Sync Experience & Stats
    if (p.experienceYears) {
      document.querySelectorAll('[data-sync="experience"]').forEach(el => {
        el.textContent = p.experienceYears;
      });
    }
    if (p.happyClients) {
      document.querySelectorAll('[data-sync="clients"]').forEach(el => {
        el.textContent = p.happyClients;
      });
    }
    if (p.completedProjects) {
      document.querySelectorAll('[data-sync="projects-count"]').forEach(el => {
        el.textContent = p.completedProjects;
      });
    }

    // 7. Sync Names & Titles
    if (p.nameAr) {
      document.querySelectorAll('[data-sync="name-ar"]').forEach(el => {
        el.textContent = p.nameAr;
      });
    }
    if (p.nameEn) {
      document.querySelectorAll('[data-sync="name-en"]').forEach(el => {
        el.textContent = p.nameEn;
      });
    }
  }

  // A. Immediately load from localStorage (instant, offline & across tabs)
  try {
    const localSaved = localStorage.getItem(CONFIG_KEY);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      applyConfig(parsed);
    }
  } catch (e) {}

  // B. Run again on DOM ready to ensure all elements are caught
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const localSaved = localStorage.getItem(CONFIG_KEY);
        if (localSaved) applyConfig(JSON.parse(localSaved));
      } catch (e) {}
    });
  }

  // C. Listen for live updates from admin.html in other tabs in real-time
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG_KEY && e.newValue) {
      try {
        applyConfig(JSON.parse(e.newValue));
      } catch (err) {}
    }
  });

  // D. Try fetching the published site-config.json (for visitors without localStorage)
  fetch(CONFIG_PATH + '?t=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(remoteConfig => {
      if (!remoteConfig) return;
      // If no local modifications existed, apply remote config
      const localSaved = localStorage.getItem(CONFIG_KEY);
      if (!localSaved) {
        applyConfig(remoteConfig);
        try { localStorage.setItem(CONFIG_KEY, JSON.stringify(remoteConfig)); } catch (e) {}
      } else {
        // If local exists, merge server updates
        const local = JSON.parse(localSaved);
        const merged = Object.assign({}, remoteConfig, local);
        applyConfig(merged);
      }
    })
    .catch(() => {
      // Gracefully silent fallback (e.g. running on file:// protocol)
    });
})();
