// Modale Loisirs, Piscine & Court de Tennis
import { LEISURE_ACTIVITIES } from '../data/catalog.js';
import { store } from '../state/store.js';

export class LeisureModal {
  constructor(container) {
    this.container = container;
    this.activeTab = 'pool'; // 'pool' ou 'tennis'

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay leisure-modal" id="leisure-modal-overlay">
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Sports, Détente & Club CTA BIMYNS</h2>
              <span class="modal-subtitle">Piscine aux 3 bassins en cascade & Court de tennis professionnel</span>
            </div>
            <button class="modal-close-btn" id="leisure-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Onglets Piscine / Tennis -->
          <div class="modal-tabs">
            <button class="tab-btn ${this.activeTab === 'pool' ? 'active' : ''}" data-tab="pool">
              <i class="fas fa-person-swimming" aria-hidden="true"></i> Piscine aux 3 Bassins
            </button>
            <button class="tab-btn ${this.activeTab === 'tennis' ? 'active' : ''}" data-tab="tennis">
              <i class="fas fa-table-tennis-paddle-ball" aria-hidden="true"></i> Court de Tennis & Club
            </button>
          </div>

          <!-- Corps défilable -->
          <div class="modal-body" id="leisure-cards-container">
            <!-- Injecté dynamiquement -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderTabContent();
  }

  renderTabContent() {
    const list = this.activeTab === 'pool' ? LEISURE_ACTIVITIES.pool : LEISURE_ACTIVITIES.tennis;
    const { currency } = store.state;
    const container = this.container.querySelector('#leisure-cards-container');
    if (!container) return;

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="leisure-grid">
        ${list.map(item => {
          const price = currency === 'EUR' ? `${item.priceEUR} €` : `${item.priceXOF.toLocaleString('fr-FR')} FCFA`;
          const isSlot = item.type === 'slot';

          return `
            <div class="leisure-card" data-item-id="${item.id}">
              <div class="leisure-card-header">
                <div>
                  <h3 class="leisure-title">${item.name}</h3>
                  <span class="leisure-period"><i class="fas fa-clock" aria-hidden="true"></i> ${item.period}</span>
                </div>
                <span class="badge ${item.type === 'subscription' ? 'badge-gold' : 'badge-green'}">
                  ${item.type === 'subscription' ? 'Abonnement' : 'Pass Ponctuel'}
                </span>
              </div>

              <p class="room-desc">${item.description}</p>

              <ul class="leisure-features-list">
                ${item.features.map(f => `<li>${f}</li>`).join('')}
              </ul>

              <!-- Sélecteur de date / créneau pour les réservations ponctuelles -->
              ${isSlot || item.type === 'pass' ? `
                <div class="booking-dates-row leisure-booking-row">
                  <div class="input-field-group">
                    <label class="input-label">Date souhaitée</label>
                    <input type="date" class="form-input leisure-date" value="${todayStr}" min="${todayStr}" />
                  </div>
                  ${isSlot ? `
                    <div class="input-field-group">
                      <label class="input-label">Créneau Horaire</label>
                      <select class="form-input leisure-slot">
                        <option value="08:00 - 09:00">08h00 - 09h00 (Matinée)</option>
                        <option value="09:00 - 10:00">09h00 - 10h00</option>
                        <option value="16:00 - 17:00">16h00 - 17h00 (Fin d'aprem)</option>
                        <option value="17:30 - 18:30">17h30 - 18h30 (Crépuscule)</option>
                        <option value="19:00 - 20:00">19h00 - 20h00 (Nocturne éclairé)</option>
                      </select>
                    </div>
                  ` : `
                    <div class="input-field-group">
                      <label class="input-label">Nombre de pass</label>
                      <select class="form-input leisure-qty">
                        <option value="1" selected>1 Personne</option>
                        <option value="2">2 Personnes</option>
                        <option value="4">4 Personnes (Famille)</option>
                      </select>
                    </div>
                  `}
                </div>
              ` : `
                <div class="leisure-member-note">
                  Carte de membre physique remise à l'accueil du complexe dès votre première visite.
                </div>
              `}

              <div class="room-price-cta leisure-price-cta">
                <div>
                  <span class="room-price-val">${price}</span>
                </div>
                <button class="btn btn-modal-book btn-book-leisure" data-item-id="${item.id}">
                  ${item.type === 'subscription' ? 'Souscrire' : 'Réserver'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  bindEvents() {
    // Fermeture
    this.container.querySelector('#leisure-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#leisure-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    // Onglets
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderTabContent();
      });
    });

    // Clic Réservation
    this.container.addEventListener('click', (e) => {
      const bookBtn = e.target.closest('.btn-book-leisure');
      if (bookBtn) {
        const itemId = bookBtn.dataset.itemId;
        const allItems = [...LEISURE_ACTIVITIES.pool, ...LEISURE_ACTIVITIES.tennis];
        const item = allItems.find(i => i.id === itemId);
        if (!item) return;

        const card = bookBtn.closest('.leisure-card');
        const dateInput = card.querySelector('.leisure-date');
        const slotSelect = card.querySelector('.leisure-slot');
        const qtySelect = card.querySelector('.leisure-qty');

        const date = dateInput ? dateInput.value : 'Abonnement immédiat';
        const slot = slotSelect ? slotSelect.value : null;
        const qty = qtySelect ? parseInt(qtySelect.value, 10) : 1;

        let details = `${item.period}`;
        if (slot) details += ` le ${date} (${slot})`;
        else if (dateInput) details += ` le ${date} (${qty} pers.)`;

        store.addToCart({
          id: item.id,
          title: item.name,
          category: 'leisure',
          priceXOF: item.priceXOF * qty,
          priceEUR: +(item.priceEUR * qty).toFixed(2),
          quantity: 1,
          details,
          image: item.image,
          metadata: {
            activityType: item.type,
            date,
            slot,
            peopleCount: qty
          }
        });

        store.closeModal();
        store.openModal('cart');
      }
    });
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#leisure-modal-overlay');
    if (!overlay) return;

    const isLeisure = store.state.activeModal === 'leisure' || 
                      store.state.activeModal === 'leisure-pool' || 
                      store.state.activeModal === 'leisure-tennis';

    overlay.classList.toggle('active', isLeisure);

    if (isLeisure) {
      if (store.state.activeModal === 'leisure-tennis') {
        this.activeTab = 'tennis';
      } else if (store.state.activeModal === 'leisure-pool') {
        this.activeTab = 'pool';
      }

      this.container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
      });
      this.renderTabContent();
    }
  }
}
