// Panier Unifié Latéral (Drawer) pour CTA BIMYNS
import { store } from '../state/store.js';

export class CartDrawer {
  constructor(container) {
    this.container = container;
    this.render();
    store.subscribe(() => this.updateContent());
  }

  render() {
    this.container.innerHTML = `
      <div class="cart-drawer-overlay" id="cart-drawer-overlay">
        <aside class="cart-drawer">
          <div class="cart-header">
            <div class="cart-header-title">
              <i class="fas fa-shopping-bag" aria-hidden="true"></i>
              <h3 class="cart-title">Mon Panier Unifié</h3>
            </div>
            <button class="modal-close-btn" id="cart-close-btn" title="Fermer le panier">✕</button>
          </div>

          <div class="cart-body" id="cart-items-container">
            <!-- Rempli par updateContent() -->
          </div>

          <div class="cart-footer" id="cart-footer-panel">
            <!-- Rempli par updateContent() -->
          </div>
        </aside>
      </div>
    `;

    this.bindEvents();
    this.updateContent();
  }

  bindEvents() {
    const overlay = this.container.querySelector('#cart-drawer-overlay');
    const closeBtn = this.container.querySelector('#cart-close-btn');

    closeBtn.addEventListener('click', () => store.closeModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    this.container.addEventListener('click', (e) => {
      const incBtn = e.target.closest('.qty-inc');
      if (incBtn) {
        const id = incBtn.dataset.cartItemId;
        const currentQty = parseInt(incBtn.dataset.qty, 10);
        store.updateCartItemQuantity(id, currentQty + 1);
        return;
      }

      const decBtn = e.target.closest('.qty-dec');
      if (decBtn) {
        const id = decBtn.dataset.cartItemId;
        const currentQty = parseInt(decBtn.dataset.qty, 10);
        store.updateCartItemQuantity(id, currentQty - 1);
        return;
      }

      const removeBtn = e.target.closest('.cart-item-remove');
      if (removeBtn) {
        const id = removeBtn.dataset.cartItemId;
        store.removeFromCart(id);
        return;
      }

      const checkoutBtn = e.target.closest('#btn-go-checkout');
      if (checkoutBtn) {
        store.closeModal();
        store.openModal('checkout');
      }
    });
  }

  updateContent() {
    const overlay = this.container.querySelector('#cart-drawer-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'cart';
    overlay.classList.toggle('active', isActive);

    const itemsContainer = this.container.querySelector('#cart-items-container');
    const footerPanel = this.container.querySelector('#cart-footer-panel');
    const { cart, currency } = store.state;
    const totals = store.getCartTotals();

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <i class="fas fa-umbrella-beach cart-empty-icon" aria-hidden="true"></i>
          <h4 class="cart-empty-title">Votre panier est vide</h4>
          <p class="cart-empty-copy">
            Découvrez nos hébergements, nos loisirs et notre restaurant pour réserver une suite, planifier une partie de tennis ou commander un cocktail au bord des bassins.
          </p>
          <button class="btn btn-primary" onclick="window.ctaApp.openZoneModal('rooms')">
            <span>Découvrir les hébergements</span>
          </button>
        </div>
      `;
      footerPanel.style.display = 'none';
      return;
    }

    footerPanel.style.display = 'flex';

    itemsContainer.innerHTML = cart.map(item => {
      const itemTotalXOF = item.priceXOF * item.quantity;
      const itemTotalEUR = +(item.priceEUR * item.quantity).toFixed(2);
      const priceStr = currency === 'EUR' ? `${itemTotalEUR} €` : `${itemTotalXOF.toLocaleString('fr-FR')} FCFA`;

      let catBadge = '';
      if (item.category === 'room') {
        catBadge = '<span class="badge badge-gold"><i class="fas fa-hotel" aria-hidden="true"></i> Séjour</span>';
      } else if (item.category === 'leisure') {
        catBadge = '<span class="badge badge-green"><i class="fas fa-location-dot" aria-hidden="true"></i> Loisirs</span>';
      } else if (item.category === 'restaurant') {
        catBadge = '<span class="badge badge-restaurant"><i class="fas fa-utensils" aria-hidden="true"></i> Restaurant</span>';
      }

      return `
        <div class="cart-item-row" data-cart-item-id="${item.cartItemId}">
          <img src="${item.image || '/assets/906078286.jpg'}" alt="${item.title}" class="cart-item-thumb" />
          <div class="cart-item-details">
            <div class="cart-item-top">
              <h4 class="cart-item-title">${item.title}</h4>
              <button class="cart-item-remove" data-cart-item-id="${item.cartItemId}" title="Supprimer">✕</button>
            </div>

            <div class="cart-item-meta">
              ${catBadge}
              <span class="cart-item-sub">${item.details || ''}</span>
            </div>

            <div class="cart-item-bottom">
              <span class="cart-item-price">${priceStr}</span>

              <div class="qty-controls">
                <button class="qty-btn qty-dec" data-cart-item-id="${item.cartItemId}" data-qty="${item.quantity}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn qty-inc" data-cart-item-id="${item.cartItemId}" data-qty="${item.quantity}">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const subtotalStr = currency === 'EUR' ? `${totals.subtotalEUR} €` : `${totals.subtotalXOF.toLocaleString('fr-FR')} FCFA`;
    const ecoTaxStr = currency === 'EUR' ? `${totals.ecoTaxEUR} €` : `${totals.ecoTaxXOF.toLocaleString('fr-FR')} FCFA`;
    const finalStr = currency === 'EUR' ? `${totals.finalEUR} €` : `${totals.finalXOF.toLocaleString('fr-FR')} FCFA`;

    footerPanel.innerHTML = `
      <div class="cart-summary-row">
        <span>Sous-total des prestations</span>
        <strong>${subtotalStr}</strong>
      </div>
      <div class="cart-summary-row" title="Contribution environnementale & préservation lacustre">
        <span>Taxe Écotouristique de Séjour (2%)</span>
        <span>${ecoTaxStr}</span>
      </div>
      <div class="cart-summary-row total-row">
        <span>Montant Total Net</span>
        <span class="cart-total-amount">${finalStr}</span>
      </div>

      <button class="btn btn-primary btn-gold" id="btn-go-checkout">
        <span><i class="fas fa-credit-card" aria-hidden="true"></i> Passer la commande (${finalStr})</span>
      </button>

      <div class="cart-trust-line">
        <span><i class="fas fa-lock" aria-hidden="true"></i> Paiement sécurisé CB & Mobile Money</span>
        <span aria-hidden="true">•</span>
        <span><i class="fas fa-bolt" aria-hidden="true"></i> Synchronisé ERPNext</span>
      </div>
    `;
  }
}
