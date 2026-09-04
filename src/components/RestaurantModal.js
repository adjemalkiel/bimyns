// Modale Restaurant & Bar avec le Sélecteur Crucial de Livraison
import { RESTAURANT_MENU, RESORT_DELIVERY_ZONES, RESORT_ROOM_NUMBERS } from '../data/catalog.js';
import { store } from '../state/store.js';

export class RestaurantModal {
  constructor(container) {
    this.container = container;
    this.activeCategory = 'all'; // 'all' | 'Entrées' | 'Plats' | 'Boissons'
    this.deliveryType = 'pool_garden'; // 'pool_garden' | 'room' | 'city'
    this.selectedZone = RESORT_DELIVERY_ZONES[0].label;
    this.selectedRoom = RESORT_ROOM_NUMBERS[0];
    this.cityAddress = '';
    this.cityContactPhone = '';
    this.scannedQr = null;

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="restaurant-modal-overlay">
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Restaurant & Bar Écotouristique</h2>
              <span class="modal-subtitle">Gastronomie béninoise, poissons braisés du lac & cocktails frais</span>
            </div>
            <button class="modal-close-btn" id="rest-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps défilable -->
          <div class="modal-body">
            <!-- LE SÉLECTEUR CRUCIAL DE TYPE DE LIVRAISON -->
            <div class="restaurant-delivery-banner">
              <div class="delivery-selector-header">
                <span class="delivery-selector-title">
                  <span>📍</span> Mode et Lieu de Livraison (Requis pour votre commande)
                </span>
                <span class="badge badge-gold" id="current-delivery-badge">Transat / Piscine</span>
              </div>

              <div class="delivery-type-tabs">
                <button class="delivery-type-btn ${this.deliveryType === 'pool_garden' ? 'active' : ''}" data-type="pool_garden">
                  <span style="font-size: 1.2rem;">🏊‍♂️</span>
                  <span>Sur place (Piscine / Jardin)</span>
                </button>

                <button class="delivery-type-btn ${this.deliveryType === 'room' ? 'active' : ''}" data-type="room">
                  <span style="font-size: 1.2rem;">🛎️</span>
                  <span>En Chambre (Résidents)</span>
                </button>

                <button class="delivery-type-btn ${this.deliveryType === 'city' ? 'active' : ''}" data-type="city">
                  <span style="font-size: 1.2rem;">🛵</span>
                  <span>Livraison en Ville</span>
                </button>
              </div>

              <!-- Options dynamiques selon le mode choisi -->
              <div class="delivery-options-panel" id="delivery-options-panel">
                <!-- Rempli par renderDeliveryOptions() -->
              </div>
            </div>

            <!-- Filtres par Catégorie -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="tab-btn active cat-btn" data-cat="all">Tout le menu</button>
              <button class="tab-btn cat-btn" data-cat="Entrées">Entrées & Tapas</button>
              <button class="tab-btn cat-btn" data-cat="Plats">Plats & Grillades</button>
              <button class="tab-btn cat-btn" data-cat="Boissons">Boissons & Cocktails</button>
            </div>

            <!-- Grille des Plats & Boissons -->
            <div class="menu-items-grid" id="menu-items-grid">
              <!-- Rempli par renderMenuItems() -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderDeliveryOptions();
    this.renderMenuItems();
  }

