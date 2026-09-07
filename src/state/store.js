// Store réactif pour l'état de l'application CTA BIMYNS
import { MOCK_USERS } from '../data/catalog.js';

class AppStore {
  constructor() {
    this.listeners = new Set();
    
    // Chargement de l'état depuis localStorage si existant
    const savedCart = localStorage.getItem('cta_cart');
    const savedUser = localStorage.getItem('cta_user');
    const savedTime = localStorage.getItem('cta_time_of_day');
    const savedErpConfig = localStorage.getItem('cta_erp_config');
    let erpConfig = savedErpConfig ? JSON.parse(savedErpConfig) : null;
    // Migrate old mock/remote defaults → local Kamra stack
    if (erpConfig && (erpConfig.baseUrl || '').includes('erp.bimyns.com')) {
      erpConfig = {
        ...erpConfig,
        baseUrl: 'http://localhost:8080',
        kamraProperty: erpConfig.kamraProperty || 'CTA BIMYNS',
        autoSendMock: false,
      };
      localStorage.setItem('cta_erp_config', JSON.stringify(erpConfig));
    }

    this.state = {
      user: savedUser ? JSON.parse(savedUser) : MOCK_USERS[0], // Connecté par défaut avec Dr. Kofi Mensah (Résident)
      cart: savedCart ? JSON.parse(savedCart) : [],
      currency: 'XOF', // 'XOF' (FCFA) ou 'EUR'
      timeOfDay: savedTime || 'sunset', // 'day', 'sunset', 'night'
      timeHour: savedTime === 'day' ? 12 : savedTime === 'night' ? 22 : 18.5,
      activeModal: null, // 'rooms', 'leisure', 'restaurant', 'account', 'cart', 'checkout', 'qr-scanner', 'erpnext-inspector'
      activeModalTab: null,
      selectedDeliveryZone: 'Transat Piscine - Zone Nord (Grand Bassin)',
      activeZoneId: null,
      notifications: [],
      erpConfig: erpConfig || {
        baseUrl: 'http://localhost:8080',
        apiKey: '',
        apiSecret: '',
        doctype: 'Sales Order',
        // Kamra PMS property for room bookings (public_api.book)
        kamraProperty: 'CTA BIMYNS',
        autoSendMock: false,
        lastPayload: null,
        lastResponse: null,
        logs: [
          { time: new Date().toLocaleTimeString(), type: 'info', message: 'Connecteur Kamra/ERPNext initialisé (http://localhost:8080)' }
        ]
      }
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- Gestion de l'Utilisateur ---
  setUser(user) {
    this.state.user = user;
    if (user) {
      localStorage.setItem('cta_user', JSON.stringify(user));
      this.addNotification(`Bienvenue, ${user.name}`, 'success');
    } else {
      localStorage.removeItem('cta_user');
      this.addNotification('Vous êtes déconnecté', 'info');
    }
    this.notify();
  }

  switchDemoUser(userId) {
    const target = MOCK_USERS.find(u => u.id === userId);
    if (target) {
      this.setUser(target);
    }
  }

  // --- Gestion du Panier Unifié ---
  addToCart(item) {
    // Structure standardisée pour un article
    // item: { id, title, category ('room' | 'leisure' | 'restaurant'), priceXOF, priceEUR, quantity, details, image }
    const existingIndex = this.state.cart.findIndex(i => i.id === item.id && JSON.stringify(i.details) === JSON.stringify(item.details));
    
    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += (item.quantity || 1);
    } else {
      this.state.cart.push({
        ...item,
        cartItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        quantity: item.quantity || 1
      });
    }

    localStorage.setItem('cta_cart', JSON.stringify(this.state.cart));
    this.addNotification(`Ajouté au panier : ${item.title}`, 'success');
    this.notify();
  }

  updateCartItemQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }
    const item = this.state.cart.find(i => i.cartItemId === cartItemId);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem('cta_cart', JSON.stringify(this.state.cart));
      this.notify();
    }
  }

  removeFromCart(cartItemId) {
    this.state.cart = this.state.cart.filter(i => i.cartItemId !== cartItemId);
    localStorage.setItem('cta_cart', JSON.stringify(this.state.cart));
    this.notify();
  }

  clearCart() {
    this.state.cart = [];
    localStorage.removeItem('cta_cart');
    this.notify();
  }

  getCartCount() {
    return this.state.cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  }

  getCartTotals() {
    const totalXOF = this.state.cart.reduce((sum, i) => sum + (i.priceXOF * (i.quantity || 1)), 0);
    const totalEUR = this.state.cart.reduce((sum, i) => sum + (i.priceEUR * (i.quantity || 1)), 0);
    // Taxe de séjour écotouristique (2%)
    const ecoTaxXOF = Math.round(totalXOF * 0.02);
    const ecoTaxEUR = +(totalEUR * 0.02).toFixed(2);
    
    return {
      subtotalXOF: totalXOF,
      subtotalEUR: totalEUR,
      ecoTaxXOF,
      ecoTaxEUR,
      finalXOF: totalXOF + ecoTaxXOF,
      finalEUR: +(totalEUR + ecoTaxEUR).toFixed(2)
    };
  }

  setCurrency(curr) {
    this.state.currency = curr;
    this.notify();
  }

  // --- Gestion du Temps / Éclairage ---
  setTimeOfDay(mode) {
    this.state.timeOfDay = mode;
    if (mode === 'day') this.state.timeHour = 12;
    if (mode === 'sunset') this.state.timeHour = 18.5;
    if (mode === 'night') this.state.timeHour = 22;
    localStorage.setItem('cta_time_of_day', mode);
    this.notify();
  }

  setTimeHour(hour) {
    this.state.timeHour = hour;
    if (hour >= 8 && hour < 17) {
      this.state.timeOfDay = 'day';
    } else if (hour >= 17 && hour < 20.5) {
      this.state.timeOfDay = 'sunset';
    } else {
      this.state.timeOfDay = 'night';
    }
    localStorage.setItem('cta_time_of_day', this.state.timeOfDay);
    this.notify();
  }

  // --- Modales & Navigation ---
  openModal(modalName, tab = null) {
    this.state.activeModal = modalName;
    this.state.activeModalTab = tab;
    this.notify();
  }

  closeModal() {
    this.state.activeModal = null;
    this.state.activeModalTab = null;
    this.notify();
  }

  setActiveZone(zoneId) {
    this.state.activeZoneId = zoneId;
    this.notify();
  }

  setSelectedDeliveryZone(zoneName) {
    this.state.selectedDeliveryZone = zoneName;
    this.notify();
  }

  // --- ERPNext Config & Logs ---
  updateErpConfig(newConfig) {
    this.state.erpConfig = { ...this.state.erpConfig, ...newConfig };
    localStorage.setItem('cta_erp_config', JSON.stringify(this.state.erpConfig));
    this.notify();
  }

  logErpMessage(message, type = 'info', data = null) {
    const logEntry = {
      time: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    this.state.erpConfig.logs.unshift(logEntry);
    if (this.state.erpConfig.logs.length > 50) this.state.erpConfig.logs.pop();
    this.notify();
  }

  setLastErpPayload(payload, response = null) {
    this.state.erpConfig.lastPayload = payload;
    this.state.erpConfig.lastResponse = response;
    this.notify();
  }

  // --- Notifications Toast ---
  addNotification(message, type = 'info') {
    const notif = {
      id: Date.now() + Math.random(),
      message,
      type
    };
    this.state.notifications.push(notif);
    this.notify();

    setTimeout(() => {
      this.state.notifications = this.state.notifications.filter(n => n.id !== notif.id);
      this.notify();
    }, 4000);
  }
}

export const store = new AppStore();
