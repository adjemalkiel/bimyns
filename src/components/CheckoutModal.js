// Modale Tunnel de Commande & Paiement Multimodal (Checkout)
import { store } from '../state/store.js';
import { ERPNextService } from '../state/erpnext.js';
import { KamraService } from '../state/kamra.js';

export class CheckoutModal {
  constructor(container) {
    this.container = container;
    this.paymentCategory = 'mobile_money'; // 'online_card' | 'mobile_money' | 'deferred'
    this.momoProvider = 'mtn_momo'; // 'mtn_momo' | 'moov' | 'celtiis'
    this.deferredOption = 'room_folio'; // 'room_folio' | 'cash_on_delivery'
    this.isSubmitting = false;
    this.orderResult = null;

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="checkout-modal-overlay">
        <div class="modal-card checkout-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Finalisation de la Commande</h2>
              <span class="modal-subtitle">Paiement sécurisé & transmission instantanée à l'ERPNext</span>
            </div>
            <button class="modal-close-btn" id="checkout-close-btn" title="Fermer" aria-label="Fermer">✕</button>
          </div>

          <div class="modal-body" id="checkout-modal-body">
            <!-- Rempli par renderCheckoutContent() -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderCheckoutContent();
  }

  renderCheckoutContent() {
    const body = this.container.querySelector('#checkout-modal-body');
    if (!body) return;

    const { cart, user, currency } = store.state;
    const totals = store.getCartTotals();
    const finalPriceStr = currency === 'EUR' ? `${totals.finalEUR} €` : `${totals.finalXOF.toLocaleString('fr-FR')} FCFA`;

    if (this.orderResult) {
      body.innerHTML = `
        <div class="checkout-success">
          <div class="checkout-success-icon" aria-hidden="true">
            <i class="fas fa-check"></i>
          </div>

          <h3 class="checkout-success-title">Commande Validée & Enregistrée !</h3>

          <div class="checkout-success-ref">
            <span class="checkout-summary-label">Numéro de référence ERPNext :</span>
            <strong class="checkout-success-code">${this.orderResult.name || 'SO-CTA-2026-CONFIRMED'}</strong>
            <span class="checkout-success-status">Statut : Synchronisé en direct avec ERPNext</span>
          </div>

          <p class="checkout-success-copy">
            Votre demande a été transmise aux équipes du complexe CTA BIMYNS. Une notification a été envoyée et la préparation de vos prestations est en cours.
          </p>

          <div class="checkout-success-actions">
            <button class="btn btn-secondary" id="btn-inspect-order-payload">
              <span><i class="fas fa-magnifying-glass" aria-hidden="true"></i> Inspecter le payload ERPNext</span>
            </button>
            <button class="btn btn-primary btn-gold" id="btn-finish-checkout">
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      `;
      this.bindSuccessEvents();
      return;
    }

    const foodItem = cart.find(i => i.category === 'restaurant');
    const deliverySummary = foodItem ? foodItem.details : (user && user.isResident ? `Chambre ${user.roomNumber}` : 'Sur place au complexe');

    body.innerHTML = `
      <div class="checkout-stack">
        <div class="checkout-summary">
          <div>
            <div class="checkout-summary-label">Destinataire & Livraison :</div>
            <div class="checkout-summary-value">
              ${user ? user.name : 'Client Invité'} • <span class="checkout-delivery">${deliverySummary}</span>
            </div>
          </div>
          <div class="checkout-total">
            <div class="checkout-summary-label">Total à régler :</div>
            <div class="checkout-total-amount">${finalPriceStr}</div>
          </div>
        </div>

        <div class="checkout-section">
          <label class="input-label">Sélectionnez votre moyen de paiement :</label>
          <div class="payment-methods-grid">
            <div class="payment-method-card ${this.paymentCategory === 'mobile_money' ? 'active' : ''}" data-cat="mobile_money">
              <div class="payment-logo-row">
                <span class="mobile-money-pill pill-mtn">MTN</span>
                <span class="mobile-money-pill pill-moov">MOOV</span>
                <span class="mobile-money-pill pill-celtiis">CELTIIS</span>
              </div>
              <span class="payment-method-name">Mobile Money Bénin</span>
              <span class="payment-method-desc">Paiement instantané via Push USSD</span>
            </div>

            <div class="payment-method-card ${this.paymentCategory === 'online_card' ? 'active' : ''}" data-cat="online_card">
              <div class="payment-logo-row">
                <span class="card-brand card-visa">VISA</span>
                <span class="card-brand card-mc">MC</span>
              </div>
              <span class="payment-method-name">Carte Bancaire</span>
              <span class="payment-method-desc">Visa, Mastercard internationale</span>
            </div>

            <div class="payment-method-card ${this.paymentCategory === 'deferred' ? 'active' : ''}" data-cat="deferred">
              <div class="payment-logo-row payment-logo-icons">
                <i class="fas fa-bell-concierge" aria-hidden="true"></i>
                <i class="fas fa-money-bill-wave" aria-hidden="true"></i>
              </div>
              <span class="payment-method-name">Paiement Différé</span>
              <span class="payment-method-desc">Note de chambre ou à la livraison</span>
            </div>
          </div>
        </div>

        <div class="payment-input-box" id="payment-specific-form">
          ${this.renderSpecificPaymentForm()}
        </div>

        <div class="input-field-group">
          <label class="input-label">Remarques ou instructions spéciales pour le personnel (Optionnel)</label>
          <input type="text" class="form-input" id="checkout-notes" placeholder="Ex: Serviettes supplémentaires, sans piment, etc." />
        </div>

        <button class="btn btn-primary btn-gold" id="btn-submit-order" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting
            ? `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Envoi vers ERPNext...`
            : `Valider et Payer (${finalPriceStr})`}</span>
        </button>
      </div>
    `;

    this.bindCheckoutEvents();
  }