  renderDeliveryOptions() {
    const panel = this.container.querySelector('#delivery-options-panel');
    const badge = this.container.querySelector('#current-delivery-badge');
    const { user } = store.state;

    if (this.deliveryType === 'pool_garden') {
      badge.textContent = 'Service Transat / Jardin';
      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.84rem; font-weight: 600; color: var(--cta-green-dark);">
              Indiquez votre emplacement exact pour le serveur :
            </span>
            <button class="btn btn-secondary btn-sm" id="btn-open-qr-scan" style="padding: 6px 12px; font-size: 0.8rem;">
              <span>📷</span> Scanner le QR Code de mon transat
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center;">
            <div class="input-field-group">
              <label class="input-label">Zone ou Transat sélectionné</label>
              <select class="form-input" id="select-pool-zone">
                ${RESORT_DELIVERY_ZONES.map(z => `
                  <option value="${z.label}" ${this.selectedZone === z.label ? 'selected' : ''}>
                    ${z.label} (${z.code})
                  </option>
                `).join('')}
              </select>
            </div>
            ${this.scannedQr ? `
              <div style="background: rgba(76, 175, 80, 0.15); border: 1px solid #4caf50; padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; color: #1b5e20;">
                ✓ QR validé : <strong>${this.scannedQr}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else if (this.deliveryType === 'room') {
      badge.textContent = 'Room Service Chambre';
      const defaultRoom = user && user.isResident && user.roomNumber ? user.roomNumber : this.selectedRoom;

      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="input-field-group">
            <label class="input-label">Numéro de Chambre / Suite</label>
            <select class="form-input" id="select-room-number">
              ${RESORT_ROOM_NUMBERS.map(r => `
                <option value="${r}" ${defaultRoom === r ? 'selected' : ''}>${r}</option>
              `).join('')}
            </select>
          </div>
          ${user && user.isResident ? `
            <span style="font-size: 0.78rem; color: #2e7d32; font-weight: 600;">
              ✓ Reconnu comme résident en ${user.roomNumber}. Possibilité d'ajouter à votre note à l'étape du paiement.
            </span>
          ` : `
            <span style="font-size: 0.78rem; color: #657568;">
              ℹ️ Livraison directe à votre porte par notre personnel d'étage.
            </span>
          `}
        </div>
      `;
    } else if (this.deliveryType === 'city') {
      badge.textContent = 'Livraison Externe en Ville';
      const defaultAddr = user && user.deliveryAddresses && user.deliveryAddresses.length > 0 
        ? `${user.deliveryAddresses[0].street}, ${user.deliveryAddresses[0].district} (${user.deliveryAddresses[0].city})`
        : this.cityAddress || 'Haie Vive, Cotonou';

      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${user && user.deliveryAddresses && user.deliveryAddresses.length > 0 ? `
            <div class="input-field-group">
              <label class="input-label">Adresses enregistrées sur votre compte</label>
              <select class="form-input" id="select-saved-addr">
                ${user.deliveryAddresses.map(a => `
                  <option value="${a.street}, ${a.district} (${a.city})">${a.label} : ${a.street}, ${a.district} (${a.city})</option>
                `).join('')}
                <option value="custom">-- Saisir une autre adresse --</option>
              </select>
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
            <div class="input-field-group">
              <label class="input-label">Adresse de livraison (Quartier, Rue, Repère)</label>
              <input type="text" class="form-input" id="input-city-address" value="${defaultAddr}" placeholder="Ex: Rue 340, Villa 12B, Haie Vive, Cotonou" />
            </div>
            <div class="input-field-group">
              <label class="input-label">Téléphone de contact</label>
              <input type="tel" class="form-input" id="input-city-phone" value="${user ? user.phone : '+229 '}" placeholder="+229 XX XX XX XX" />
            </div>
          </div>
        </div>
      `;
    }

    // Réattacher les événements du panneau
    this.bindDeliveryOptionsEvents();
  }

  bindDeliveryOptionsEvents() {
    const qrBtn = this.container.querySelector('#btn-open-qr-scan');
    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        store.openModal('qr-scanner');
      });
    }

    const zoneSelect = this.container.querySelector('#select-pool-zone');
    if (zoneSelect) {
      zoneSelect.addEventListener('change', (e) => {
        this.selectedZone = e.target.value;
        store.setSelectedDeliveryZone(this.selectedZone);
      });
    }

    const roomSelect = this.container.querySelector('#select-room-number');
    if (roomSelect) {
      roomSelect.addEventListener('change', (e) => {
        this.selectedRoom = e.target.value;
      });
    }

