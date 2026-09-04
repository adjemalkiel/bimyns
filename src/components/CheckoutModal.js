// Modale Tunnel de Commande & Paiement Multimodal (Checkout)
import { store } from '../state/store.js';
import { ERPNextService } from '../state/erpnext.js';

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
        <div class="modal-card" style="max-width: 820px;">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Finalisation de la Commande</h2>
              <span class="modal-subtitle">Paiement sécurisé & transmission instantanée à l'ERPNext</span>
            </div>
            <button class="modal-close-btn" id="checkout-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps du Checkout -->
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

    // Si la commande vient d'être passée avec succès
    if (this.orderResult) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px 20px; gap: 16px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #e8f5e9; color: #2e7d32; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; border: 3px solid #81c784;">
            ✓
          </div>

          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--cta-green-dark);">
            Commande Validée & Enregistrée !
          </h3>

          <div style="background: var(--cta-sand); border: 1.5px solid var(--cta-gold); padding: 14px 24px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.8rem; color: #556658;">Numéro de référence ERPNext :</span>
            <strong style="font-size: 1.25rem; color: var(--cta-green-dark); letter-spacing: 1px;">
              ${this.orderResult.name || 'SO-CTA-2026-CONFIRMED'}
            </strong>
            <span style="font-size: 0.76rem; color: var(--cta-green-light); font-weight: 700;">
              Statut : Synchronisé en direct avec ERPNext
            </span>
          </div>

          <p style="font-size: 0.88rem; color: #445548; max-width: 500px; line-height: 1.5;">
            Votre demande a été transmise aux équipes du complexe CTA BIMYNS. Une notification a été envoyée et la préparation de vos prestations est en cours.
          </p>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button class="btn btn-secondary" id="btn-inspect-order-payload">
              <span>🔍 Inspecter le payload ERPNext</span>
            </button>
            <button class="btn btn-primary" id="btn-finish-checkout">
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      `;
      this.bindSuccessEvents();
      return;
    }

    // Récupération de la méthode de livraison sélectionnée dans le panier
    const foodItem = cart.find(i => i.category === 'restaurant');
    const deliverySummary = foodItem ? foodItem.details : (user && user.isResident ? `Chambre ${user.roomNumber}` : 'Sur place au complexe');

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- 1. Récapitulatif Rapide & Destinataire -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--cta-sand); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--cta-sand-border);">
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #667766;">Destinataire & Livraison :</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--cta-green-dark);">
              ${user ? user.name : 'Client Invité'} • <span style="color: var(--cta-gold);">${deliverySummary}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.78rem; color: #667766;">Total à régler :</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--cta-green-primary);">${finalPriceStr}</div>
          </div>
        </div>

        <!-- 2. Choix de la Catégorie de Paiement -->
        <div>
          <label class="input-label" style="margin-bottom: 8px; display: block;">Sélectionnez votre moyen de paiement :</label>
          <div class="payment-methods-grid">
            <!-- A. Mobile Money -->
            <div class="payment-method-card ${this.paymentCategory === 'mobile_money' ? 'active' : ''}" data-cat="mobile_money">
              <div class="payment-logo-row">
                <span class="mobile-money-pill pill-mtn">MTN</span>
                <span class="mobile-money-pill pill-moov">MOOV</span>
                <span class="mobile-money-pill pill-celtiis">CELTIIS</span>
              </div>
              <span class="payment-method-name">Mobile Money Bénin</span>
              <span class="payment-method-desc">Paiement instantané via Push USSD</span>
            </div>

            <!-- B. Paiement en Ligne CB -->
            <div class="payment-method-card ${this.paymentCategory === 'online_card' ? 'active' : ''}" data-cat="online_card">
              <div class="payment-logo-row">
                <span style="font-size: 1.1rem; font-weight: 900; color: #1a1f71;">VISA</span>
                <span style="font-size: 1.1rem; font-weight: 900; color: #eb001b;">MC</span>
              </div>
              <span class="payment-method-name">Carte Bancaire</span>
              <span class="payment-method-desc">Visa, Mastercard internationale</span>
            </div>

            <!-- C. Paiement Différé -->
            <div class="payment-method-card ${this.paymentCategory === 'deferred' ? 'active' : ''}" data-cat="deferred">
              <div class="payment-logo-row">
                <span style="font-size: 1.2rem;">🛎️</span>
                <span style="font-size: 1.2rem;">💵</span>
              </div>
              <span class="payment-method-name">Paiement Différé</span>
              <span class="payment-method-desc">Note de chambre ou à la livraison</span>
            </div>
          </div>
        </div>

        <!-- 3. Formulaire Spécifique au Mode Sélectionné -->
        <div class="payment-input-box" id="payment-specific-form">
          ${this.renderSpecificPaymentForm()}
        </div>

        <!-- Instructions supplémentaires -->
        <div class="input-field-group">
          <label class="input-label">Remarques ou instructions spéciales pour le personnel (Optionnel)</label>
          <input type="text" class="form-input" id="checkout-notes" placeholder="Ex: Serviettes supplémentaires, sans piment, etc." />
        </div>

        <!-- Bouton de Soumission -->
        <button class="btn btn-primary btn-gold" id="btn-submit-order" style="padding: 16px; font-size: 1.05rem; width: 100%;" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting ? '⏳ Envoi vers ERPNext...' : `Valider et Payer (${finalPriceStr})`}</span>
        </button>
      </div>
    `;

    this.bindCheckoutEvents();
  }

  renderSpecificPaymentForm() {
    const { user } = store.state;

    if (this.paymentCategory === 'mobile_money') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label class="input-label">Choisissez votre opérateur Mobile Money :</label>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-secondary btn-sm provider-btn ${this.momoProvider === 'mtn_momo' ? 'active' : ''}" data-provider="mtn_momo" style="border-color: #ffcc00; font-weight: 700;">
              🟡 MTN MoMo Bénin
            </button>
            <button type="button" class="btn btn-secondary btn-sm provider-btn ${this.momoProvider === 'moov' ? 'active' : ''}" data-provider="moov" style="border-color: #0066b2; font-weight: 700;">
              🔵 Moov Money
            </button>
            <button type="button" class="btn btn-secondary btn-sm provider-btn ${this.momoProvider === 'celtiis' ? 'active' : ''}" data-provider="celtiis" style="border-color: #008751; font-weight: 700;">
              🟢 Celtiis Cash
            </button>
          </div>

          <div class="input-field-group" style="margin-top: 6px;">
            <label class="input-label">Numéro de Téléphone Mobile Money</label>
            <input type="tel" class="form-input" id="momo-phone" value="${user ? user.phone : '+229 97 00 00 00'}" placeholder="+229 XX XX XX XX" required />
            <span style="font-size: 0.74rem; color: #667766;">
              📲 Une invite USSD sera envoyée sur votre téléphone portable pour valider la transaction avec votre code PIN secret.
            </span>
          </div>
        </div>
      `;
    } else if (this.paymentCategory === 'online_card') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="input-field-group">
            <label class="input-label">Nom sur la Carte</label>
            <input type="text" class="form-input" id="card-name" value="${user ? user.name : ''}" placeholder="M. Kofi Mensah" required />
          </div>

          <div class="input-field-group">
            <label class="input-label">Numéro de Carte Bancaire</label>
            <input type="text" class="form-input" id="card-number" placeholder="4532 •••• •••• 8890" maxlength="19" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label class="input-label">Option de paiement différé :</label>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Option 1 : Note de chambre (Réservé aux résidents) -->
            <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border: 1px solid var(--cta-sand-border); border-radius: var(--radius-sm); cursor: pointer; background: ${isResident ? '#ffffff' : '#f5f5f5'};">
              <input type="radio" name="deferred_choice" value="room_folio" ${isResident ? 'checked' : 'disabled'} />
              <div>
                <strong style="color: var(--cta-green-dark); font-size: 0.88rem;">Ajouter à la note de ma chambre (Folio Hôtel)</strong>
                <p style="font-size: 0.76rem; color: #667766;">
                  ${isResident 
                    ? `Facturation portée directement sur la note de votre chambre : <strong>${user.roomNumber}</strong>.` 
                    : 'Option réservée aux clients séjournant à l’hôtel (Connectez-vous en tant que résident pour activer).'}
                </p>
              </div>
            </label>

            <!-- Option 2 : Payer à la livraison -->
            <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border: 1px solid var(--cta-sand-border); border-radius: var(--radius-sm); cursor: pointer; background: #ffffff;">
              <input type="radio" name="deferred_choice" value="cash_on_delivery" ${!isResident ? 'checked' : ''} />
              <div>
                <strong style="color: var(--cta-green-dark); font-size: 0.88rem;">Payer à la livraison (Espèces ou TPE Mobile)</strong>
                <p style="font-size: 0.76rem; color: #667766;">
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
    // Changement de catégorie de paiement
    this.container.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        this.paymentCategory = card.dataset.cat;
        this.renderCheckoutContent();
      });
    });

    // Choix opérateur MoMo
    this.container.querySelectorAll('.provider-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.momoProvider = btn.dataset.provider;
        this.renderCheckoutContent();
      });
    });

    // Bouton de validation de commande
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

    // Détermination de la livraison
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

    // Détermination du paiement
    let paymentData = {
      method: this.paymentCategory,
      provider: this.paymentCategory === 'mobile_money' ? this.momoProvider : (this.paymentCategory === 'online_card' ? 'visa_mastercard' : this.deferredOption),
      status: this.paymentCategory === 'deferred' ? 'Pending Payment on Delivery' : 'Authorized & Captured',
      transactionId: `TX-BIM-${Date.now()}`
    };

    // Soumission vers ERPNext
    const result = await ERPNextService.submitOrder({
      cart,
      user,
      delivery,
      payment: paymentData,
      totals,
      notes
    });

    this.isSubmitting = false;

    if (result.success) {
      this.orderResult = result.data;
      store.clearCart();
      store.addNotification('Commande transmise à ERPNext avec succès !', 'success');
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
