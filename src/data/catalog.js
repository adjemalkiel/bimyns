// Catalogue et données du complexe écotouristique CTA BIMYNS
// Intégrant l'ensemble des 22 photographies réelles du complexe

export const ALL_RESORT_PHOTOS = [
  { id: 'logo', src: '/assets/906078286.jpg', title: 'Logo Officiel CTA BIMYNS', tag: 'Identité' },
  { id: 'main-building', src: '/assets/906078598.jpg', title: 'Bâtiment Principal & Balcon Circulaire', tag: 'Architecture' },
  { id: 'twilight', src: '/assets/906078583.jpg', title: 'Crépuscule Féerique sur le Lac', tag: 'Ambiance' },
  { id: 'pool-cascade', src: '/assets/la-piscine-au-3-bassins.jpg', title: 'Piscine aux 3 Bassins en Cascade', tag: 'Loisirs' },
  { id: 'pool-deck', src: '/assets/906078633.jpg', title: 'Plage des Bassins & Palmiers', tag: 'Loisirs' },
  { id: 'waiter', src: '/assets/membre-du-personnel.jpg', title: 'Service Restaurant & Bar aux Transats', tag: 'Personnel' },
  { id: 'lake-pavilion', src: '/assets/le-lac-artificel-apres.jpg', title: 'Pavillon sur l’Eau & Ponton', tag: 'Restauration' },
  { id: 'resort-aerial', src: '/assets/bimyns-hotels-resorts.jpg', title: 'Vue Panoramique du Complexe', tag: 'Vue d’ensemble' },
  { id: 'suite-safari', src: '/assets/906078607.jpg', title: 'Suite Safari Zèbre', tag: 'Hébergement' },
  { id: 'chambre-tribale', src: '/assets/906078592.jpg', title: 'Chambre Tribale Authentique', tag: 'Hébergement' },
  { id: 'chambre-standard', src: '/assets/notre-chambre.jpg', title: 'Chambre Confort Standard', tag: 'Hébergement' },
  { id: 'chambre-twin', src: '/assets/notre-chambre (1).jpg', title: 'Chambre Confort Vue Intérieure', tag: 'Hébergement' },
  { id: 'suite-lounge', src: '/assets/906078603.jpg', title: 'Salon & Espace Détente Suite', tag: 'Hébergement' },
  { id: 'room-detail', src: '/assets/906078577.jpg', title: 'Literie Supérieure & Tête de Lit', tag: 'Hébergement' },
  { id: 'room-bathroom', src: '/assets/906078595.jpg', title: 'Salle de Bain Marbrée', tag: 'Hébergement' },
  { id: 'room-balcony-view', src: '/assets/906078622.jpg', title: 'Balcon Privatif avec Vue', tag: 'Hébergement' },
  { id: 'garden-path', src: '/assets/906078614.jpg', title: 'Allée Pavée & Jardins Tropicaux', tag: 'Environnement' },
  { id: 'lush-gardens', src: '/assets/906078611.jpg', title: 'Cocoteraie & Végétation Écologique', tag: 'Environnement' },
  { id: 'lake-tranquil', src: '/assets/906078628.jpg', title: 'Rives du Lac Artificiel', tag: 'Environnement' },
  { id: 'dining-terrace', src: '/assets/906078568.jpg', title: 'Table Gastronomique au Bord de l’Eau', tag: 'Restauration' },
  { id: 'breakfast-spread', src: '/assets/906078574.jpg', title: 'Petit-Déjeuner Continental & Fruits Frais', tag: 'Restauration' },
  { id: 'appetizer-tapas', src: '/assets/906078589.jpg', title: 'Assiette Dégustation Tapas Africains', tag: 'Restauration' }
];

