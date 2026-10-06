import { Vehicle, Citerne, StockEntry, FuelDispense, Repair, ConsumptionAlert, User, Fournisseur, VehicleTypeConfig } from './types';

// Signature SVG placeholder standard
export const SAMPLE_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><path d="M20 70 Q 50 20, 90 60 T 150 50 T 200 80 T 270 30 M 70 85 Q 130 95, 230 75" fill="none" stroke="%232563eb" stroke-width="3" stroke-linecap="round"/></svg>';

export const INITIAL_CITERNES: Citerne[] = [
  {
    id: 'cit-1',
    code: 'CIT-01',
    nom: 'Citerne Principale A (Engins Lourds)',
    capaciteTotale: 60000,
    stockActuel: 41850,
    seuilAlerteBas: 12000,
    seuilCritique: 5000,
    temperatureC: 18.4,
    densiteKgL: 0.842,
    typeGasoil: 'Gasoil Standard 10ppm',
    emplacement: 'Zone Dépôt Nord - Quai 1',
    dernierControle: '2026-09-28',
    statut: 'Opérationnelle'
  },
  {
    id: 'cit-2',
    code: 'CIT-02',
    nom: 'Citerne B (Logistique & Chariots)',
    capaciteTotale: 35000,
    stockActuel: 24300,
    seuilAlerteBas: 7000,
    seuilCritique: 3000,
    temperatureC: 19.1,
    densiteKgL: 0.839,
    typeGasoil: 'Gasoil Non Routier (GNR)',
    emplacement: 'Atelier Central - Quai 2',
    dernierControle: '2026-10-02',
    statut: 'Opérationnelle'
  },
  {
    id: 'cit-3',
    code: 'CIT-03',
    nom: 'Citerne C (Secours & Groupes Élec.)',
    capaciteTotale: 20000,
    stockActuel: 4900,
    seuilAlerteBas: 6000,
    seuilCritique: 2500,
    temperatureC: 17.8,
    densiteKgL: 0.844,
    typeGasoil: 'Gasoil Heavy Duty',
    emplacement: 'Centrale Électrique Bâtiment 4',
    dernierControle: '2026-10-04',
    statut: 'Opérationnelle'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    code: 'ENG-101',
    immatriculation: '48291-A-12',
    marque: 'Caterpillar',
    modele: '336D L',
    type: 'Pelleteuse',
    status: 'Actif',
    annee: 2021,
    kilometrageOuHeures: 6420,
    uniteMesure: 'heures',
    capaciteReservoir: 620,
    consommationMoyenneTheorique: 24.5, // L/h
    derniereConsoReelle: 25.1,
    dateMiseEnService: '2021-03-15',
    departement: 'Carrière & Extraction'
  },
  {
    id: 'veh-2',
    code: 'ENG-102',
    immatriculation: '51902-B-16',
    marque: 'Komatsu',
    modele: 'WA470-8',
    type: 'Chargeuse',
    status: 'Actif',
    annee: 2022,
    kilometrageOuHeures: 4180,
    uniteMesure: 'heures',
    capaciteReservoir: 380,
    consommationMoyenneTheorique: 19.0, // L/h
    derniereConsoReelle: 18.7,
    dateMiseEnService: '2022-06-10',
    departement: 'Carrière & Concassage'
  },
  {
    id: 'veh-3',
    code: 'CAM-201',
    immatriculation: '77301-C-08',
    marque: 'Volvo',
    modele: 'FMX 460 8x4',
    type: 'Camion Benne',
    status: 'Actif',
    annee: 2023,
    kilometrageOuHeures: 88400,
    uniteMesure: 'km',
    capaciteReservoir: 450,
    consommationMoyenneTheorique: 48.0, // L/100km
    derniereConsoReelle: 57.2, // surconsommation!
    dateMiseEnService: '2023-01-20',
    departement: 'Transport Usine'
  },
  {
    id: 'veh-4',
    code: 'CAM-202',
    immatriculation: '77302-C-08',
    marque: 'Mercedes-Benz',
    modele: 'Arocs 4145',
    type: 'Camion Benne',
    status: 'Actif',
    annee: 2022,
    kilometrageOuHeures: 104500,
    uniteMesure: 'km',
    capaciteReservoir: 400,
    consommationMoyenneTheorique: 46.5,
    derniereConsoReelle: 47.1,
    dateMiseEnService: '2022-09-01',
    departement: 'Transport Usine'
  },
  {
    id: 'veh-5',
    code: 'ENG-105',
    immatriculation: '89123-D-22',
    marque: 'Bell',
    modele: 'B40E',
    type: 'Dumper',
    status: 'En Maintenance',
    annee: 2020,
    kilometrageOuHeures: 8950,
    uniteMesure: 'heures',
    capaciteReservoir: 550,
    consommationMoyenneTheorique: 28.0,
    derniereConsoReelle: 29.4,
    dateMiseEnService: '2020-11-12',
    departement: 'Carrière & Extraction'
  },
  {
    id: 'veh-6',
    code: 'MAN-301',
    immatriculation: 'INT-CH-04',
    marque: 'Linde',
    modele: 'H50D EVO',
    type: 'Chariot Elévateur',
    status: 'Actif',
    annee: 2021,
    kilometrageOuHeures: 3820,
    uniteMesure: 'heures',
    capaciteReservoir: 80,
    consommationMoyenneTheorique: 4.8,
    derniereConsoReelle: 4.6,
    dateMiseEnService: '2021-05-18',
    departement: 'Stockage & Expédition'
  },
  {
    id: 'veh-7',
    code: 'GEN-401',
    immatriculation: 'FIX-GEN-01',
    marque: 'Cummins',
    modele: 'C550 D5e (550kVA)',
    type: 'Groupe Electrogène',
    status: 'Actif',
    annee: 2019,
    kilometrageOuHeures: 1420,
    uniteMesure: 'heures',
    capaciteReservoir: 1100,
    consommationMoyenneTheorique: 75.0, // L/h à 75% charge
    derniereConsoReelle: 76.2,
    dateMiseEnService: '2019-08-10',
    departement: 'Énergie & Utilités'
  },
  {
    id: 'veh-8',
    code: 'UTL-501',
    immatriculation: '34891-E-14',
    marque: 'Toyota',
    modele: 'Hilux Double Cab 4x4',
    type: 'Véhicule Léger',
    status: 'Actif',
    annee: 2023,
    kilometrageOuHeures: 42100,
    uniteMesure: 'km',
    capaciteReservoir: 80,
    consommationMoyenneTheorique: 8.9,
    derniereConsoReelle: 9.1,
    dateMiseEnService: '2023-04-05',
    departement: 'Supervision & Sécurité'
  }
];