  renderSpecificPaymentForm() {
    const { user } = store.state;

    if (this.paymentCategory === 'mobile_money') {
      return `
        <div class="checkout-payment-form">
          <label class="input-label">Choisissez votre opérateur Mobile Money :</label>
          <div class="provider-row">
            <button type="button" class="provider-btn ${this.momoProvider === 'mtn_momo' ? 'active' : ''}" data-provider="mtn_momo">
              <span class="provider-dot provider-dot-mtn" aria-hidden="true"></span> MTN MoMo Bénin
            </button>
            <button type="button" class="provider-btn ${this.momoProvider === 'moov' ? 'active' : ''}" data-provider="moov">
              <span class="provider-dot provider-dot-moov" aria-hidden="true"></span> Moov Money
            </button>
            <button type="button" class="provider-btn ${this.momoProvider === 'celtiis' ? 'active' : ''}" data-provider="celtiis">
              <span class="provider-dot provider-dot-celtiis" aria-hidden="true"></span> Celtiis Cash
            </button>
          </div>

          <div class="input-field-group momo-phone-group">
            <label class="input-label">Numéro de Téléphone Mobile Money</label>
            <div class="momo-phone-row">
              <input type="tel" class="form-input" id="momo-phone" value="${user ? user.phone : '+229 97 00 00 00'}" placeholder="+229 XX XX XX XX" required />
              <p class="momo-hint">
                <i class="fas fa-mobile-screen-button" aria-hidden="true"></i>
                Une invite USSD sera envoyée sur votre téléphone portable pour valider la transaction avec votre code PIN secret.
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (this.paymentCategory === 'online_card') {
      return `
        <div class="checkout-payment-form">
          <div class="input-field-group">
            <label class="input-label">Nom sur la Carte</label>
            <input type="text" class="form-input" id="card-name" value="${user ? user.name : ''}" placeholder="M. Kofi Mensah" required />
          </div>

          <div class="input-field-group">
            <label class="input-label">Numéro de Carte Bancaire</label>
            <input type="text" class="form-input" id="card-number" placeholder="4532 •••• •••• 8890" maxlength="19" required />
          </div>

          <div class="checkout-card-grid">
            <div class="input-field-group">
              <label class="input-label">Date d'Expiration (MM/AA)</label>
              <input type="text" class="form-input" id="card-exp" placeholder="12/28" maxlength="5" required />
            </div>
            <div class="input-field-group">
              <label class="input-label">Cryptogramme (CVV / CVC)</label>
              <input type="password" class="form-input" id="card-cvv" placeholder="•••" maxlength="4" required />
            </div>
          </div>
        </div>
      `;
    } else if (this.paymentCategory === 'deferred') {
      const isResident = user && user.isResident;

      return `
        <div class="checkout-payment-form">
          <label class="input-label">Option de paiement différé :</label>

          <div class="deferred-options">
            <label class="deferred-option ${isResident ? '' : 'is-disabled'}">
              <input type="radio" name="deferred_choice" value="room_folio" ${isResident ? 'checked' : 'disabled'} />
              <div>
                <strong>Ajouter à la note de ma chambre (Folio Hôtel)</strong>
                <p>
                  ${isResident
                    ? `Facturation portée directement sur la note de votre chambre : <strong>${user.roomNumber}</strong>.`
                    : 'Option réservée aux clients séjournant à l’hôtel (Connectez-vous en tant que résident pour activer).'}
                </p>
              </div>
            </label>

            <label class="deferred-option">
              <input type="radio" name="deferred_choice" value="cash_on_delivery" ${!isResident ? 'checked' : ''} />
              <div>
                <strong>Payer à la livraison (Espèces ou TPE Mobile)</strong>
                <p>
                  Réglez directement en mains propres à la réception de vos plats ou pass (parfait pour la livraison en ville ou au transat).
                </p>
              </div>
            </label>
          </div>
        </div>
      `;
    }
  }

  bindEvents() {
    this.container.querySelector('#checkout-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#checkout-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });
  }

  bindCheckoutEvents() {
    this.container.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        this.paymentCategory = card.dataset.cat;
        this.renderCheckoutContent();
      });
    });

    this.container.querySelectorAll('.provider-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.momoProvider = btn.dataset.provider;
        this.renderCheckoutContent();
      });
    });

    const submitBtn = this.container.querySelector('#btn-submit-order');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        await this.handleOrderSubmission();
      });
    }
  }

  bindSuccessEvents() {
    const inspectBtn = this.container.querySelector('#btn-inspect-order-payload');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        store.closeModal();
        store.openModal('erpnext-inspector');
      });
    }

    const finishBtn = this.container.querySelector('#btn-finish-checkout');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        store.closeModal();
      });
    }
  }

  async handleOrderSubmission() {
    const { cart, user } = store.state;
    if (cart.length === 0) return;

    this.isSubmitting = true;
    this.renderCheckoutContent();

    const totals = store.getCartTotals();
    const notesInput = this.container.querySelector('#checkout-notes');
    const notes = notesInput ? notesInput.value : '';

    const foodItem = cart.find(i => i.category === 'restaurant');
    const delivery = foodItem && foodItem.metadata && foodItem.metadata.delivery
      ? {
          type: foodItem.metadata.delivery.type,
          label: foodItem.details,
          zoneId: foodItem.metadata.delivery.zone,
          roomNumber: foodItem.metadata.delivery.roomNumber,
          address: foodItem.metadata.delivery.address,
          qrCode: foodItem.metadata.delivery.qrCode
        }
      : {
          type: user && user.isResident ? 'room' : 'pool_garden',
          label: user && user.isResident ? `Chambre ${user.roomNumber}` : 'Sur place complexe',
          roomNumber: user ? user.roomNumber : null
        };

    let paymentData = {
      method: this.paymentCategory,
      provider: this.paymentCategory === 'mobile_money' ? this.momoProvider : (this.paymentCategory === 'online_card' ? 'visa_mastercard' : this.deferredOption),
      status: this.paymentCategory === 'deferred' ? 'Pending Payment on Delivery' : 'Authorized & Captured',
      transactionId: `TX-BIM-${Date.now()}`
    };

    const roomItems = cart.filter((i) => i.category === 'room');
    const otherItems = cart.filter((i) => i.category !== 'room');
    let result;

    if (roomItems.length && !otherItems.length) {
      const room = roomItems[0];
      const meta = room.metadata || {};
      const property = store.state.erpConfig.kamraProperty || 'CTA BIMYNS';
      const roomType =
        meta.kamraRoomType ||
        room.kamraRoomType ||
        `${property}-${({
          'suite-safari-zebre': 'SSZ',
          'chambre-tribale': 'TRI',
          'chambre-standard': 'STD',
          'cabine-eco-bungalow': 'ECO',
        }[room.id] || room.id)}`;

      result = await KamraService.bookRoom({
        property,
        roomType,
        checkIn: meta.checkIn || meta.check_in || new Date().toISOString().slice(0, 10),
        checkOut: meta.checkOut || meta.check_out || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        guestName: user?.name || 'Client Web BIMYNS',
        phone: user?.phone || '+22900000000',
        email: user?.email || '',
        adults: Number(meta.guests || meta.adults || 2),
        children: Number(meta.children || 0),
        mealPlan: meta.mealPlan || '',
        specialRequests: notes,
      });
    } else {
      result = await ERPNextService.submitOrder({
        cart,
        user,
        delivery,
        payment: paymentData,
        totals,
        notes,
      });
    }

    this.isSubmitting = false;

    if (result.success) {
      this.orderResult = result.data;
      store.clearCart();
      const label = roomItems.length && !otherItems.length ? 'Kamra PMS' : 'ERPNext';
      store.addNotification(`Commande transmise à ${label} avec succès !`, 'success');
      this.renderCheckoutContent();
    } else {
      store.addNotification(`Erreur de transmission : ${result.error}`, 'error');
      this.renderCheckoutContent();
    }
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#checkout-modal-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'checkout';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      this.orderResult = null;
      this.renderCheckoutContent();
    }
  }
}
