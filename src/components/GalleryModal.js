// Modale Galerie Photographique Intégrale du Complexe CTA BIMYNS
import { ALL_RESORT_PHOTOS } from '../data/catalog.js';
import { store } from '../state/store.js';

export class GalleryModal {
  constructor(container) {
    this.container = container;
    this.activeFilter = 'all';
    this.selectedPhoto = null;

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="gallery-modal-overlay">
        <div class="modal-card" style="max-width: 1040px;">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Album Photographique Officiel CTA BIMYNS</h2>
              <span class="modal-subtitle">22 clichés authentiques du complexe hôtelier, des bassins et des espaces naturels</span>
            </div>
            <button class="modal-close-btn" id="gallery-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Filtres -->
          <div class="modal-tabs" id="gallery-filter-tabs">
            <button class="tab-btn active" data-filter="all">Toutes les photos (22)</button>
            <button class="tab-btn" data-filter="Hébergement">Chambres & Suites</button>
            <button class="tab-btn" data-filter="Loisirs">Piscine & Détente</button>
            <button class="tab-btn" data-filter="Restauration">Restaurant & Bar</button>
            <button class="tab-btn" data-filter="Architecture">Architecture</button>
            <button class="tab-btn" data-filter="Environnement">Jardins & Lac</button>
          </div>

          <!-- Corps de la Galerie -->
          <div class="modal-body">
            <!-- Visionneuse agrandie si photo sélectionnée -->
            <div id="gallery-lightbox" style="display: none; background: #0c140e; border-radius: var(--radius-md); overflow: hidden; padding: 14px; margin-bottom: 16px; border: 1px solid var(--cta-sand-border);">
              <div style="position: relative; width: 100%; height: 420px; display: flex; align-items: center; justify-content: center;">
                <img id="lightbox-img" src="" alt="Agrandissement" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--radius-sm);" />
                <button id="lightbox-close-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1rem;">✕</button>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; color: #ffffff;">
                <h4 id="lightbox-title" style="font-family: var(--font-serif); font-size: 1.1rem;"></h4>
                <span id="lightbox-tag" class="badge badge-gold"></span>
              </div>
            </div>

            <!-- Grille de vignettes -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;" id="gallery-grid-items">
              <!-- Injecté dynamiquement -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderGrid();
  }

  renderGrid() {
    const grid = this.container.querySelector('#gallery-grid-items');
    if (!grid) return;

    const filtered = this.activeFilter === 'all'
      ? ALL_RESORT_PHOTOS
      : ALL_RESORT_PHOTOS.filter(p => p.tag === this.activeFilter);

    grid.innerHTML = filtered.map(p => `
      <div class="gallery-item-card" data-src="${p.src}" data-title="${p.title}" data-tag="${p.tag}" style="position: relative; height: 160px; border-radius: var(--radius-sm); overflow: hidden; cursor: pointer; border: 1px solid var(--cta-sand-border); box-shadow: var(--shadow-sm); transition: transform 0.2s ease;">
        <img src="${p.src}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent); padding: 8px 10px; color: white;">
          <div style="font-size: 0.78rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>
          <div style="font-size: 0.65rem; color: var(--cta-gold);">${p.tag}</div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    this.container.querySelector('#gallery-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#gallery-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    // Filtres
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.filter;
        this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderGrid();
      });
    });

    // Clic sur une vignette pour agrandir
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.gallery-item-card');
      if (card) {
        const src = card.dataset.src;
        const title = card.dataset.title;
        const tag = card.dataset.tag;

        const lightbox = this.container.querySelector('#gallery-lightbox');
        const img = this.container.querySelector('#lightbox-img');
        const titleEl = this.container.querySelector('#lightbox-title');
        const tagEl = this.container.querySelector('#lightbox-tag');

        img.src = src;
        titleEl.textContent = title;
        tagEl.textContent = tag;
        lightbox.style.display = 'block';
        lightbox.scrollIntoView({ behavior: 'smooth' });
      }

      if (e.target.id === 'lightbox-close-btn') {
        const lightbox = this.container.querySelector('#gallery-lightbox');
        if (lightbox) lightbox.style.display = 'none';
      }
    });
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#gallery-modal-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'gallery';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      this.renderGrid();
    }
  }
}