export const INITIAL_STOCK_ENTRIES: StockEntry[] = [
  {
    id: 'ent-1',
    numeroBon: 'BL-2026-0814',
    dateLivraison: '2026-10-05T08:30:00',
    fournisseur: 'TotalEnergies Commercial Fuels',
    chauffeurLivreur: 'Karim Mansouri',
    immatriculationCiterneLivreur: 'TN-9821-B',
    citerneId: 'cit-1',
    quantiteLivree: 28000,
    densiteMesuree: 0.842,
    temperatureMesuree: 18.2,
    receptionnaireUsine: 'Ahmed Benali (Chef Dépôt)',
    signatureBase64: SAMPLE_SIGNATURE,
    notes: 'Livraison conforme, test eau de cuve négatif, scellés vérifiés.',
    statut: 'Validé'
  },
  {
    id: 'ent-2',
    numeroBon: 'BL-2026-0792',
    dateLivraison: '2026-10-02T14:15:00',
    fournisseur: 'Petromin Distribution',
    chauffeurLivreur: 'Tahar Dridi',
    immatriculationCiterneLivreur: 'TN-4410-X',
    citerneId: 'cit-2',
    quantiteLivree: 15000,
    densiteMesuree: 0.839,
    temperatureMesuree: 19.0,
    receptionnaireUsine: 'Samir Chaabane (Agent Pompiste)',
    signatureBase64: SAMPLE_SIGNATURE,
    notes: 'Dépotage par gravité + pompe auxiliaire.',
    statut: 'Validé'
  },
  {
    id: 'ent-3',
    numeroBon: 'BL-2026-0740',
    dateLivraison: '2026-09-27T10:00:00',
    fournisseur: 'Shell Commercial Fuels',
    chauffeurLivreur: 'Mohamed Salah',
    immatriculationCiterneLivreur: 'TN-6192-A',
    citerneId: 'cit-3',
    quantiteLivree: 8000,
    densiteMesuree: 0.843,
    temperatureMesuree: 17.5,
    receptionnaireUsine: 'Ahmed Benali (Chef Dépôt)',
    signatureBase64: SAMPLE_SIGNATURE,
    notes: 'Complément cuve centrale secours.',
    statut: 'Validé'
  }
];