export const ROOMS_CATALOG = [
  {
    id: 'suite-safari-zebre',
    name: 'Suite Safari Zèbre',
    category: 'Suites Exécutives',
    tagline: 'Élégance sauvage & confort d’exception',
    description: 'Une suite spacieuse inspirée des réserves africaines avec des motifs zébrés raffinés, tête de lit artisanale tressée, climatisation silencieuse, écran plat, bureau et salon privé.',
    priceXOF: 75000,
    priceEUR: 115,
    capacity: '2 Adultes + 1 Enfant',
    maxGuests: 3,
    size: '42 m²',
    bed: 'Lit King Size (200x200)',
    view: 'Vue panoramique sur le lac artificiel et la cocoteraie',
    image: '/assets/906078607.jpg',
    gallery: [
      '/assets/906078607.jpg',
      '/assets/906078603.jpg',
      '/assets/906078598.jpg',
      '/assets/906078611.jpg'
    ],
    amenities: [
      'Climatisation split',
      'Wi-Fi haut débit par fibre',
      'TV écran plat satellite',
      'Salle de bain privative marbrée',
      'Mini-bar & plateau de courtoisie',
      'Accès illimité aux 3 bassins de la piscine',
      'Petit-déjeuner buffet inclus'
    ]
  },
  {
    id: 'chambre-tribale',
    name: 'Chambre Tribale',
    category: 'Chambres Supérieures',
    tagline: 'Authenticité béninoise & artisanat noble',
    description: 'Baignée de lumière naturelle, cette chambre met en valeur les tissus traditionnels et le mobilier en bois massif sculpté par des artisans locaux. Idéale pour les séjours romantiques ou d’affaires au calme.',
    priceXOF: 55000,
    priceEUR: 84,
    capacity: '2 Adultes',
    maxGuests: 2,
    size: '32 m²',
    bed: 'Lit Queen Size confortable',
    view: 'Vue sur les jardins tropicaux et les allées pavées',
    image: '/assets/906078592.jpg',
    gallery: [
      '/assets/906078592.jpg',
      '/assets/906078577.jpg',
      '/assets/906078595.jpg',
      '/assets/906078622.jpg'
    ],
    amenities: [
      'Climatisation',
      'Wi-Fi haut débit',
      'TV connectée',
      'Bureau de travail & dressing',
      'Douche à l’italienne',
      'Accès piscine inclus'
    ]
  },
  {
    id: 'chambre-standard',
    name: 'Chambre Confort Standard',
    category: 'Chambres Confort',
    tagline: 'Douceur de vivre & repos réparateur',
    description: 'Chambre chaleureuse et lumineuse disposant de tout le confort moderne avec climatisation, téléviseur, literie de qualité supérieure et salle d’eau soignée.',
    priceXOF: 40000,
    priceEUR: 61,
    capacity: '2 Personnes',
    maxGuests: 2,
    size: '26 m²',
    bed: 'Lit Double ou 2 Lits Jumeaux',
    view: 'Vue sur la cour intérieure fleurie',
    image: '/assets/notre-chambre.jpg',
    gallery: [
      '/assets/notre-chambre.jpg',
      '/assets/notre-chambre (1).jpg',
      '/assets/906078574.jpg',
      '/assets/906078628.jpg'
    ],
    amenities: [
      'Climatisation',
      'Wi-Fi gratuit',
      'Télévision écran plat',
      'Penderie et coffre-fort',
      'Accès piscine inclus'
    ]
  },
  {
    id: 'cabine-eco-bungalow',
    name: 'Éco-Cabine Piloti Jardin',
    category: 'Bungalows Écologiques',
    tagline: 'Immersion nature & éco-tourisme',
    description: 'Bungalow individuel indépendant construit en matériaux biosourcés (bois local et paillote isolante). Profitez de la brise naturelle, d’un hamac sur votre terrasse privée et du chant des oiseaux.',
    priceXOF: 60000,
    priceEUR: 92,
    capacity: '2 Adultes',
    maxGuests: 2,
    size: '36 m²',
    bed: 'Lit King Size avec moustiquaire canopée',
    view: 'Vue directe sur la végétation tropicale et le lac',
    image: '/assets/le-lac-artificel-apres.jpg',
    gallery: [
      '/assets/le-lac-artificel-apres.jpg',
      '/assets/906078583.jpg',
      '/assets/906078614.jpg',
      '/assets/906078633.jpg'
    ],
    amenities: [
      'Ventilation naturelle & climatisation',
      'Terrasse privée en bois avec hamac',
      'Plateau thé & café d’Afrique de l’Ouest',
      'Panneaux solaires dédiés',
      'Accès privilégié au Pavillon sur l’eau'
    ]
  }
];

