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
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Album Photographique Officiel CTA BIMYNS</h2>
              <span class="modal-subtitle">22 clichés authentiques du complexe hôtelier, des bassins et des espaces naturels</span>
            </div>
            <button class="modal-close-btn" id="gallery-close-btn" title="Fermer" aria-label="Fermer">✕</button>
          </div>

          <!-- Filtres -->
          <div class="modal-tabs" id="gallery-filter-tabs">
            <button class="tab-btn active" data-filter="all"><i class="fas fa-images" aria-hidden="true"></i> Toutes les photos (22)</button>
            <button class="tab-btn" data-filter="Hébergement"><i class="fas fa-bed" aria-hidden="true"></i> Chambres & Suites</button>
            <button class="tab-btn" data-filter="Loisirs"><i class="fas fa-person-swimming" aria-hidden="true"></i> Piscine & Détente</button>
            <button class="tab-btn" data-filter="Restauration"><i class="fas fa-utensils" aria-hidden="true"></i> Restaurant & Bar</button>
            <button class="tab-btn" data-filter="Architecture"><i class="fas fa-building" aria-hidden="true"></i> Architecture</button>
            <button class="tab-btn" data-filter="Environnement"><i class="fas fa-tree" aria-hidden="true"></i> Jardins & Lac</button>
          </div>

          <!-- Corps de la Galerie -->
          <div class="modal-body">
            <!-- Visionneuse agrandie si photo sélectionnée -->
            <div id="gallery-lightbox" class="gallery-lightbox" hidden>
              <div class="gallery-lightbox-frame">
                <img id="lightbox-img" src="" alt="Agrandissement" />
                <button type="button" id="lightbox-close-btn" class="gallery-lightbox-close" title="Fermer" aria-label="Fermer">
                  <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
              <div class="gallery-lightbox-meta">
                <h4 id="lightbox-title"></h4>
                <span id="lightbox-tag" class="badge badge-gold"></span>
              </div>
            </div>

            <!-- Grille de vignettes -->
            <div class="gallery-grid" id="gallery-grid-items">
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
      <div class="gallery-item-card" data-src="${p.src}" data-title="${p.title}" data-tag="${p.tag}">
        <img src="${p.src}" alt="${p.title}" />
        <div class="gallery-item-caption">
          <div class="gallery-item-title">${p.title}</div>
          <div class="gallery-item-tag">${p.tag}</div>
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
        lightbox.hidden = false;
        lightbox.scrollIntoView({ behavior: 'smooth' });
      }

      if (e.target.closest('#lightbox-close-btn')) {
        const lightbox = this.container.querySelector('#gallery-lightbox');
        if (lightbox) lightbox.hidden = true;
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
