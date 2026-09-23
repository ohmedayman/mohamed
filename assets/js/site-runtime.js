/**
 * Mohamed Ayman - Site Runtime Sync Engine
 * Synchronizes dynamic profile, contact, and SEO data across the website
 */
(function () {
  const CONFIG_PATH = 'assets/site-config.json';

  fetch(CONFIG_PATH + '?t=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('Config load failed');
      return res.json();
    })
    .then(config => {
      if (!config || !config.profile) return;

      const p = config.profile;

      // Sync Phone
      if (p.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(el => {
          el.href = 'tel:' + p.phone;
          const textSpan = el.querySelector('span:last-child');
          if (textSpan && textSpan.textContent.match(/\d{5,}/)) {
            textSpan.textContent = p.phone;
          }
        });
      }

      // Sync WhatsApp
      if (p.whatsapp) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
          el.href = 'https://wa.me/' + p.whatsapp.replace(/\+/g, '');
        });
      }

      // Sync Email
      if (p.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
          el.href = 'mailto:' + p.email;
          const textSpan = el.querySelector('span:last-child');
          if (textSpan && textSpan.textContent.includes('@')) {
            textSpan.textContent = p.email;
          }
        });
      }

      // Sync Social Links
      if (p.linkedin) {
        document.querySelectorAll('a[href*="linkedin.com"]').forEach(el => {
          el.href = p.linkedin;
        });
      }
      if (p.github) {
        document.querySelectorAll('a[href*="github.com"]').forEach(el => {
          el.href = p.github;
        });
      }

      // Store in localStorage for fast offline read
      try {
        localStorage.setItem('ma_site_config', JSON.stringify(config));
      } catch (e) {}
    })
    .catch(() => {
      // Gracefully silent fallback
    });
})();