export const LEISURE_ACTIVITIES = {
  pool: [
    {
      id: 'pool-day-pass',
      name: 'Pass Journée Piscine aux 3 Bassins',
      tagline: 'Baignade relaxante dans nos 3 bassins en cascade',
      type: 'pass',
      priceXOF: 5000,
      priceEUR: 7.6,
      period: 'Journée entière (09h00 - 19h00)',
      description: 'Accès libre aux trois niveaux de bassins arrondis d’eau douce, prêt de serviette de bain microfibre et transat réservé.',
      image: '/assets/la-piscine-au-3-bassins.jpg',
      features: ['Accès 3 bassins', 'Transat inclus', 'Serviette fournie', 'Service cocktail au transat']
    },
    {
      id: 'pool-pass-enfant',
      name: 'Pass Journée Piscine Enfant (-12 ans)',
      tagline: 'Pataugeoire sécurisée & bassin intermédiaire',
      type: 'pass',
      priceXOF: 3000,
      priceEUR: 4.6,
      period: 'Journée entière',
      description: 'Accès sous surveillance des parents au bassin peu profond avec fontaine champignon.',
      image: '/assets/906078633.jpg',
      features: ['Bassin peu profond', 'Surveillance maître-nageur', 'Gilet de sauvetage offert']
    },
    {
      id: 'pool-sub-monthly',
      name: 'Abonnement Club Aquatique Mensuel',
      tagline: 'Accès illimité toute la saison',
      type: 'subscription',
      priceXOF: 35000,
      priceEUR: 53.4,
      period: '1 Mois',
      description: 'Carte de membre nominative avec accès illimité 7j/7, serviettes à disposition et 10% de réduction au bar de la piscine.',
      image: '/assets/la-piscine-au-3-bassins.jpg',
      features: ['Accès 7j/7 illimité', 'Casier personnel sécurisé', '10% au Bar & Restaurant', 'Invité weekend à -50%']
    }
  ],
  tennis: [
    {
      id: 'tennis-1h',
      name: 'Location Court de Tennis (1 Heure)',
      tagline: 'Court officiel en surface dure éclairé',
      type: 'slot',
      priceXOF: 6000,
      priceEUR: 9.15,
      period: '1 Heure au choix',
      description: 'Réservation exclusive du court de tennis réglementaire avec filet professionnel. Éclairage nocturne disponible dès 18h30.',
      image: '/assets/bimyns-hotels-resorts.jpg',
      features: ['Court privatisé', 'Ballons fournis', 'Location raquettes possible', 'Éclairage nocturne inclus']
    },
    {
      id: 'tennis-pack-coach',
      name: 'Session Tennis avec Coach Fédéral (1h30)',
      tagline: 'Perfectionnement revers, service & tactique',
      type: 'slot',
      priceXOF: 15000,
      priceEUR: 22.9,
      period: '1h30 accompagnée',
      description: 'Entraînement personnalisé avec notre moniteur breveté pour adultes ou juniors.',
      image: '/assets/906078614.jpg',
      features: ['Entraîneur dédié', 'Prêt matériel pro', 'Analyse vidéo geste', 'Bouteilles d’eau minérale']
    },
    {
      id: 'tennis-sub-annual',
      name: 'Abonnement VIP Tennis & Loisirs Annuel',
      tagline: 'Le statut d’excellence CTA BIMYNS',
      type: 'subscription',
      priceXOF: 250000,
      priceEUR: 381,
      period: '1 An',
      description: 'Accès prioritaire illimité au court de tennis, pass piscine 3 bassins toute l’année, invitations exclusives tournois et accès salon Pavillon.',
      image: '/assets/bimyns-hotels-resorts.jpg',
      features: ['Réservations prioritaires', 'Piscine illimitée incluse', '15% sur la restauration', '4 invitations invités/mois']
    }
  ]
};

