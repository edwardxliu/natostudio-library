const nav = document.querySelector('.navbar');
document.querySelector('.menu-toggle').addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  await navigator.clipboard?.writeText(button.dataset.copy);
  const original = button.textContent; button.textContent = 'COPIED ✓';
  setTimeout(() => button.textContent = original, 1400);
}));
document.querySelector('.talk-form').addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.querySelector('.form-status').textContent = 'Thanks — we will be in touch soon.';
  event.currentTarget.reset();
});