export const INITIAL_DISPENSES: FuelDispense[] = [
  {
    id: 'dsp-1',
    codeTicket: 'TKT-2026-1402',
    dateHeure: '2026-10-06T06:45:00',
    citerneId: 'cit-1',
    vehiculeId: 'veh-3', // CAM-201
    pompiste: 'Samir Chaabane',
    chauffeur: 'Mourad Kharrat',
    volumeLivre: 380,
    compteurActuel: 88400,
    compteurPrecedent: 87735,
    deltaCompteur: 665, // km
    ratioConsommation: 57.14, // L/100km (vs théorique 48 -> surconso)
    surconsommationAlerte: true,
    signatureChauffeur: SAMPLE_SIGNATURE,
    remarques: 'Déviation constatée (+19% vs théorique). Vérifier injecteurs ou sur-régime.'
  },
  {
    id: 'dsp-2',
    codeTicket: 'TKT-2026-1401',
    dateHeure: '2026-10-05T17:30:00',
    citerneId: 'cit-1',
    vehiculeId: 'veh-1', // ENG-101 Pelleteuse
    pompiste: 'Samir Chaabane',
    chauffeur: 'Nabil Zlitni',
    volumeLivre: 450,
    compteurActuel: 6420,
    compteurPrecedent: 6402,
    deltaCompteur: 18, // heures
    ratioConsommation: 25.0, // L/h
    surconsommationAlerte: false,
    signatureChauffeur: SAMPLE_SIGNATURE,
    remarques: 'Plein fin de poste de terrassement secteur nord.'
  },
  {
    id: 'dsp-3',
    codeTicket: 'TKT-2026-1400',
    dateHeure: '2026-10-05T16:10:00',
    citerneId: 'cit-2',
    vehiculeId: 'veh-6', // MAN-301 Chariot
    pompiste: 'Brahim Ouni',
    chauffeur: 'Béchir Ayari',
    volumeLivre: 65,
    compteurActuel: 3820,
    compteurPrecedent: 3806,
    deltaCompteur: 14, // heures
    ratioConsommation: 4.64, // L/h
    surconsommationAlerte: false,
    signatureChauffeur: SAMPLE_SIGNATURE,
    remarques: 'Consommation normale.'
  },
  {
    id: 'dsp-4',
    codeTicket: 'TKT-2026-1399',
    dateHeure: '2026-10-05T11:20:00',
    citerneId: 'cit-1',
    vehiculeId: 'veh-2', // ENG-102 Chargeuse
    pompiste: 'Samir Chaabane',
    chauffeur: 'Hichem Trad',
    volumeLivre: 340,
    compteurActuel: 4180,
    compteurPrecedent: 4162,
    deltaCompteur: 18,
    ratioConsommation: 18.88,
    surconsommationAlerte: false,
    signatureChauffeur: SAMPLE_SIGNATURE,
    remarques: 'Chargement trémie concasseur.'
  }
];

export const INITIAL_REPAIRS: Repair[] = [
  {
    id: 'rep-1',
    reference: 'REP-2026-031',
    dateIntervention: '2026-10-04',
    cibleType: 'Pompe & Volucompteur',
    cibleId: 'pompe-p1',
    cibleLibelle: 'Volucompteur Tokheim Débitmètre Quai 1',
    technicien: 'SOGEC Métrologie Industrielle',
    typeIntervention: 'Etalonnage Volucompteur',
    description: 'Etalonnage métrologique légal périodique avec jauge étalon de 200L. Écart mesuré: +0.08% (conforme). Plombage renouvelé.',
    piecesRemplacees: 'Joints toriques bride, plomb de scellement officiel',
    coutTotal: 850,
    statut: 'Terminée'
  },
  {
    id: 'rep-2',
    reference: 'REP-2026-029',
    dateIntervention: '2026-10-03',
    cibleType: 'Pistolet / Flexible',
    cibleId: 'pist-02',
    cibleLibelle: 'Pistolet haut débit ZVA Elaflex 120L/min - Citerne A',
    technicien: 'Atelier Maintenance Usine',
    typeIntervention: 'Curative',
    description: 'Rupture du raccord tournant anti-vrillage et fuite au niveau de la gâchette automatique.',
    piecesRemplacees: 'Raccord tournant Swivel EA 075, kit étanchéité ZVA 32',
    coutTotal: 340,
    statut: 'Terminée'
  },
  {
    id: 'rep-3',
    reference: 'REP-2026-028',
    dateIntervention: '2026-10-02',
    cibleType: 'Véhicule',
    cibleId: 'veh-5', // ENG-105 Dumper Bell
    cibleLibelle: 'ENG-105 - Dumper Bell B40E',
    technicien: 'Technicien Bell Equipment',
    typeIntervention: 'Curative',
    description: 'Fuite rampe commune injection diesel et perte de puissance avec fumée noire.',
    piecesRemplacees: '2 injecteurs Bosch Common Rail, filtre décanteur gasoil, tuyauterie retour',
    coutTotal: 2900,
    statut: 'En Cours'
  },
  {
    id: 'rep-4',
    reference: 'REP-2026-025',
    dateIntervention: '2026-09-29',
    cibleType: 'Citerne',
    cibleId: 'cit-3',
    cibleLibelle: 'Citerne C (Secours & Groupes)',
    technicien: 'Hydro-Clean Maintenance',
    typeIntervention: 'Préventive',
    description: 'Contrôle présence d’eau de condensation en fond de cuve par pâte indicatrice. Purge de 12 litres de condensat.',
    piecesRemplacees: 'Cartouche filtre déshydratant 30 microns',
    coutTotal: 420,
    statut: 'Terminée'
  }
];

