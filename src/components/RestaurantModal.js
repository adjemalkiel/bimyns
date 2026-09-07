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
            <button class="modal-close-btn" id="rest-close-btn" title="Fermer" aria-label="Fermer">✕</button>
          </div>

          <!-- Corps défilable -->
          <div class="modal-body">
            <!-- LE SÉLECTEUR CRUCIAL DE TYPE DE LIVRAISON -->
            <div class="restaurant-delivery-banner">
              <div class="delivery-selector-header">
                <span class="delivery-selector-title">
                  <i class="fas fa-location-dot" aria-hidden="true"></i>
                  Mode et Lieu de Livraison (Requis pour votre commande)
                </span>
                <span class="badge badge-gold" id="current-delivery-badge">Transat / Piscine</span>
              </div>

              <div class="delivery-type-tabs">
                <button class="delivery-type-btn ${this.deliveryType === 'pool_garden' ? 'active' : ''}" data-type="pool_garden">
                  <i class="fas fa-person-swimming" aria-hidden="true"></i>
                  <span>Sur place (Piscine / Jardin)</span>
                </button>

                <button class="delivery-type-btn ${this.deliveryType === 'room' ? 'active' : ''}" data-type="room">
                  <i class="fas fa-bell-concierge" aria-hidden="true"></i>
                  <span>En Chambre (Résidents)</span>
                </button>

                <button class="delivery-type-btn ${this.deliveryType === 'city' ? 'active' : ''}" data-type="city">
                  <i class="fas fa-motorcycle" aria-hidden="true"></i>
                  <span>Livraison en Ville</span>
                </button>
              </div>

              <!-- Options dynamiques selon le mode choisi -->
              <div class="delivery-options-panel" id="delivery-options-panel">
                <!-- Rempli par renderDeliveryOptions() -->
              </div>
            </div>

            <!-- Filtres par Catégorie -->
            <div class="restaurant-cat-tabs">
              <button class="tab-btn active cat-btn" data-cat="all">
                <i class="fas fa-utensils" aria-hidden="true"></i> Tout le menu
              </button>
              <button class="tab-btn cat-btn" data-cat="Entrées">
                <i class="fas fa-leaf" aria-hidden="true"></i> Entrées & Tapas
              </button>
              <button class="tab-btn cat-btn" data-cat="Plats">
                <i class="fas fa-fire-burner" aria-hidden="true"></i> Plats & Grillades
              </button>
              <button class="tab-btn cat-btn" data-cat="Boissons">
                <i class="fas fa-martini-glass-citrus" aria-hidden="true"></i> Boissons & Cocktails
              </button>
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
        <div class="delivery-options-stack">
          <div class="delivery-options-toolbar">
            <span class="delivery-options-hint">
              Indiquez votre emplacement exact pour le serveur :
            </span>
            <button class="btn btn-secondary btn-sm btn-qr-scan" id="btn-open-qr-scan">
              <i class="fas fa-qrcode" aria-hidden="true"></i> Scanner le QR Code de mon transat
            </button>
          </div>

          <div class="delivery-zone-row">
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
              <div class="delivery-qr-ok">
                <i class="fas fa-check" aria-hidden="true"></i> QR validé : <strong>${this.scannedQr}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else if (this.deliveryType === 'room') {
      badge.textContent = 'Room Service Chambre';
      const defaultRoom = user && user.isResident && user.roomNumber ? user.roomNumber : this.selectedRoom;

      panel.innerHTML = `
        <div class="delivery-options-stack">
          <div class="input-field-group">
            <label class="input-label">Numéro de Chambre / Suite</label>
            <select class="form-input" id="select-room-number">
              ${RESORT_ROOM_NUMBERS.map(r => `
                <option value="${r}" ${defaultRoom === r ? 'selected' : ''}>${r}</option>
              `).join('')}
            </select>
          </div>
          ${user && user.isResident ? `
            <span class="delivery-note delivery-note-ok">
              <i class="fas fa-check" aria-hidden="true"></i>
              Reconnu comme résident en ${user.roomNumber}. Possibilité d'ajouter à votre note à l'étape du paiement.
            </span>
          ` : `
            <span class="delivery-note">
              <i class="fas fa-circle-info" aria-hidden="true"></i>
              Livraison directe à votre porte par notre personnel d'étage.
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
        <div class="delivery-options-stack">
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

          <div class="delivery-city-row">
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
            <div class="menu-item-top">
              <h4 class="menu-item-name">${item.name}</h4>
              <span class="badge badge-gold">${item.badge}</span>
            </div>
            <p class="menu-item-desc">${item.description}</p>
            <div class="menu-item-bottom">
              <span class="menu-item-price">${price}</span>
              <button class="btn-modal-book btn-add-food" data-item-id="${item.id}">
                <i class="fas fa-plus" aria-hidden="true"></i> Ajouter
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
