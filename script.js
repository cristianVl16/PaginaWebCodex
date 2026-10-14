const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
  themeLabel.textContent = isLight ? 'Tema oscuro' : 'Tema claro';
  themeColor.content = isLight ? '#f4f4ed' : '#111512';
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('cristian-portfolio-theme'); } catch { /* El tema sigue funcionando si el almacenamiento está bloqueado. */ }
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
  applyTheme(nextTheme);
  try { localStorage.setItem('cristian-portfolio-theme', nextTheme); } catch { /* La preferencia se conserva durante esta visita. */ }
});

const navLinks = [...document.querySelectorAll('.main-nav a')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const activeEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!activeEntry) return;
    const activeHref = `#${activeEntry.target.id}`;

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === activeHref) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5, 0.75] });

  navSections.forEach((section) => navObserver.observe(section));
}

const guestbookForm = document.querySelector('.guestbook-form');
const guestbookStatus = document.querySelector('.guestbook-status');

guestbookForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = guestbookForm.querySelector('button[type="submit"]');
  const formData = new FormData(guestbookForm);
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  guestbookStatus.textContent = 'Enviando tu opinión…';

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });

    if (!response.ok) throw new Error('No se pudo enviar el formulario.');
    guestbookForm.reset();
    guestbookStatus.textContent = '¡Gracias! Tu opinión llegó para revisión.';
  } catch {
    guestbookStatus.textContent = 'No se pudo enviar. Inténtalo de nuevo cuando el sitio esté publicado en Netlify.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});

const accessibilityToggle = document.querySelector('.accessibility-toggle');
const accessibilityPanel = document.querySelector('.accessibility-panel');
const accessibilityClose = document.querySelector('.accessibility-close');
const accessibilityOptions = [...document.querySelectorAll('.accessibility-option')];
const accessibilityReset = document.querySelector('.accessibility-reset');
const accessibilityStorageKey = 'cristian-portfolio-accessibility';

function setAccessibilityOption(button, enabled) {
  document.body.classList.toggle(button.dataset.accessibilityClass, enabled);
  button.setAttribute('aria-pressed', String(enabled));
}

let savedAccessibility = {};
try {
  const storedAccessibility = JSON.parse(localStorage.getItem(accessibilityStorageKey) || '{}');
  if (storedAccessibility && typeof storedAccessibility === 'object') savedAccessibility = storedAccessibility;
} catch { /* Los controles funcionan aunque el navegador bloquee el almacenamiento. */ }

accessibilityOptions.forEach((button) => {
  setAccessibilityOption(button, Boolean(savedAccessibility[button.dataset.accessibilityClass]));
  button.addEventListener('click', () => {
    const enabled = button.getAttribute('aria-pressed') !== 'true';
    setAccessibilityOption(button, enabled);
    savedAccessibility[button.dataset.accessibilityClass] = enabled;
    try { localStorage.setItem(accessibilityStorageKey, JSON.stringify(savedAccessibility)); } catch { /* El ajuste queda activo durante esta visita. */ }
  });
});

function closeAccessibilityPanel() {
  accessibilityPanel.hidden = true;
  accessibilityToggle.setAttribute('aria-expanded', 'false');
  accessibilityToggle.focus();
}

accessibilityToggle.addEventListener('click', () => {
  const isOpen = accessibilityToggle.getAttribute('aria-expanded') === 'true';
  accessibilityToggle.setAttribute('aria-expanded', String(!isOpen));
  accessibilityPanel.hidden = isOpen;
  if (!isOpen) accessibilityClose.focus();
});

accessibilityClose.addEventListener('click', closeAccessibilityPanel);
accessibilityReset.addEventListener('click', () => {
  accessibilityOptions.forEach((button) => setAccessibilityOption(button, false));
  savedAccessibility = {};
  try { localStorage.removeItem(accessibilityStorageKey); } catch { /* Restablece también sin almacenamiento. */ }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !accessibilityPanel.hidden) closeAccessibilityPanel();
});
