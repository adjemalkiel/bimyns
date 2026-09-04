// Modale Scanner de QR Code Physique (Pour la commande sur transat ou table au CTA BIMYNS)
import { store } from '../state/store.js';

export class QRScannerModal {
  constructor(container, onQrScanned) {
    this.container = container;
    this.onQrScanned = onQrScanned;
    this.stream = null;

    this.render();
    store.subscribe(() => this.updateVisibility());
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="qr-scanner-overlay">
        <div class="modal-card" style="max-width: 520px;">
          <!-- En-tête -->
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Scanner QR Code Emplacement</h2>
              <span class="modal-subtitle">Pointez la caméra vers le QR Code gravé sur votre transat ou table</span>
            </div>
            <button class="modal-close-btn" id="qr-close-btn" title="Fermer">✕</button>
          </div>

          <!-- Corps du scanner -->
          <div class="modal-body">
            <div class="qr-scanner-box">
              <div class="qr-viewfinder" id="qr-viewfinder">
                <video id="qr-camera-feed" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
                <div class="qr-laser"></div>
                <div id="qr-fallback-msg" style="color: #ffffff; font-size: 0.82rem; padding: 20px; z-index: 2;">
                  <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">📷</span>
                  Prêt à scanner le transat ou la table
                </div>
              </div>

              <div style="font-size: 0.82rem; color: #556658;">
                Le scan associe instantanément vos commandes de plats et cocktails à votre position géographique au complexe.
              </div>

              <!-- Boutons de Simulation Rapide (très pratique sur desktop / tests) -->
              <div style="width: 100%; background: var(--cta-sand); border: 1px solid var(--cta-sand-border); padding: 14px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
                <span style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--cta-green-dark);">
                  ⚡ Simuler un scan de démonstration :
                </span>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button class="btn btn-secondary btn-sm btn-sim-qr" data-code="QR-POOL-N04" data-label="Transat Piscine - Zone Nord (Grand Bassin)">
                    🏊‍♂️ Transat #04 - Zone Bassin Nord
                  </button>
                  <button class="btn btn-secondary btn-sm btn-sim-qr" data-code="QR-POOL-S12" data-label="Transat Piscine - Zone Sud (Cascade)">
                    🌊 Transat #12 - Cascade Bassin Sud
                  </button>
                  <button class="btn btn-secondary btn-sm btn-sim-qr" data-code="QR-LAKE-P02" data-label="Ponton Pavillon sur l’Eau (Table Lac #2)">
                    🛖 Table #2 - Ponton Pavillon sur l'Eau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelector('#qr-close-btn').addEventListener('click', () => {
      this.stopCamera();
      store.closeModal();
    });

    const overlay = this.container.querySelector('#qr-scanner-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.stopCamera();
        store.closeModal();
      }
    });

    // Simulation de scan QR
    this.container.querySelectorAll('.btn-sim-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const label = btn.dataset.label;
        this.triggerSuccessfulScan(code, label);
      });
    });
  }

  async startCamera() {
    const video = this.container.querySelector('#qr-camera-feed');
    const fallback = this.container.querySelector('#qr-fallback-msg');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (video) {
          video.srcObject = this.stream;
          video.style.display = 'block';
          if (fallback) fallback.style.display = 'none';
        }
      } catch (err) {
        // En cas de refus de permission ou d'absence de caméra physique, fallback sur la simulation
        if (fallback) fallback.textContent = 'Caméra non accessible ou simulée. Utilisez les raccourcis ci-dessous.';
      }
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  triggerSuccessfulScan(qrCode, zoneLabel) {
    this.stopCamera();
    store.addNotification(`QR Code validé : ${zoneLabel}`, 'success');
    if (this.onQrScanned) {
      this.onQrScanned(qrCode, zoneLabel);
    }
    store.closeModal();
    store.openModal('restaurant');
  }

  updateVisibility() {
    const overlay = this.container.querySelector('#qr-scanner-overlay');
    if (!overlay) return;

    const isActive = store.state.activeModal === 'qr-scanner';
    overlay.classList.toggle('active', isActive);

    if (isActive) {
      this.startCamera();
    } else {
      this.stopCamera();
    }
  }
}