    const savedAddrSelect = this.container.querySelector('#select-saved-addr');
    if (savedAddrSelect) {
      savedAddrSelect.addEventListener('change', (e) => {
        if (e.target.value !== 'custom') {
          const addrInput = this.container.querySelector('#input-city-address');
          if (addrInput) addrInput.value = e.target.value;
        }
      });
    }
  }

  renderMenuItems() {
    const grid = this.container.querySelector('#menu-items-grid');
    if (!grid) return;

    const { currency } = store.state;
    const filtered = this.activeCategory === 'all' 
      ? RESTAURANT_MENU 
      : RESTAURANT_MENU.filter(m => m.category === this.activeCategory);

    grid.innerHTML = filtered.map(item => {
      const price = currency === 'EUR' ? `${item.priceEUR} €` : `${item.priceXOF.toLocaleString('fr-FR')} FCFA`;

      return `
        <div class="menu-item-card" data-item-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="menu-item-img" />
          <div class="menu-item-info">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 class="menu-item-name">${item.name}</h4>
              <span class="badge badge-gold" style="font-size: 0.65rem;">${item.badge}</span>
            </div>
            <p class="menu-item-desc">${item.description}</p>
            <div class="menu-item-bottom">
              <span class="menu-item-price">${price}</span>
              <button class="btn btn-primary btn-add-food" data-item-id="${item.id}" style="padding: 6px 14px; font-size: 0.8rem;">
                <span>+ Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    // Fermeture
    this.container.querySelector('#rest-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#restaurant-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    // Bascule Type de Livraison
    this.container.querySelectorAll('.delivery-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deliveryType = btn.dataset.type;
        this.container.querySelectorAll('.delivery-type-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderDeliveryOptions();
      });
    });

    // Filtre Catégories Menu
    this.container.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.cat;
        this.container.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderMenuItems();
      });
    });

    // Ajout d'un plat au panier
    this.container.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.btn-add-food');
      if (addBtn) {
        const itemId = addBtn.dataset.itemId;
        const item = RESTAURANT_MENU.find(m => m.id === itemId);
        if (!item) return;

        // Préparation des métadonnées de livraison
        let deliveryLabel = '';
        let deliveryMeta = { type: this.deliveryType };

        if (this.deliveryType === 'pool_garden') {
          deliveryLabel = `Livraison : ${this.selectedZone}`;
          deliveryMeta.zone = this.selectedZone;
          deliveryMeta.qrCode = this.scannedQr;
        } else if (this.deliveryType === 'room') {
          const roomInput = this.container.querySelector('#select-room-number');
          const room = roomInput ? roomInput.value : this.selectedRoom;
          deliveryLabel = `En Chambre : ${room}`;
          deliveryMeta.roomNumber = room;
        } else if (this.deliveryType === 'city') {
          const addrInput = this.container.querySelector('#input-city-address');
          const phoneInput = this.container.querySelector('#input-city-phone');
          const addr = addrInput ? addrInput.value : 'Ville';
          const phone = phoneInput ? phoneInput.value : '';
          deliveryLabel = `Livraison en Ville : ${addr}`;
          deliveryMeta.address = addr;
          deliveryMeta.phone = phone;
        }

        store.addToCart({
          id: item.id,
          title: item.name,
          category: 'restaurant',
          priceXOF: item.priceXOF,
          priceEUR: item.priceEUR,
          quantity: 1,
          details: deliveryLabel,
          image: item.image,
          metadata: {
            delivery: deliveryMeta,
            prepTime: item.prepTime
          }
        });
      }
    });
  }

  setScannedQrCode(qrCode, zoneLabel) {
    this.scannedQr = qrCode;
    this.selectedZone = zoneLabel;
    this.deliveryType = 'pool_garden';
    this.renderDeliveryOptions();
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#restaurant-modal-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'restaurant';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      this.renderDeliveryOptions();
      this.renderMenuItems();
    }
  }
}
