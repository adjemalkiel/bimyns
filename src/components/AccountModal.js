// Modale Compte Utilisateur & Espace Client (Tableau de bord 2D)
import { MOCK_USERS } from '../data/catalog.js';
import { store } from '../state/store.js';

export class AccountModal {
  constructor(container) {
    this.container = container;
    this.authMode = 'login'; // 'login' | 'register'

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="account-modal-overlay">
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Espace Client & Compte CTA BIMYNS</h2>
              <span class="modal-subtitle">Gestion de vos séjours, abonnements sports & adresses de livraison</span>
            </div>
            <button class="modal-close-btn" id="account-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps défilable -->
          <div class="modal-body" id="account-modal-body">
            <!-- Injecté selon statut connecté ou déconnecté -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderAccountContent();
  }

  renderAccountContent() {
    const body = this.container.querySelector('#account-modal-body');
    if (!body) return;

    const { user } = store.state;

    if (!user) {
      // Écran d'Authentification (Connexion / Inscription)
      body.innerHTML = `
        <div style="max-width: 460px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; padding: 20px 0;">
          <div class="modal-tabs" style="justify-content: center; background: transparent; border: none;">
            <button class="tab-btn ${this.authMode === 'login' ? 'active' : ''}" id="tab-login-btn">Connexion</button>
            <button class="tab-btn ${this.authMode === 'register' ? 'active' : ''}" id="tab-register-btn">Créer un compte</button>
          </div>

          <form id="auth-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="input-field-group">
              <label class="input-label">Adresse Email</label>
              <input type="email" class="form-input" id="auth-email" required placeholder="nom@domaine.com" />
            </div>

            <div class="input-field-group">
              <label class="input-label">Mot de passe</label>
              <input type="password" class="form-input" id="auth-password" required placeholder="••••••••" />
            </div>

            ${this.authMode === 'register' ? `
              <div class="input-field-group">
                <label class="input-label">Nom complet</label>
                <input type="text" class="form-input" id="auth-name" required placeholder="Prénom Nom" />
              </div>
              <div class="input-field-group">
                <label class="input-label">Numéro de Téléphone (Bénin / WhatsApp)</label>
                <input type="tel" class="form-input" id="auth-phone" required placeholder="+229 XX XX XX XX" />
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
              <span>${this.authMode === 'login' ? 'Se connecter' : 'Valider l’inscription'}</span>
            </button>
          </form>

          <!-- Comptes de Démonstration Rapides -->
          <div style="background: var(--cta-sand); border: 1px solid var(--cta-sand-border); border-radius: var(--radius-md); padding: 14px;">
            <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--cta-green-dark); display: block; margin-bottom: 8px;">
              ⚡ Comptes Démo Pré-configurés :
            </span>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-8942" style="justify-content: flex-start; text-align: left; font-size: 0.82rem;">
                <span>🏨 <strong>Dr. Kofi Mensah</strong> (Résident Suite 101 - Note autorisée)</span>
              </button>
              <button class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-6721" style="justify-content: flex-start; text-align: left; font-size: 0.82rem;">
                <span>🏙️ <strong>Amina Touré</strong> (Visiteur externe - Cotonou)</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Espace Client (Tableau de Bord 2D)
      body.innerHTML = `
        <!-- Carte Profil Utilisateur -->
        <div class="user-profile-header">
          <div class="user-avatar-large">${user.name.charAt(0)}</div>
          <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cta-green-dark);">${user.name}</h3>
              ${user.isResident ? `
                <span class="badge badge-resident">🏨 Client Résident : ${user.roomNumber}</span>
              ` : `
                <span class="badge badge-green">Visiteur Externe</span>
              `}
            </div>
            <span style="font-size: 0.84rem; color: #556658;">✉️ ${user.email} | 📞 ${user.phone}</span>
            ${user.isResident ? `
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--cta-gold);">
                💳 Solde Note de Chambre : ${user.roomFolioBalanceXOF.toLocaleString('fr-FR')} FCFA
              </span>
            ` : ''}
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-logout" style="font-size: 0.8rem;">Déconnexion</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- 1. Adresses de Livraison Enregistrées (pour la ville) -->
          <div class="profile-card-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 class="section-heading">📍 Adresses de Livraison en Ville</h4>
              <button class="btn btn-secondary btn-sm" id="btn-add-address" style="padding: 4px 10px; font-size: 0.75rem;">+ Ajouter</button>
            </div>

            ${user.deliveryAddresses && user.deliveryAddresses.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${user.deliveryAddresses.map(addr => `
                  <div style="background: var(--cta-sand-light); border: 1px solid var(--cta-sand-border); padding: 10px; border-radius: var(--radius-sm); font-size: 0.82rem;">
                    <strong style="color: var(--cta-green-dark);">${addr.label}</strong> : ${addr.street}, ${addr.district} (${addr.city})
                  </div>
                `).join('')}
              </div>
            ` : `
              <p style="font-size: 0.82rem; color: #889988;">Aucune adresse enregistrée pour le moment.</p>
            `}
          </div>

          <!-- 2. Abonnements en cours (Piscine / Tennis) -->
          <div class="profile-card-section">
            <h4 class="section-heading">🏆 Abonnements en Cours (Club)</h4>
            ${user.activeSubscriptions && user.activeSubscriptions.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${user.activeSubscriptions.map(sub => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: var(--cta-sand-light); border: 1px solid var(--cta-sand-border); padding: 10px; border-radius: var(--radius-sm);">
                    <div>
                      <strong style="font-size: 0.84rem; color: var(--cta-green-dark);">${sub.title}</strong>
                      <div style="font-size: 0.74rem; color: #778877;">Valide jusqu'au ${sub.validUntil}</div>
                    </div>
                    <span class="badge badge-gold">${sub.badge}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p style="font-size: 0.82rem; color: #889988;">Aucun abonnement actif. Découvrez nos formules dans la section Loisirs.</p>
            `}
          </div>
        </div>

        <!-- 3. Historique des Commandes & Réservations Synchronisées ERPNext -->
        <div class="profile-card-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="section-heading">📦 Historique des Commandes & Réservations (ERPNext)</h4>
            <button class="btn btn-secondary btn-sm" id="btn-view-erp-inspector" style="padding: 4px 10px; font-size: 0.75rem;">
              Inspecter flux ERPNext
            </button>
          </div>

          ${user.orderHistory && user.orderHistory.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${user.orderHistory.map(order => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--cta-sand-light); border: 1px solid var(--cta-sand-border); border-radius: var(--radius-sm);">
                  <div>
                    <div style="font-weight: 700; font-size: 0.86rem; color: var(--cta-green-dark);">${order.orderId}</div>
                    <div style="font-size: 0.78rem; color: #667766;">${order.date} • ${order.type}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--cta-green-primary);">${order.totalXOF.toLocaleString('fr-FR')} FCFA</div>
                    <span class="badge badge-green" style="font-size: 0.65rem;">${order.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="font-size: 0.82rem; color: #889988;">Aucune commande passée récemment.</p>
          `}
        </div>

        <!-- Bascule Rapide Utilisateur Démo -->
        <div style="padding: 12px; background: var(--cta-sand); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem;">
          <span>Tester avec un autre profil :</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-8942">Dr. Kofi (Résident)</button>
            <button class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-6721">Amina (Externe)</button>
          </div>
        </div>
      `;
    }

    this.bindAccountEvents();
  }

  bindEvents() {
    this.container.querySelector('#account-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#account-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });
  }

  bindAccountEvents() {
    // Boutons de changement d'onglet d'authentification
    const loginTab = this.container.querySelector('#tab-login-btn');
    const registerTab = this.container.querySelector('#tab-register-btn');
    if (loginTab && registerTab) {
      loginTab.addEventListener('click', () => {
        this.authMode = 'login';
        this.renderAccountContent();
      });
      registerTab.addEventListener('click', () => {
        this.authMode = 'register';
        this.renderAccountContent();
      });
    }

    // Soumission du formulaire d'authentification
    const authForm = this.container.querySelector('#auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = this.container.querySelector('#auth-email').value;
        const name = this.container.querySelector('#auth-name')?.value || email.split('@')[0];
        const phone = this.container.querySelector('#auth-phone')?.value || '+229 97 00 00 00';

        const newUser = {
          id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
          name,
          email,
          phone,
          isResident: false,
          roomNumber: null,
          roomFolioBalanceXOF: 0,
          deliveryAddresses: [
            { id: 'addr-new', label: 'Domicile', city: 'Cotonou', district: 'Zone Résidentielle', street: 'Rue du Lac' }
          ],
          activeSubscriptions: [],
          orderHistory: []
        };

        store.setUser(newUser);
        this.renderAccountContent();
      });
    }

    // Déconnexion
    const logoutBtn = this.container.querySelector('#btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        store.setUser(null);
        this.renderAccountContent();
      });
    }

    // Connexion démo rapide
    this.container.querySelectorAll('.btn-quick-login').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.userId;
        store.switchDemoUser(uid);
        this.renderAccountContent();
      });
    });

    // Bouton inspecteur ERPNext
    const erpBtn = this.container.querySelector('#btn-view-erp-inspector');
    if (erpBtn) {
      erpBtn.addEventListener('click', () => {
        store.closeModal();
        store.openModal('erpnext-inspector');
      });
    }

    // Ajout d'adresse en ville
    const addAddrBtn = this.container.querySelector('#btn-add-address');
    if (addAddrBtn) {
      addAddrBtn.addEventListener('click', () => {
        const city = prompt('Ville (ex: Cotonou, Porto-Novo, Calavi) :') || 'Cotonou';
        const district = prompt('Quartier (ex: Haie Vive, Cadjèhoun, Akpakpa) :') || 'Cadjèhoun';
        const street = prompt('Rue et repère :') || 'Rue 12, Villa Horizon';

        if (store.state.user) {
          const updatedUser = { ...store.state.user };
          updatedUser.deliveryAddresses = updatedUser.deliveryAddresses || [];
          updatedUser.deliveryAddresses.push({
            id: 'addr-' + Date.now(),
            label: `Adresse ${updatedUser.deliveryAddresses.length + 1}`,
            city,
            district,
            street
          });
          store.setUser(updatedUser);
          this.renderAccountContent();
        }
      });
    }
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#account-modal-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'account';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      this.renderAccountContent();
    }
  }
}