export const RESTAURANT_MENU = [
  // Entrées
  {
    id: 'entree-carpaccio',
    category: 'Entrées',
    name: 'Carpaccio de Capitaine du Lac',
    description: 'Fines lamelles de poisson frais mariné au combawa, baies roses de Nikki et filet d’huile d’olive vierge.',
    priceXOF: 4500,
    priceEUR: 6.9,
    image: '/assets/le-lac-artificel-apres.jpg',
    badge: 'Frais & Léger',
    prepTime: '15 min'
  },
  {
    id: 'entree-pastels',
    category: 'Entrées',
    name: 'Pastels Dorés & Sauce Tomate Piment Doux',
    description: 'Chausson croustillant farci au mérou et légumes croquants, servi avec sa sauce salsa maison.',
    priceXOF: 3500,
    priceEUR: 5.3,
    image: '/assets/906078589.jpg',
    badge: 'Croustillant',
    prepTime: '15 min'
  },
  {
    id: 'entree-salade-exotique',
    category: 'Entrées',
    name: 'Salade Royale d’Avocat & Crevettes d’Allada',
    description: 'Avocats mûrs à point, crevettes sautées à l’ail des ours, mangue fraîche et vinaigrette passion.',
    priceXOF: 5000,
    priceEUR: 7.6,
    image: '/assets/906078603.jpg',
    badge: 'Signature',
    prepTime: '15 min'
  },

  // Plats de Résistance
  {
    id: 'plat-poisson-braise',
    category: 'Plats',
    name: 'Poisson Capitaine Braisé au Feu de Bois',
    description: 'Pièce entière de poisson braisée aux épices secrètes du chef, servie avec alloco doré (bananes plantains) et piment vert écrasé.',
    priceXOF: 9500,
    priceEUR: 14.5,
    image: '/assets/le-lac-artificel-apres.jpg',
    badge: 'Spécialité CTA',
    prepTime: '30 min'
  },
  {
    id: 'plat-poulet-bicyclette',
    category: 'Plats',
    name: 'Poulet Bicyclette Cuisiné en Sauce d’Arachide & Igname Pilée',
    description: 'Poulet fermier d’élevage local fondant et savoureux, accompagné de son igname pilée traditionnelle (Iyan) ou de riz au gras parfumé.',
    priceXOF: 8000,
    priceEUR: 12.2,
    image: '/assets/906078568.jpg',
    badge: 'Terroir Béninois',
    prepTime: '25 min'
  },
  {
    id: 'plat-brochettes-filet',
    category: 'Plats',
    name: 'Brochettes Géantes de Filet de Bœuf Mariné',
    description: 'Tendre filet de bœuf découpé en cubes généreux, oignons rouges et poivrons caramélisés, frites de patates douces.',
    priceXOF: 7500,
    priceEUR: 11.4,
    image: '/assets/membre-du-personnel.jpg',
    badge: 'Grillade',
    prepTime: '20 min'
  },
  {
    id: 'plat-club-sandwich-resort',
    category: 'Plats',
    name: 'Club Sandwich CTA BIMYNS & Frites',
    description: 'Pain toasté artisanal, filet de dinde fumée, œuf au plat, tomate fraîche, cheddar et mayonnaise légère aux herbes.',
    priceXOF: 6000,
    priceEUR: 9.1,
    image: '/assets/906078574.jpg',
    badge: 'Snack Piscine',
    prepTime: '15 min'
  },

  // Boissons & Cocktails
  {
    id: 'boisson-baobab-colada',
    category: 'Boissons',
    name: 'Cocktail Signature « Baobab Colada »',
    description: 'Nectar de fruit de baobab onctueux, lait de coco crémeux, jus d’ananas pressé d’Allada et trait de rhum brun vieux (disponible sans alcool).',
    priceXOF: 4500,
    priceEUR: 6.9,
    image: '/assets/membre-du-personnel.jpg',
    badge: 'Cocktail Star',
    prepTime: '5 min'
  },
  {
    id: 'boisson-bissap-glace',
    category: 'Boissons',
    name: 'Jus de Bissap Royal à la Menthe Fraîche',
    description: 'Infusion fraîche de fleurs d’hibiscus cueillies à la main, feuilles de menthe du jardin potager et pointe de vanille.',
    priceXOF: 2500,
    priceEUR: 3.8,
    image: '/assets/la-piscine-au-3-bassins.jpg',
    badge: 'Frais & Artisanal',
    prepTime: '3 min'
  },
  {
    id: 'boisson-biere-beninoise',
    category: 'Boissons',
    name: 'Bière La Béninoise Fraîche (65cl)',
    description: 'La bière blonde nationale fraîchement servie au seau à glace.',
    priceXOF: 2000,
    priceEUR: 3.0,
    image: '/assets/membre-du-personnel.jpg',
    badge: 'Glacée',
    prepTime: '3 min'
  },
  {
    id: 'boisson-champagne-coupe',
    category: 'Boissons',
    name: 'Coupe de Champagne Brut Réserve',
    description: 'Pour célébrer les moments magiques au crépuscule sur le pavillon sur l’eau.',
    priceXOF: 9000,
    priceEUR: 13.7,
    image: '/assets/906078583.jpg',
    badge: 'Prestige',
    prepTime: '3 min'
  }
];

