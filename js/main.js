/* ============================================
   Vibe Coding 강의 웹사이트 — 메인 JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initNavigation();
  initTabs();
  initAccordions();
  initCopyButtons();
  initSidebarCheckboxes();
  initPathTabs();
});

/* === Scroll Fade-In Animations === */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* === Mobile Navigation === */
function initNavigation() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

/* === Tab Components === */
function initTabs() {
  document.querySelectorAll('.track-tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    const parent = tabGroup.parentElement;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const track = tab.dataset.track;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding content
        parent.querySelectorAll('.tab-content').forEach(content => {
          if (content.dataset.track === track) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      });
    });
  });
}

/* === Accordion === */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // Close all siblings
      const accordion = item.parentElement;
      accordion.querySelectorAll('.accordion-item').forEach(sibling => {
        sibling.classList.remove('active');
        sibling.querySelector('.accordion-body').style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* === Copy Prompt Buttons === */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.prompt-block');
      const content = block.querySelector('.prompt-content');
      const text = content.textContent.trim();

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '복사됨!';
        btn.classList.add('copied');

        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        const original = btn.textContent;
        btn.textContent = '복사됨!';
        btn.classList.add('copied');

        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* === Sidebar Progress Checkboxes (localStorage) === */
function initSidebarCheckboxes() {
  const checkboxes = document.querySelectorAll('.sidebar-checkbox');
  if (!checkboxes.length) return;

  const moduleId = document.body.dataset.module || window.location.pathname;
  const storageKey = `vibe-progress-${moduleId}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // Restore state
  checkboxes.forEach(cb => {
    const stepId = cb.dataset.step;
    if (saved[stepId]) {
      cb.classList.add('checked');
    }

    cb.addEventListener('click', () => {
      cb.classList.toggle('checked');
      const isChecked = cb.classList.contains('checked');
      saved[stepId] = isChecked;
      localStorage.setItem(storageKey, JSON.stringify(saved));
      updateProgressBar();
    });
  });

  function updateProgressBar() {
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.sidebar-checkbox.checked').length;
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');

    if (fill) {
      fill.style.width = `${(checked / total) * 100}%`;
    }
    if (text) {
      text.textContent = `${checked} / ${total} 완료`;
    }
  }

  updateProgressBar();
}

/* === Learning Path Tabs === */
function initPathTabs() {
  const tabs = document.querySelectorAll('.path-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.path;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.path-content').forEach(content => {
        content.classList.toggle('active', content.dataset.path === target);
      });
    });
  });
}

/* === Utility: Generate Module Cards for Index Page === */
function renderModuleCards() {
  const grid = document.querySelector('.modules-grid');
  if (!grid || typeof MODULES_DATA === 'undefined') return;

  grid.innerHTML = MODULES_DATA.map((mod, index) => `
    <a href="${mod.page}" class="module-card fade-in" style="transition-delay: ${index * 0.05}s">
      <div class="module-card-number">${mod.number}</div>
      <h3>${mod.title}</h3>
      <p>${mod.description}</p>
      <div class="module-card-meta">
        <span class="badge ${mod.difficulty}">${mod.difficultyLabel}</span>
        ${mod.tools.map(t => `<span class="tool-badge ${t}">${TOOL_LABELS[t]}</span>`).join('')}
        ${mod.track !== '공통' ? `<span class="track-badge">${mod.track}</span>` : ''}
      </div>
      <div class="module-card-footer">
        <span class="module-card-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${mod.duration}
        </span>
        <svg class="module-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </a>
  `).join('');

  // Re-init scroll animations for dynamically added cards
  initScrollAnimations();
}

// Auto-render module cards on index page
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.modules-grid')) {
    renderModuleCards();
  }
});
