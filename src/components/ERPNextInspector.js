// Modale Inspecteur de Payload & Configuration API RESTful ERPNext
import { store } from '../state/store.js';
import { ERPNextService } from '../state/erpnext.js';

export class ERPNextInspector {
  constructor(container) {
    this.container = container;
    this.render();
    store.subscribe(() => this.updateContent());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay erpnext-inspector-modal" id="erp-inspector-overlay">
        <div class="modal-card">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="pulse-dot"></span>
                <h2 class="modal-title">Inspecteur API RESTful ERPNext</h2>
              </div>
              <span class="modal-subtitle">Supervision en direct des payloads JSON, authentification et statuts REST</span>
            </div>
            <button class="modal-close-btn" id="erp-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps de l'inspecteur -->
          <div class="modal-body">
            <div class="erp-inspector-layout">
              <!-- Colonne Gauche : Configuration & Logs -->
              <div class="erp-config-panel">
                <h4 class="section-heading">⚙️ Paramètres du Connecteur ERP</h4>

                <div class="input-field-group">
                  <label class="input-label">URL Backend ERPNext</label>
                  <input type="url" class="form-input" id="cfg-erp-url" value="${store.state.erpConfig.baseUrl}" />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div class="input-field-group">
                    <label class="input-label">Clé API (api_key)</label>
                    <input type="text" class="form-input" id="cfg-erp-key" value="${store.state.erpConfig.apiKey}" />
                  </div>
                  <div class="input-field-group">
                    <label class="input-label">Secret API (api_secret)</label>
                    <input type="password" class="form-input" id="cfg-erp-secret" value="${store.state.erpConfig.apiSecret}" />
                  </div>
                </div>

                <div class="input-field-group">
                  <label class="input-label">Doctype Cible</label>
                  <input type="text" class="form-input" id="cfg-erp-doctype" value="${store.state.erpConfig.doctype}" readonly />
                </div>

                <!-- Mode Mock / Réel -->
                <div style="padding: 10px 12px; background: var(--cta-sand); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--cta-green-dark);">Mode Simulation Offline (Mock)</strong>
                    <p style="font-size: 0.72rem; color: #667766;">Idéal en environnement de test ou sans instance locale active.</p>
                  </div>
                  <input type="checkbox" id="cfg-erp-mock-toggle" ${store.state.erpConfig.autoSendMock ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--cta-green-primary); cursor: pointer;" />
                </div>

                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary btn-sm" id="btn-save-erp-cfg" style="flex: 1;">Enregistrer la configuration</button>
                  <button class="btn btn-primary btn-sm" id="btn-test-erp-call" style="flex: 1;">Tester la transmission</button>
                </div>

                <!-- Console de Logs Temps Réel -->
                <h4 class="section-heading" style="margin-top: 10px;">📜 Console des Événements API</h4>
                <div class="erp-log-list" id="erp-log-list">
                  <!-- Rempli par updateContent() -->
                </div>
              </div>

              <!-- Colonne Droite : Visualiseur JSON Dynamique -->
              <div class="erp-payload-panel">
                <div class="code-viewer-header">
                  <div>
                    <strong style="font-size: 0.88rem; color: var(--cta-green-dark);">Dernier Payload JSON compilé pour ERPNext</strong>
                    <span style="font-size: 0.72rem; color: #778877; display: block;">Endpoint : POST /api/resource/Sales Order</span>
                  </div>
                  <button class="btn btn-secondary btn-sm" id="btn-copy-json" style="padding: 4px 10px; font-size: 0.75rem;">
                    📋 Copier le JSON
                  </button>
                </div>

                <pre class="code-viewer-container" id="json-code-viewer">
                  <!-- JSON coloré -->
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateContent();
  }

  bindEvents() {
    this.container.querySelector('#erp-close-btn').addEventListener('click', () => {
      store.closeModal();
    });

    const overlay = this.container.querySelector('#erp-inspector-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) store.closeModal();
    });

