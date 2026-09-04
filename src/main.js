// Point d'entrée principal de la Single Page Application CTA BIMYNS
// Hero splitscreen (5155520.jpg) + sections marketing + modules ERPNext
import { store } from './state/store.js';
import { RoomsModal } from './components/RoomsModal.js';
import { LeisureModal } from './components/LeisureModal.js';
import { RestaurantModal } from './components/RestaurantModal.js';
import { GalleryModal } from './components/GalleryModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { AccountModal } from './components/AccountModal.js';
import { ERPNextInspector } from './components/ERPNextInspector.js';
import { QRScannerModal } from './components/QRScannerModal.js';

class CTAApp {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    this.stickyHeader = document.getElementById('site-sticky-header');
    this.heroEl = document.querySelector('.split-hero-container') || document.getElementById('accueil');

    this.initComponents();
    this.bindEvents();
    this.bindStickyHeader();
    this.bindGlobalState();

    setTimeout(() => {
      store.addNotification('Bienvenue au Complexe CTA BIMYNS', 'info');
    }, 600);
  }

  initComponents() {
    this.roomsModal = new RoomsModal(document.getElementById('rooms-modal-container'));
    this.leisureModal = new LeisureModal(document.getElementById('leisure-modal-container'));
    this.restaurantModal = new RestaurantModal(document.getElementById('restaurant-modal-container'));
    this.galleryModal = new GalleryModal(document.getElementById('gallery-modal-container'));
    this.cartDrawer = new CartDrawer(document.getElementById('cart-drawer-container'));
    this.checkoutModal = new CheckoutModal(document.getElementById('checkout-modal-container'));
    this.accountModal = new AccountModal(document.getElementById('account-modal-container'));
    this.erpInspector = new ERPNextInspector(document.getElementById('erp-inspector-container'));
    this.qrScanner = new QRScannerModal(
      document.getElementById('qr-scanner-container'),
      (qrCode, label) => {
        this.restaurantModal.setScannedQrCode(qrCode, label);
      }
    );
  }

  closeAllMenus() {
    document.querySelectorAll('.split-menu-links.is-open').forEach(menu => {
      menu.classList.remove('is-open');
    });
  }

  goHomeFromLogo() {
    store.closeModal();
    this.setActiveNav('home');
    document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth' });
  }

  bindEvents() {
    // Shared delegation — works for in-hero nav and sticky header (no duplicate IDs)
    document.addEventListener('click', (e) => {
      const burger = e.target.closest('.split-nav-burger');
      if (burger) {
        const header = burger.closest('header');
        const menu = header?.querySelector('.split-menu-links');
        menu?.classList.toggle('is-open');
        return;
      }

      const menuLink = e.target.closest('.split-menu-link');
      if (menuLink) {
        const action = menuLink.dataset.action || 'home';
        this.handleAction(action);
        this.setActiveNav(action);
        this.closeAllMenus();
        return;
      }

      const actionEl = e.target.closest('button[data-action], .room-card[data-action], .service-icon-item[data-action]');
      if (actionEl && !actionEl.classList.contains('split-menu-link')) {
        const action = actionEl.dataset.action;
        if (!action) return;
        this.handleAction(action);
        this.setActiveNav(action);
        this.closeAllMenus();
        return;
      }

      if (e.target.closest('.btn-account-top')) {
        store.openModal('account');
        return;
      }

      if (e.target.closest('.btn-cart-top')) {
        store.openModal('cart');
        return;
      }

      const currBtn = e.target.closest('.curr-btn');
      if (currBtn?.dataset.curr) {
        store.setCurrency(currBtn.dataset.curr);
        return;
      }

      const searchBtn = e.target.closest('.search-icon-btn');
      if (searchBtn) {
        const pill = searchBtn.closest('.search-input-pill');
        const field = pill?.querySelector('.search-field');
        // Mobile sticky: first tap expands the compact icon into a pill
        const isCompactSearch =
          window.matchMedia('(max-width: 900px)').matches &&
          (pill?.classList.contains('sticky-search-pill') ||
            pill?.closest('.split-top-tools'));
        if (isCompactSearch && !pill.classList.contains('is-expanded')) {
          pill.classList.add('is-expanded');
          field?.focus();
          return;
        }
        this.runSearch(field);
        return;
      }

      if (e.target.closest('[data-logo-home]')) {
        this.goHomeFromLogo();
      }
    });

    document.addEventListener('keydown', (e) => {
      const logo = e.target.closest?.('[data-logo-home]');
      if (logo && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.goHomeFromLogo();
        return;
      }

      const searchField = e.target.closest?.('.search-field');
      if (searchField && e.key === 'Enter') {
        e.preventDefault();
        this.runSearch(searchField);
      }
    });

    document.addEventListener('focusout', (e) => {
      const pill = e.target.closest?.('.sticky-search-pill');
      if (!pill?.classList.contains('is-expanded')) return;
      // Collapse when focus leaves the sticky search pill
      requestAnimationFrame(() => {
        if (!pill.contains(document.activeElement)) {
          pill.classList.remove('is-expanded');
        }
      });
    });

    document.getElementById('btn-hero-reserve')?.addEventListener('click', () => {
      store.openModal('rooms');
      this.setActiveNav('rooms');
    });

    document.getElementById('split-price-badge')?.addEventListener('click', () => {
      store.openModal('rooms');
      this.setActiveNav('rooms');
    });
  }

  bindStickyHeader() {
    if (!this.stickyHeader || !this.heroEl) return;

    const updateVisibility = () => {
      const heroBottom = this.heroEl.getBoundingClientRect().bottom;
      const show = heroBottom < 80;
      this.stickyHeader.classList.toggle('is-visible', show);
      this.stickyHeader.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (!show) {
        this.stickyHeader.querySelector('.split-menu-links')?.classList.remove('is-open');
        this.stickyHeader.querySelector('.sticky-search-pill')?.classList.remove('is-expanded');
      }
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
  }

  runSearch(inputEl) {
    const input = inputEl || document.querySelector('.search-field');
    const raw = input?.value || '';
    const q = raw.trim().toLowerCase();
    if (!q) return;

    if (/chambre|suite|room|héberg|heberg|nuit/.test(q)) {
      this.handleAction('rooms');
      this.setActiveNav('rooms');
    } else if (/loisir|piscine|tennis|club|sport/.test(q)) {
      this.handleAction('leisure');
      this.setActiveNav('leisure');
    } else if (/resto|restaurant|menu|manger|petit.?déj|breakfast/.test(q)) {
      this.handleAction('restaurant');
      this.setActiveNav('restaurant');
    } else if (/galerie|photo|image/.test(q)) {
      this.handleAction('gallery');
    } else {
      store.addNotification(`Recherche : « ${raw} » — essayez chambres, loisirs ou restaurant`, 'info');
    }
  }

  setActiveNav(action) {
    document.querySelectorAll('.split-menu-link').forEach(link => {
      link.classList.toggle('active', link.dataset.action === action);
    });
  }

  handleAction(action) {
    if (action === 'home') {
      store.closeModal();
      document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'rooms') {
      store.openModal('rooms');
    } else if (action === 'leisure') {
      store.openModal('leisure');
    } else if (action === 'restaurant') {
      store.openModal('restaurant');
    } else if (action === 'gallery') {
      store.openModal('gallery');
    } else if (action === 'erpnext') {
      store.openModal('erpnext-inspector');
    }
  }

  bindGlobalState() {
    store.subscribe((state) => {
      this.updateUI(state);
      this.renderToasts(state.notifications);
    });
    this.updateUI(store.state);
  }

  updateUI(state) {
    const { currency, user } = state;
    const cartCount = store.getCartCount();
    const showCart = cartCount > 0;

    document.querySelectorAll('.curr-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.curr === currency);
    });

    const badgePrice = document.getElementById('badge-display-price');
    if (badgePrice) {
      badgePrice.textContent = currency === 'EUR' ? '38 €' : '25 000F';
    }

    document.querySelectorAll('.btn-cart-top').forEach(btn => {
      btn.classList.toggle('is-hidden', !showCart);
      btn.setAttribute('aria-hidden', showCart ? 'false' : 'true');
    });

    document.querySelectorAll('.nav-cart-count').forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = showCart ? 'flex' : 'none';
    });

    document.querySelectorAll('.nav-account-label').forEach(label => {
      label.textContent = user ? user.name.split(' ')[0] : 'Mon Compte';
    });
  }

  renderToasts(notifications) {
    if (!this.toastContainer) return;
    const icon = {
      success: 'fa-check',
      error: 'fa-exclamation',
      info: 'fa-info',
    };
    this.toastContainer.innerHTML = notifications.map(n => `
      <div class="toast toast-${n.type}" role="status">
        <span class="toast-icon" aria-hidden="true"><i class="fas ${icon[n.type] || icon.info}"></i></span>
        <span class="toast-msg">${n.message}</span>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ctaApp = new CTAApp();
});