export const INITIAL_ALERTS: ConsumptionAlert[] = [
  {
    id: 'alt-1',
    date: '2026-10-06 06:45',
    gravite: 'danger',
    titre: 'Surconsommation Détectée : CAM-201',
    message: 'Ratio mesuré à 57.1 L/100km (+19% vs théorique 48 L/100km). Risque d’anomalie injecteur ou conduite.',
    vehiculeCode: 'ENG-201'
  },
  {
    id: 'alt-2',
    date: '2026-10-06 02:00',
    gravite: 'warning',
    titre: 'Seuil de Réserve Atteint : Citerne C',
    message: 'Niveau Citerne Secours à 4 900 L (seuil alerte 6 000 L). Prévoir commande de réapprovisionnement.',
    citerneCode: 'CIT-03'
  },
  {
    id: 'alt-3',
    date: '2026-10-04 11:30',
    gravite: 'info',
    titre: 'Étalonnage Validé',
    message: 'Volucompteur Quai 1 certifié par organisme métrologique. Écart conforme < 0.1%.',
    citerneCode: 'CIT-01'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    matricule: 'ADM-001',
    nom: 'Benali',
    prenom: 'Ahmed',
    role: 'Chef de Dépôt',
    email: 'a.benali@usine-hydro.com',
    telephone: '+216 71 884 102',
    statut: 'Actif',
    badgeCode: 'RFID-98421',
    departement: 'Logistique & Carburants',
    dateCreation: '2024-01-15'
  },
  {
    id: 'usr-2',
    matricule: 'PMP-101',
    nom: 'Chaabane',
    prenom: 'Samir',
    role: 'Pompiste',
    email: 's.chaabane@usine-hydro.com',
    telephone: '+216 98 441 200',
    statut: 'Actif',
    badgeCode: 'RFID-11045',
    departement: 'Station Quai 1',
    dateCreation: '2024-03-20'
  },
  {
    id: 'usr-3',
    matricule: 'PMP-102',
    nom: 'Ouni',
    prenom: 'Brahim',
    role: 'Pompiste',
    email: 'b.ouni@usine-hydro.com',
    telephone: '+216 97 332 119',
    statut: 'Actif',
    badgeCode: 'RFID-22481',
    departement: 'Station Quai 2',
    dateCreation: '2024-06-10'
  },
  {
    id: 'usr-4',
    matricule: 'SYS-001',
    nom: 'Trabelsi',
    prenom: 'Mehdi',
    role: 'Administrateur',
    email: 'admin.parc@usine-hydro.com',
    telephone: '+216 71 500 900',
    statut: 'Actif',
    badgeCode: 'RFID-00001',
    departement: 'Direction Technique & IT',
    dateCreation: '2023-11-01'
  },
  {
    id: 'usr-5',
    matricule: 'CHF-201',
    nom: 'Kharrat',
    prenom: 'Mourad',
    role: 'Chauffeur / Opérateur',
    email: 'm.kharrat@usine-hydro.com',
    telephone: '+216 22 991 304',
    statut: 'Actif',
    badgeCode: 'RFID-77120',
    departement: 'Transport Benne',
    dateCreation: '2024-02-12'
  },
  {
    id: 'usr-6',
    matricule: 'MNT-301',
    nom: 'Gharbi',
    prenom: 'Youssef',
    role: 'Responsable Maintenance',
    email: 'y.gharbi@usine-hydro.com',
    telephone: '+216 55 410 782',
    statut: 'Actif',
    badgeCode: 'RFID-33901',
    departement: 'Atelier Central & Pompage',
    dateCreation: '2024-04-05'
  }
];

