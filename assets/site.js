(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.querySelectorAll('.scroll-reveal').forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('is-pending');
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove('is-pending');
          observer.disconnect();
        }
      }, { threshold: 0.15 });
      observer.observe(element);
    });
  }

  const closingTimers = new WeakMap();
  function setOpen(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    clearTimeout(closingTimers.get(panel));
    if (open) panel.hidden = false;
    panel.style.setProperty('--radix-collapsible-content-height', `${panel.scrollHeight}px`);
    const state = open ? 'open' : 'closed';
    button.setAttribute('aria-expanded', String(open));
    button.dataset.state = state;
    panel.dataset.state = state;
    const item = button.closest('[data-slot="accordion-item"]');
    if (item) item.dataset.state = state;
    if (button.parentElement) button.parentElement.dataset.state = state;
    if (!open) {
      const durations = getComputedStyle(panel).animationDuration.split(',').map(value => {
        const number = parseFloat(value) || 0;
        return value.trim().endsWith('ms') ? number : number * 1000;
      });
      const duration = reducedMotion.matches ? 0 : Math.max(0, ...durations);
      if (!duration) panel.hidden = true;
      else closingTimers.set(panel, setTimeout(() => {
        if (button.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      }, duration));
    }
  }

  document.querySelectorAll('[data-slot="accordion"]').forEach(accordion => {
    const buttons = [...accordion.querySelectorAll('[data-slot="accordion-trigger"]')];
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        buttons.forEach(other => {
          if (other !== button && other.getAttribute('aria-expanded') === 'true') setOpen(other, false);
        });
        setOpen(button, open);
      });
      button.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowDown') target = (index + 1) % buttons.length;
        else if (event.key === 'ArrowUp') target = (index + buttons.length - 1) % buttons.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = buttons.length - 1;
        if (target !== undefined) {
          event.preventDefault();
          buttons[target].focus();
        }
      });
    });
  });
})();
