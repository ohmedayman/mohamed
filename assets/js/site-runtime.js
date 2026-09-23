/**
 * Mohamed Ayman - Site Runtime Sync & Analytics Engine
 * Features:
 * - Real-time Profile & Contact Data Synchronization across all pages
 * - Dynamic Project & Blog Card Rendering from site-config
 * - Integrated Privacy-Friendly Visitor Analytics Tracker
 */
(function () {
  const CONFIG_KEY = 'ma_site_config';
  const ANALYTICS_KEY = 'ma_site_analytics';
  const CONFIG_PATH = 'assets/site-config.json';

  // ==================== VISITOR ANALYTICS TRACKER ====================
  function trackVisit() {
    try {
      const now = new Date();
      let analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{}');
      if (!analytics.totalVisits) {
        analytics = {
          totalVisits: 0,
          uniqueVisitors: 0,
          pages: {},
          referrers: {},
          devices: { mobile: 0, desktop: 0 },
          recentLogs: []
        };
      }

      // Check unique visitor
      let visitorId = localStorage.getItem('ma_vid');
      let isNewVisitor = false;
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('ma_vid', visitorId);
        isNewVisitor = true;
        analytics.uniqueVisitors++;
      }

      analytics.totalVisits++;

      // Track Page
      const path = window.location.pathname.split('/').pop() || 'index.html';
      analytics.pages[path] = (analytics.pages[path] || 0) + 1;

      // Track Device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) analytics.devices.mobile++;
      else analytics.devices.desktop++;

      // Track Referrer
      let ref = document.referrer ? new URL(document.referrer).hostname : 'مباشر (Direct)';
      if (ref.includes('google')) ref = 'جوجل (Google Search)';
      else if (ref.includes('linkedin')) ref = 'لينكد إن (LinkedIn)';
      else if (ref.includes('facebook') || ref.includes('t.co')) ref = 'سوشيال ميديا';
      analytics.referrers[ref] = (analytics.referrers[ref] || 0) + 1;

      // Recent log
      analytics.recentLogs.unshift({
        time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
        page: path,
        device: isMobile ? 'موبايل' : 'كمبيوتر',
        referrer: ref
      });
      if (analytics.recentLogs.length > 30) analytics.recentLogs.pop();

      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (e) {}
  }

  trackVisit();

  // ==================== DYNAMIC DATA SYNC ====================
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

    // 8. Render Dynamic Projects (if container exists)
    const projectsContainer = document.querySelector('#dynamic-projects-grid, [data-dynamic-projects]');
    if (projectsContainer && config.projects && config.projects.length) {
      renderProjects(projectsContainer, config.projects);
    }

    // 9. Render Dynamic Articles (if container exists)
    const articlesContainer = document.querySelector('#dynamic-articles-grid, [data-dynamic-articles]');
    if (articlesContainer && config.articles && config.articles.length) {
      renderArticles(articlesContainer, config.articles);
    }
  }

  function renderProjects(container, projects) {
    container.innerHTML = '';
    projects.forEach(prj => {
      const card = document.createElement('article');
      card.className = 'card-h group rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-all duration-300 flex flex-col';
      card.innerHTML = `
        <a href="${prj.url || '#'}" class="block pf w-full h-64 overflow-hidden relative">
          <img src="${prj.img || 'assets/projects/proof-media.jpg'}" alt="${prj.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </a>
        <div class="p-7 flex flex-col flex-1">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-orange-100/50 dark:bg-orange-500/10 text-accent border border-orange-200/50 dark:border-orange-500/20">${prj.categoryLabel || prj.category || 'Project'}</span>
          </div>
          <a href="${prj.url || '#'}">
            <h3 class="font-display font-bold text-xl text-zinc-900 dark:text-white mb-3 group-hover:text-accent transition-colors">${prj.title}</h3>
          </a>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-3">${prj.desc || ''}</p>
          <div class="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <a href="${prj.url || '#'}" class="inline-flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-white nl hover:text-accent transition-colors">
              عرض المشروع →
            </a>
            <span class="text-xs font-medium text-zinc-400">${prj.year || '2026'}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderArticles(container, articles) {
    container.innerHTML = '';
    articles.forEach(art => {
      const card = document.createElement('article');
      card.className = 'card-h group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-all duration-300 flex flex-col';
      card.innerHTML = `
        <div class="pf w-full h-44 overflow-hidden relative">
          <img src="${art.img || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80'}" alt="${art.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="p-6 flex flex-col flex-1">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-xs bg-orange-50 dark:bg-zinc-800 text-accent border border-orange-200 dark:border-zinc-700 px-2.5 py-1 rounded-full">${art.category || 'مقالات'}</span>
            <span class="text-xs text-zinc-400">${art.date || 'سبتمبر 2026'}</span>
          </div>
          <a href="${art.url || 'blog.html'}">
            <h3 class="font-display font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-accent transition-colors">${art.title}</h3>
          </a>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">${art.desc || ''}</p>
          <div class="mt-auto pt-3">
            <a href="${art.url || 'blog.html'}" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white nl hover:text-accent transition-colors">اقرأ المزيد ←</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Load from localStorage immediately
  try {
    const localSaved = localStorage.getItem(CONFIG_KEY);
    if (localSaved) {
      applyConfig(JSON.parse(localSaved));
    }
  } catch (e) {}

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const localSaved = localStorage.getItem(CONFIG_KEY);
        if (localSaved) applyConfig(JSON.parse(localSaved));
      } catch (e) {}
    });
  }

  // Listen for storage events in real-time
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG_KEY && e.newValue) {
      try {
        applyConfig(JSON.parse(e.newValue));
      } catch (err) {}
    }
  });

  // Fetch published config
  fetch(CONFIG_PATH + '?t=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(remoteConfig => {
      if (!remoteConfig) return;
      const localSaved = localStorage.getItem(CONFIG_KEY);
      if (!localSaved) {
        applyConfig(remoteConfig);
        try { localStorage.setItem(CONFIG_KEY, JSON.stringify(remoteConfig)); } catch (e) {}
      } else {
        const local = JSON.parse(localSaved);
        const merged = Object.assign({}, remoteConfig, local);
        applyConfig(merged);
      }
    })
    .catch(() => {});
})();