export const INITIAL_FOURNISSEURS: Fournisseur[] = [
  {
    id: 'frs-1',
    code: 'FRS-01',
    nom: 'TotalEnergies Commercial Fuels',
    contactNom: 'M. Karim Khelifi (Responsable B2B)',
    telephone: '+216 71 110 220',
    email: 'contact.b2b@totalenergies.tn',
    adresse: 'Zone Industrielle Rades, Dépôt Pétrolier Sud',
    typeGasoilFourni: 'Gasoil Standard 10ppm',
    numContrat: 'CTR-2024-TOT-09',
    statut: 'Actif',
    notes: 'Fournisseur principal cuve A & B. Livraison sous 24h ouvrées.'
  },
  {
    id: 'frs-2',
    code: 'FRS-02',
    nom: 'Shell Commercial Fuels (Vivo Energy)',
    contactNom: 'Mme Ines Ben Salem',
    telephone: '+216 71 890 400',
    email: 'commercial@vivoenergy.com',
    adresse: 'Avenue de la Bourse, Les Berges du Lac',
    typeGasoilFourni: 'Gasoil Non Routier (GNR)',
    numContrat: 'CTR-2025-SHL-14',
    statut: 'Actif',
    notes: 'Fourniture GNR spécifique carrières et engins d’extraction.'
  },
  {
    id: 'frs-3',
    code: 'FRS-03',
    nom: 'Petromin Distribution Industrielle',
    contactNom: 'M. Tarek Mabrouk',
    telephone: '+216 72 445 100',
    email: 'tarek.m@petromin-fuels.com',
    adresse: 'Zone Portuaire Bizerte, Dépôt Ouest',
    typeGasoilFourni: 'Gasoil Heavy Duty',
    numContrat: 'CTR-2023-PET-03',
    statut: 'Actif',
    notes: 'Alimentation des cuves groupes électrogènes de secours.'
  },
  {
    id: 'frs-4',
    code: 'FRS-04',
    nom: 'Ola Energy Industrial',
    contactNom: 'M. Nader Zouari',
    telephone: '+216 71 780 120',
    email: 'n.zouari@olaenergy.com',
    adresse: 'Zone Industrielle Charguia II',
    typeGasoilFourni: 'Gasoil Standard 10ppm',
    numContrat: 'CTR-2024-OLA-02',
    statut: 'Inactif',
    notes: 'Fournisseur secondaire de réserve en cas de rupture de stock.'
  }
];

export const INITIAL_VEHICLE_TYPES: VehicleTypeConfig[] = [
  {
    id: 'vt-1',
    code: 'TYP-CAM',
    libelle: 'Camion Benne',
    categorie: 'Transport',
    uniteMesure: 'km',
    consoDefautTheorique: 45.0,
    description: 'Camions 8x4 et 6x4 benne carrière et évacuation granulat',
    actif: true
  },
  {
    id: 'vt-2',
    code: 'TYP-PEL',
    libelle: 'Pelleteuse',
    categorie: 'Extraction',
    uniteMesure: 'heures',
    consoDefautTheorique: 25.0,
    description: 'Pelles hydrauliques sur chenilles 30t à 50t en front de taille',
    actif: true
  },
  {
    id: 'vt-3',
    code: 'TYP-CHG',
    libelle: 'Chargeuse',
    categorie: 'Extraction',
    uniteMesure: 'heures',
    consoDefautTheorique: 19.0,
    description: 'Chargeuses sur pneus fort tonnage pour alimentation trémies',
    actif: true
  },
  {
    id: 'vt-4',
    code: 'TYP-DMP',
    libelle: 'Dumper',
    categorie: 'Extraction',
    uniteMesure: 'heures',
    consoDefautTheorique: 28.0,
    description: 'Tombereaux articulés 40 tonnes transport roche massive',
    actif: true
  },
  {
    id: 'vt-5',
    code: 'TYP-MAN',
    libelle: 'Chariot Elévateur',
    categorie: 'Manutention',
    uniteMesure: 'heures',
    consoDefautTheorique: 4.8,
    description: 'Chariots élévateurs diesel parc palettes et expéditions',
    actif: true
  },
  {
    id: 'vt-6',
    code: 'TYP-GEN',
    libelle: 'Groupe Electrogène',
    categorie: 'Énergie',
    uniteMesure: 'heures',
    consoDefautTheorique: 75.0,
    description: 'Groupes électrogènes fixes de puissance 500kVA à 1000kVA',
    actif: true
  },
  {
    id: 'vt-7',
    code: 'TYP-UTL',
    libelle: 'Véhicule Léger',
    categorie: 'Liaison',
    uniteMesure: 'km',
    consoDefautTheorique: 9.0,
    description: 'Pick-up 4x4 et utilitaires de liaison et maintenance de piste',
    actif: true
  }
];