    // Enregistrer config
    this.container.querySelector('#btn-save-erp-cfg').addEventListener('click', () => {
      const baseUrl = this.container.querySelector('#cfg-erp-url').value;
      const apiKey = this.container.querySelector('#cfg-erp-key').value;
      const apiSecret = this.container.querySelector('#cfg-erp-secret').value;
      const autoSendMock = this.container.querySelector('#cfg-erp-mock-toggle').checked;

      store.updateErpConfig({ baseUrl, apiKey, apiSecret, autoSendMock });
      store.addNotification('Configuration ERPNext enregistrée !', 'success');
      store.logErpMessage('Configuration API mise à jour par l’utilisateur', 'info');
    });

    // Toggle mock
    this.container.querySelector('#cfg-erp-mock-toggle').addEventListener('change', (e) => {
      store.updateErpConfig({ autoSendMock: e.target.checked });
      store.logErpMessage(`Mode Simulation basculé sur : ${e.target.checked ? 'ACTIF' : 'INACTIF'}`, 'info');
    });

    // Copier JSON
    this.container.querySelector('#btn-copy-json').addEventListener('click', () => {
      const codeViewer = this.container.querySelector('#json-code-viewer');
      if (codeViewer) {
        navigator.clipboard.writeText(codeViewer.innerText).then(() => {
          store.addNotification('JSON copié dans le presse-papier !', 'info');
        });
      }
    });

    // Tester la transmission
    this.container.querySelector('#btn-test-erp-call').addEventListener('click', async () => {
      store.logErpMessage('Lancement du test de transmission...', 'info');
      const mockCart = store.state.cart.length > 0 ? store.state.cart : [
        {
          id: 'TEST-CAPITAINE',
          title: 'Test Poisson Capitaine Braisé',
          category: 'restaurant',
          priceXOF: 9500,
          priceEUR: 14.5,
          quantity: 1,
          details: 'Livraison sur Transat'
        }
      ];

      await ERPNextService.submitOrder({
        cart: mockCart,
        user: store.state.user,
        delivery: { type: 'pool_garden', label: 'Transat Piscine Zone Nord' },
        payment: { method: 'mobile_money', provider: 'mtn_momo', status: 'Test Authorized' },
        totals: store.getCartTotals()
      });
    });
  }

  updateContent() {
    const overlay = this.container.querySelector('#erp-inspector-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'erpnext-inspector';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      // 1. Mise à jour du JSON affiché
      const codeViewer = this.container.querySelector('#json-code-viewer');
      const { lastPayload, logs } = store.state.erpConfig;

      // Si pas encore de commande, générer un exemple avec le panier actuel
      const displayPayload = lastPayload || ERPNextService.buildSalesOrderPayload({
        cart: store.state.cart.length > 0 ? store.state.cart : [
          {
            id: 'SUITE-SAFARI',
            title: 'Suite Safari Zèbre',
            category: 'room',
            priceXOF: 75000,
            priceEUR: 115,
            quantity: 1,
            details: '2 nuits (2 adultes)'
          },
          {
            id: 'PLAT-POISSON',
            title: 'Poisson Capitaine Braisé',
            category: 'restaurant',
            priceXOF: 9500,
            priceEUR: 14.5,
            quantity: 2,
            details: 'Livraison Transat Zone Nord'
          }
        ],
        user: store.state.user,
        delivery: { type: 'pool_garden', label: 'Transat Piscine Zone Nord' },
        payment: { method: 'mobile_money', provider: 'mtn_momo', status: 'Authorized' },
        totals: store.getCartTotals()
      });

      if (codeViewer) {
        codeViewer.innerHTML = this.syntaxHighlight(JSON.stringify(displayPayload, null, 2));
      }

      // 2. Mise à jour des logs
      const logList = this.container.querySelector('#erp-log-list');
      if (logList) {
        logList.innerHTML = logs.map(l => `
          <div class="erp-log-item">
            <span class="log-time">[${l.time}]</span>
            <span class="log-msg-${l.type}">${l.message}</span>
          </div>
        `).join('');
      }
    }
  }

  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'color: #ffb74d;'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #81d4fa; font-weight: bold;'; // key
        } else {
          cls = 'color: #c5e1a5;'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #ba68c8;'; // boolean
      } else if (/null/.test(match)) {
        cls = 'color: #e57373;'; // null
      }
      return '<span style="' + cls + '">' + match + '</span>';
    });
  }
}
