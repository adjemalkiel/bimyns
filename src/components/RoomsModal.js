// Modale Hébergement & Suites avec Galeries Photos Réelles
import { ROOMS_CATALOG } from '../data/catalog.js';
import { store } from '../state/store.js';

export class RoomsModal {
  constructor(container) {
    this.container = container;
    this.activeImageByRoom = {};
    ROOMS_CATALOG.forEach(r => {
      this.activeImageByRoom[r.id] = r.image;
    });

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="rooms-modal-overlay">
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Hébergements & Suites de Charme</h2>
              <span class="modal-subtitle">Séjournez au cœur de la nature tropicale du CTA BIMYNS</span>
            </div>
            <button class="modal-close-btn" id="rooms-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps défilable -->
          <div class="modal-body">
            <div class="rooms-grid">
              ${ROOMS_CATALOG.map(room => this.renderRoomCard(room)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderRoomCard(room) {
    const activeImg = this.activeImageByRoom[room.id] || room.image;
    const { currency } = store.state;
    const price = currency === 'EUR' ? `${room.priceEUR} €` : `${room.priceXOF.toLocaleString('fr-FR')} FCFA`;

    // Dates par défaut (Demain -> Surlendemain)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const checkInStr = tomorrow.toISOString().split('T')[0];
    const checkOutStr = dayAfter.toISOString().split('T')[0];

    return `
      <div class="room-card" data-room-id="${room.id}">
        <!-- Galerie Photo 2D Réelle -->
        <div class="room-gallery">
          <img src="${activeImg}" alt="${room.name}" class="room-gallery-img" id="img-${room.id}" />
          <span class="room-tag">${room.category}</span>
          
          <div class="gallery-thumbs">
            ${room.gallery.map((thumb, idx) => `
              <img 
                src="${thumb}" 
                alt="Aperçu ${idx + 1}" 
                class="gallery-thumb ${thumb === activeImg ? 'active' : ''}" 
                data-room-id="${room.id}" 
                data-src="${thumb}" 
              />
            `).join('')}
          </div>
        </div>

        <!-- Contenu & Caractéristiques -->
        <div class="room-content">
          <h3 class="room-title">${room.name}</h3>
          
          <div class="room-meta">
            <span>📐 ${room.size}</span>
            <span>🛏️ ${room.bed}</span>
            <span>👥 ${room.capacity}</span>
          </div>

          <p class="room-desc">${room.description}</p>

          <div class="room-amenities">
            ${room.amenities.map(a => `<span class="amenity-pill">${a}</span>`).join('')}
          </div>

          <!-- Formulaire de Réservation Directe -->
          <div class="room-booking-form">
            <div class="booking-dates-row">
              <div class="input-field-group">
                <label class="input-label">Arrivée (Check-in)</label>
                <input type="date" class="form-input room-in-date" value="${checkInStr}" min="${today.toISOString().split('T')[0]}" />
              </div>
              <div class="input-field-group">
                <label class="input-label">Départ (Check-out)</label>
                <input type="date" class="form-input room-out-date" value="${checkOutStr}" />
              </div>
            </div>

            <div class="booking-dates-row">
              <div class="input-field-group">
                <label class="input-label">Voyageurs</label>
                <select class="form-input room-guests">
                  <option value="1">1 Adulte</option>
                  <option value="2" selected>2 Adultes</option>
                  <option value="3">2 Adultes + 1 Enfant</option>
                </select>
              </div>
              <div class="input-field-group">
                <label class="input-label">Formule</label>
                <select class="form-input room-plan">
                  <option value="bb">Petit-déjeuner inclus</option>
                  <option value="hb">Demi-pension (+15 000 FCFA)</option>
                </select>
              </div>
            </div>

            <div class="room-price-cta">
              <div>
                <span class="room-price-val">${price}</span>
                <span class="room-price-sub">/ nuitée</span>
              </div>
              <button class="btn btn-primary btn-book-room" data-room-id="${room.id}">
                <span>✨ Réserver le séjour</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Fermeture de la modale
    this.container.querySelector('#rooms-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#rooms-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    // Clic sur les miniatures de la galerie 2D
    this.container.addEventListener('click', (e) => {
      const thumb = e.target.closest('.gallery-thumb');
      if (thumb) {
        const roomId = thumb.dataset.roomId;
        const src = thumb.dataset.src;
        this.activeImageByRoom[roomId] = src;
        const mainImg = this.container.querySelector(`#img-${roomId}`);
        if (mainImg) mainImg.src = src;

        const card = thumb.closest('.room-card');
        card.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      }

      // Bouton Réserver
      const bookBtn = e.target.closest('.btn-book-room');
      if (bookBtn) {
        const roomId = bookBtn.dataset.roomId;
        const room = ROOMS_CATALOG.find(r => r.id === roomId);
        if (!room) return;

        const card = bookBtn.closest('.room-card');
        const inDate = card.querySelector('.room-in-date').value;
        const outDate = card.querySelector('.room-out-date').value;
        const guests = card.querySelector('.room-guests').value;
        const plan = card.querySelector('.room-plan').value;

        // Calcul du nombre de nuits
        const d1 = new Date(inDate);
        const d2 = new Date(outDate);
        const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

        store.addToCart({
          id: room.id,
          title: room.name,
          category: 'room',
          priceXOF: room.priceXOF * nights,
          priceEUR: +(room.priceEUR * nights).toFixed(2),
          quantity: 1,
          details: `${nights} nuit(s) du ${inDate} au ${outDate} (${guests} pers.)`,
          image: room.image,
          metadata: {
            checkIn: inDate,
            checkOut: outDate,
            nights,
            guests,
            board: plan
          }
        });

        store.closeModal();
        store.openModal('cart');
      }
    });
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#rooms-modal-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'rooms';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      // Re-render pour s'assurer que la devise est à jour
      const body = this.container.querySelector('.rooms-grid');
      if (body) {
        body.innerHTML = ROOMS_CATALOG.map(room => this.renderRoomCard(room)).join('');
      }
    }
  }
}
