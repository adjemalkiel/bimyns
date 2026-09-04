// Service d'intégration API RESTful avec ERPNext pour CTA BIMYNS
import { store } from './store.js';

export class ERPNextService {
  /**
   * Construit le payload JSON structuré conforme au schéma Sales Order d'ERPNext
   */
  static buildSalesOrderPayload({ cart, user, delivery, payment, totals, notes = '' }) {
    const today = new Date().toISOString().split('T')[0];
    const orderRef = `BIM-${Date.now().toString().slice(-6)}`;

    // Construction des lignes d'articles ERPNext
    const items = cart.map((item, idx) => {
      let itemGroup = 'Services Hôteliers';
      if (item.category === 'room') itemGroup = 'Hébergement';
      if (item.category === 'leisure') itemGroup = 'Sports & Loisirs';
      if (item.category === 'restaurant') itemGroup = 'Restauration & Bar';

      return {
        idx: idx + 1,
        item_code: item.id.toUpperCase(),
        item_name: item.title,
        description: `${item.title} - ${item.details || 'Prestation standard'}`,
        item_group: itemGroup,
        qty: item.quantity || 1,
        uom: item.category === 'room' ? 'Nuitée' : item.category === 'leisure' ? 'Pass' : 'Portion',
        rate: item.priceXOF,
        amount: item.priceXOF * (item.quantity || 1),
        custom_category: item.category,
        custom_metadata: item.metadata || {}
      };
    });

    // Ajout de la taxe écotouristique si applicable
    const taxes = [
      {
        charge_type: 'On Net Total',
        account_head: 'Taxes Écotouristiques de Séjour - CTA BIMYNS',
        description: 'Contribution environnementale & préservation lacustre (2%)',
        rate: 2.0,
        tax_amount: totals.ecoTaxXOF
      }
    ];

    // Payload global ERPNext Sales Order
    const payload = {
      doctype: store.state.erpConfig.doctype || 'Sales Order',
      naming_series: 'SO-CTA-.YYYY.-',
      title: `Commande Web CTA BIMYNS - ${user ? user.name : 'Client Invité'} (${orderRef})`,
      transaction_date: today,
      delivery_date: today,
      customer: user ? user.name : 'Client Comptoir Web',
      customer_name: user ? user.name : 'Client Invité',
      contact_email: user ? user.email : '',
      contact_mobile: user ? user.phone : '',
      company: 'CTA BIMYNS Complexe Hôtelier & Loisirs',
      currency: 'XOF',
      conversion_rate: 1.0,
      selling_price_list: 'Tarifs Publics Bénin',
      
      // Informations personnalisées spécifiques CTA BIMYNS dans ERPNext
      custom_cta_order_ref: orderRef,
      custom_is_resident: user ? !!user.isResident : false,
      custom_resident_room: user ? (user.roomNumber || '') : '',
      
      // Détails de livraison
      custom_delivery_mode: delivery.type, // 'city' | 'room' | 'pool_garden'
      custom_delivery_details: {
        type: delivery.type,
        destination_label: delivery.label,
        address: delivery.address || null,
        city: delivery.city || null,
        room_number: delivery.roomNumber || null,
        zone_id: delivery.zoneId || null,
        qr_code_scanned: delivery.qrCode || null,
        contact_phone: delivery.phone || (user ? user.phone : '')
      },

      // Modalité de paiement
      custom_payment_method: payment.method, // 'online_card' | 'mobile_money' | 'deferred_room' | 'deferred_cod'
      custom_payment_provider: payment.provider || 'N/A', // 'mtn_momo' | 'moov' | 'celtiis' | 'visa_mastercard' | 'room_folio' | 'cash_on_delivery'
      custom_payment_status: payment.status || 'Pending Verification',
      custom_payment_transaction_id: payment.transactionId || `TX-${Date.now()}`,
      custom_room_folio_charged: payment.method === 'deferred_room',

      // Totaux financiers
      total_qty: items.reduce((acc, i) => acc + i.qty, 0),
      net_total: totals.subtotalXOF,
      total_taxes_and_charges: totals.ecoTaxXOF,
      grand_total: totals.finalXOF,
      rounded_total: totals.finalXOF,

      // Lignes et taxes
      items: items,
      taxes: taxes,

      // Remarques et instructions spéciales
      order_notes: notes || `Commande passée depuis le frontend web CTA BIMYNS. Type: ${delivery.label}`
    };

    return payload;
  }

  /**
   * Envoie la commande vers l'ERPNext (ou simule l'envoi avec succès si hors ligne / mock activé)
   */
  static async submitOrder({ cart, user, delivery, payment, totals, notes = '' }) {
    const payload = this.buildSalesOrderPayload({ cart, user, delivery, payment, totals, notes });
    const { baseUrl, apiKey, apiSecret, autoSendMock } = store.state.erpConfig;

    store.logErpMessage(`Préparation de la soumission de commande ${payload.custom_cta_order_ref}...`, 'info');
    store.setLastErpPayload(payload);

    // Si le mode simulation est forcé ou si l'ERP n'est pas joignable en réseau local
    if (autoSendMock) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Latence réseau réaliste

      const mockResponse = {
        data: {
          name: `SO-CTA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          docstatus: 1, // Submitted
          status: 'To Deliver and Bill',
          message: 'Commande enregistrée avec succès dans ERPNext',
          erp_customer: payload.customer,
          grand_total: payload.grand_total,
          currency: payload.currency,
          synced_at: new Date().toISOString()
        }
      };

      store.logErpMessage(
        `[MOCK SUCCESS] Document ERPNext créé : ${mockResponse.data.name}`,
        'success',
        mockResponse
      );
      store.setLastErpPayload(payload, mockResponse);

      // Ajouter à l'historique utilisateur si connecté
      if (user) {
        const updatedUser = { ...user };
        updatedUser.orderHistory = updatedUser.orderHistory || [];
        updatedUser.orderHistory.unshift({
          orderId: mockResponse.data.name,
          date: new Date().toLocaleString('fr-FR'),
          type: cart.map(i => i.title).join(', '),
          totalXOF: totals.finalXOF,
          status: 'Enregistré dans ERPNext (' + delivery.label + ')',
          paymentMethod: payment.provider || payment.method
        });
        store.setUser(updatedUser);
      }

      return { success: true, data: mockResponse.data, isMock: true };
    }

    // Envoi réel vers l'API REST d'ERPNext
    try {
      const endpoint = `${baseUrl.replace(/\/$/, '')}/api/resource/Sales Order`;
      store.logErpMessage(`POST vers ${endpoint}`, 'info');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur HTTP ${res.status}: ${errorText}`);
      }

      const resData = await res.json();
      store.logErpMessage(`[ERPNext OK] Succès : ${resData.data?.name}`, 'success', resData);
      store.setLastErpPayload(payload, resData);
      return { success: true, data: resData.data, isMock: false };
    } catch (err) {
      store.logErpMessage(`[ERREUR ERPNext] Échec de transmission REST : ${err.message}`, 'error', { error: err.message });
      // Fallback gracieux en mode simulation
      return { success: false, error: err.message, payload };
    }
  }
}
