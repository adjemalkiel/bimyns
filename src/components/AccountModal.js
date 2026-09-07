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
        <div class="modal-card account-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Espace Client & Compte CTA BIMYNS</h2>
              <span class="modal-subtitle">Gestion de vos séjours, abonnements sports & adresses de livraison</span>
            </div>
            <button class="modal-close-btn" id="account-close-btn" title="Fermer" aria-label="Fermer">✕</button>
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
        <div class="account-auth-panel">
          <div class="modal-tabs account-auth-tabs">
            <button type="button" class="tab-btn ${this.authMode === 'login' ? 'active' : ''}" id="tab-login-btn">
              <i class="fas fa-right-to-bracket" aria-hidden="true"></i> Connexion
            </button>
            <button type="button" class="tab-btn ${this.authMode === 'register' ? 'active' : ''}" id="tab-register-btn">
              <i class="fas fa-user-plus" aria-hidden="true"></i> Créer un compte
            </button>
          </div>

          <form id="auth-form" class="account-auth-form">
            <div class="input-field-group">
              <label class="input-label" for="auth-email">Adresse Email</label>
              <input type="email" class="form-input" id="auth-email" required placeholder="nom@domaine.com" />
            </div>

            <div class="input-field-group">
              <label class="input-label" for="auth-password">Mot de passe</label>
              <input type="password" class="form-input" id="auth-password" required placeholder="••••••••" />
            </div>

            ${this.authMode === 'register' ? `
              <div class="input-field-group">
                <label class="input-label" for="auth-name">Nom complet</label>
                <input type="text" class="form-input" id="auth-name" required placeholder="Prénom Nom" />
              </div>
              <div class="input-field-group">
                <label class="input-label" for="auth-phone">Numéro de Téléphone (Bénin / WhatsApp)</label>
                <input type="tel" class="form-input" id="auth-phone" required placeholder="+229 XX XX XX XX" />
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary account-auth-submit">
              <span>${this.authMode === 'login' ? 'Se connecter' : 'Valider l’inscription'}</span>
            </button>
          </form>

          <!-- Comptes de Démonstration Rapides -->
          <div class="account-demo-box">
            <span class="account-demo-label">
              <i class="fas fa-bolt" aria-hidden="true"></i> Comptes Démo Pré-configurés
            </span>
            <div class="account-demo-list">
              <button type="button" class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-8942">
                <i class="fas fa-hotel" aria-hidden="true"></i>
                <span><strong>Dr. Kofi Mensah</strong> (Résident Suite 101 - Note autorisée)</span>
              </button>
              <button type="button" class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-6721">
                <i class="fas fa-city" aria-hidden="true"></i>
                <span><strong>Amina Touré</strong> (Visiteur externe - Cotonou)</span>
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
          <div class="user-profile-meta">
            <div class="user-profile-name-row">
              <h3 class="user-profile-name">${user.name}</h3>
              ${user.isResident ? `
                <span class="badge badge-resident"><i class="fas fa-hotel" aria-hidden="true"></i> Client Résident : ${user.roomNumber}</span>
              ` : `
                <span class="badge badge-green"><i class="fas fa-user" aria-hidden="true"></i> Visiteur Externe</span>
              `}
            </div>
            <span class="user-profile-contact">
              <i class="fas fa-envelope" aria-hidden="true"></i> ${user.email}
              <span class="user-profile-sep" aria-hidden="true">·</span>
              <i class="fas fa-phone" aria-hidden="true"></i> ${user.phone}
            </span>
            ${user.isResident ? `
              <span class="user-profile-folio">
                <i class="fas fa-credit-card" aria-hidden="true"></i>
                Solde Note de Chambre : ${user.roomFolioBalanceXOF.toLocaleString('fr-FR')} FCFA
              </span>
            ` : ''}
          </div>
          <button type="button" class="btn btn-secondary btn-sm account-logout-btn" id="btn-logout">
            <i class="fas fa-right-from-bracket" aria-hidden="true"></i> Déconnexion
          </button>
        </div>

        <div class="account-dashboard-grid">
          <!-- 1. Adresses de Livraison Enregistrées (pour la ville) -->
          <div class="profile-card-section">
            <div class="profile-section-head">
              <h4 class="section-heading"><i class="fas fa-location-dot" aria-hidden="true"></i> Adresses de Livraison en Ville</h4>
              <button type="button" class="btn btn-secondary btn-sm account-section-btn" id="btn-add-address">
                <i class="fas fa-plus" aria-hidden="true"></i> Ajouter
              </button>
            </div>

            ${user.deliveryAddresses && user.deliveryAddresses.length > 0 ? `
              <div class="account-list">
                ${user.deliveryAddresses.map(addr => `
                  <div class="account-list-item">
                    <strong>${addr.label}</strong> : ${addr.street}, ${addr.district} (${addr.city})
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="account-empty">Aucune adresse enregistrée pour le moment.</p>
            `}
          </div>

          <!-- 2. Abonnements en cours (Piscine / Tennis) -->
          <div class="profile-card-section">
            <h4 class="section-heading"><i class="fas fa-trophy" aria-hidden="true"></i> Abonnements en Cours (Club)</h4>
            ${user.activeSubscriptions && user.activeSubscriptions.length > 0 ? `
              <div class="account-list">
                ${user.activeSubscriptions.map(sub => `
                  <div class="account-list-item account-list-item-row">
                    <div>
                      <strong class="account-list-title">${sub.title}</strong>
                      <div class="account-list-sub">Valide jusqu'au ${sub.validUntil}</div>
                    </div>
                    <span class="badge badge-gold">${sub.badge}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="account-empty">Aucun abonnement actif. Découvrez nos formules dans la section Loisirs.</p>
            `}
          </div>
        </div>

        <!-- 3. Historique des Commandes & Réservations Synchronisées ERPNext -->
        <div class="profile-card-section">
          <div class="profile-section-head">
            <h4 class="section-heading"><i class="fas fa-box" aria-hidden="true"></i> Historique des Commandes & Réservations (ERPNext)</h4>
            <button type="button" class="btn btn-secondary btn-sm account-section-btn" id="btn-view-erp-inspector">
              <i class="fas fa-magnifying-glass" aria-hidden="true"></i> Inspecter flux ERPNext
            </button>
          </div>

          ${user.orderHistory && user.orderHistory.length > 0 ? `
            <div class="account-list">
              ${user.orderHistory.map(order => `
                <div class="account-list-item account-list-item-row">
                  <div>
                    <div class="account-order-id">${order.orderId}</div>
                    <div class="account-list-sub">${order.date} • ${order.type}</div>
                  </div>
                  <div class="account-order-right">
                    <div class="account-order-total">${order.totalXOF.toLocaleString('fr-FR')} FCFA</div>
                    <span class="badge badge-green">${order.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="account-empty">Aucune commande passée récemment.</p>
          `}
        </div>

        <!-- Bascule Rapide Utilisateur Démo -->
        <div class="account-switcher">
          <span class="account-switcher-label">Tester avec un autre profil :</span>
          <div class="account-switcher-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-8942">Dr. Kofi (Résident)</button>
            <button type="button" class="btn btn-secondary btn-sm btn-quick-login" data-user-id="USR-6721">Amina (Externe)</button>
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
