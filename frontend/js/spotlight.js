/**
 * Módulo Spotlight (Efeito Lanterna Interativa)
 * Atualiza o gradiente radial seguindo as coordenadas do ponteiro do mouse.
 */
function initSpotlight() {
  const spotlight = document.getElementById('spotlight');
  if (!spotlight) return;

  const updatePosition = (clientX, clientY) => {
    spotlight.style.background = `radial-gradient(650px circle at ${clientX}px ${clientY}px, rgba(255, 255, 255, 0.08), transparent 75%)`;
  };

  window.addEventListener('mousemove', (event) => {
    updatePosition(event.clientX, event.clientY);
  });
}