export const RESORT_DELIVERY_ZONES = [
  { id: 'zone-transat-nord', label: 'Transat Piscine - Zone Nord (Grand Bassin)', code: 'QR-POOL-N04' },
  { id: 'zone-transat-sud', label: 'Transat Piscine - Zone Sud (Cascade)', code: 'QR-POOL-S12' },
  { id: 'zone-transat-champignon', label: 'Transat Parasol Champignon #3', code: 'QR-POOL-C03' },
  { id: 'zone-ponton-pavillon', label: 'Ponton Pavillon sur l’Eau (Table Lac #2)', code: 'QR-LAKE-P02' },
  { id: 'zone-terrasse-pergola', label: 'Terrasse Ombragée Pergola Jardin', code: 'QR-GARD-T01' },
  { id: 'zone-tribune-tennis', label: 'Bancs de repos - Court de Tennis', code: 'QR-TENN-B01' }
];

export const RESORT_ROOM_NUMBERS = [
  'Suite 101 - Safari Zèbre',
  'Suite 102 - Panoramique Lac',
  'Chambre 201 - Tribale Balcon',
  'Chambre 202 - Tribale Jardin',
  'Chambre 301 - Confort Standard',
  'Chambre 302 - Confort Standard',
  'Cabine Éco 01 - Bord de Lac',
  'Cabine Éco 02 - Bambouseraie'
];

export const MOCK_USERS = [
  {
    id: 'USR-8942',
    name: 'Dr. Kofi Mensah',
    email: 'kofi.mensah@cotonou-med.bj',
    phone: '+229 97 45 12 80',
    isResident: true,
    roomNumber: 'Suite 101 - Safari Zèbre',
    roomFolioBalanceXOF: 245000,
    deliveryAddresses: [
      { id: 'addr-1', label: 'Résidence Principale', city: 'Cotonou', district: 'Haie Vive', street: 'Rue 340, Villa 12B' },
      { id: 'addr-2', label: 'Cabinet Médical', city: 'Cotonou', district: 'Cocotiers', street: 'Boulevard de la Marina, Immeuble Horizon' }
    ],
    activeSubscriptions: [
      { id: 'sub-1', title: 'Pass Club Tennis VIP', validUntil: '2026-12-31', badge: 'Actif' }
    ],
    orderHistory: [
      {
        orderId: 'ORD-ERP-2026-0041',
        date: '2026-09-02 20:15',
        type: 'Restaurant',
        totalXOF: 18500,
        status: 'Livré sur Transat Piscine',
        paymentMethod: 'Mobile Money MTN'
      },
      {
        orderId: 'ORD-ERP-2026-0038',
        date: '2026-09-01 11:00',
        type: 'Loisirs',
        totalXOF: 6000,
        status: 'Terminé (Court de Tennis)',
        paymentMethod: 'Note de Chambre'
      }
    ]
  },
  {
    id: 'USR-6721',
    name: 'Amina Touré',
    email: 'amina.toure@africainvest.com',
    phone: '+229 66 18 90 44',
    isResident: false,
    roomNumber: null,
    roomFolioBalanceXOF: 0,
    deliveryAddresses: [
      { id: 'addr-3', label: 'Appartement Calavi', city: 'Abomey-Calavi', district: 'Arconville', street: 'Près de l’IITA' }
    ],
    activeSubscriptions: [],
    orderHistory: []
  }
];
