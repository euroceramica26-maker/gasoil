import { Subscription, SecurityConfig, AuditLog } from '../types';

/**
 * Génère une clé de licence officielle à 36 caractères (lettres majuscules et chiffres).
 * Format standardisé ISO-UUID : 8-4-4-4-12 = exactement 36 caractères (ou 36 caractères bruts).
 * Exemple : "HGMA2026-B8F9-4C17-9E02-8FA19B7E52CD" (36 caractères avec tirets)
 * ou "HGMA2026B8F94C179E028FA19B7E52CD9A8B" (36 caractères continus sans tirets).
 */
export function generate36CharLicenseKey(withHyphens: boolean = true, prefix: string = 'HGMA'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclut 0/O, 1/I pour éviter les confusions de saisie
  
  if (!withHyphens) {
    // 36 caractères continus
    let key = (prefix + '2026').slice(0, 8);
    while (key.length < 36) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  // Format 8-4-4-4-12 = 32 caractères alphanumériques + 4 tirets = exactement 36 caractères !
  const genChunk = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const part1 = (prefix + '2026').slice(0, 8); // 8
  const part2 = genChunk(4); // 4
  const part3 = genChunk(4); // 4
  const part4 = genChunk(4); // 4
  const part5 = genChunk(12); // 12

  // 8 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 12 = 36 caractères
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/**
 * Valide et normalise une clé de licence saisie par un utilisateur ou client.
 * Accepte les clés avec ou sans tirets, insensibles à la casse.
 */
export function validateLicenseKeyFormat(key: string): { 
  isValid: boolean; 
  normalizedKey: string; 
  reason?: string;
  charCount: number;
} {
  if (!key) {
    return { isValid: false, normalizedKey: '', reason: 'Code vide', charCount: 0 };
  }

  const clean = key.trim().toUpperCase();
  const rawAlphanumeric = clean.replace(/[^A-Z0-9]/g, '');

  // Exactement 36 caractères (avec tirets format 8-4-4-4-12 ou 36 alphanumériques purs)
  if (clean.length === 36 || rawAlphanumeric.length === 32 || rawAlphanumeric.length === 36) {
    return {
      isValid: true,
      normalizedKey: clean,
      charCount: clean.length
    };
  }

  return {
    isValid: false,
    normalizedKey: clean,
    reason: `Longueur invalide (${clean.length} caractères). Un code d'abonnement valide contient 36 caractères (lettres et chiffres).`,
    charCount: clean.length
  };
}

/**
 * Calcule le nombre de jours restants avant expiration
 */
export function getDaysRemaining(dateExpirationStr: string): number {
  try {
    const expDate = new Date(dateExpirationStr);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

/**
 * Abonnements initiaux pour le Maroc (Démos, Clients industriels & Transporteurs)
 */
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-2026-001',
    licenseKey: 'HGMA2026-A8F9-BC41-7E02-99D34FA189B7', // 36 caractères
    clientName: 'Karim El Amrani',
    entreprise: 'Société des Ciments de Mohammedia (SCM)',
    contact: '+212 5 23 32 40 00',
    telephone: '+212 6 61 14 55 22',
    ville: 'Mohammedia',
    plan: 'Annuel',
    dateEmission: '2026-01-01',
    dateExpiration: '2026-12-31',
    statut: 'Actif',
    prixMAD: 14000,
    maxVehicules: 50,
    maxCiternes: 6,
    cleActilee: true,
    notes: 'Contrat grand compte usine et carrières. Support 24/7 métrologie.'
  },
  {
    id: 'SUB-2026-002',
    licenseKey: 'HGMA2026-8B20-56E1-49F0-C9A833E1D401', // 36 caractères
    clientName: 'Nadia Berrada',
    entreprise: 'Logistique & Transport Portuaire Jorf Lasfar',
    contact: '+212 5 23 34 11 90',
    telephone: '+212 6 62 88 41 05',
    ville: 'El Jadida / Jorf Lasfar',
    plan: 'Annuel',
    dateEmission: '2026-02-15',
    dateExpiration: '2027-02-14',
    statut: 'Actif',
    prixMAD: 14000,
    maxVehicules: 40,
    maxCiternes: 4,
    cleActilee: false,
    notes: 'Parc engins lourds et groupes électrogènes quais portuaires.'
  },
  {
    id: 'SUB-2026-003',
    licenseKey: 'HGMA2026-7C33-89D2-11E5-66B8401A7EF2', // 36 caractères
    clientName: 'Mohamed Tazi',
    entreprise: 'Atlas Mines & Carrières Zagora',
    contact: '+212 5 24 84 70 12',
    telephone: '+212 6 70 33 29 18',
    ville: 'Marrakech / Ouarzazate',
    plan: 'Trimestriel',
    dateEmission: '2026-08-01',
    dateExpiration: '2026-10-31',
    statut: 'Actif',
    prixMAD: 4500,
    maxVehicules: 25,
    maxCiternes: 3,
    cleActilee: false,
    notes: 'Paiement trimestriel par virement Attijariwafa Bank.'
  },
  {
    id: 'SUB-2026-004',
    licenseKey: 'HGMA2026-D412-99B7-44E8-55F120A4B8C9', // 36 caractères
    clientName: 'Youssef Bennani',
    entreprise: 'BTP Tanger Med Infrastructure',
    contact: '+212 5 39 93 18 20',
    telephone: '+212 6 64 55 99 01',
    ville: 'Tanger',
    plan: 'Entreprise',
    dateEmission: '2026-01-01',
    dateExpiration: '2028-12-31',
    statut: 'Actif',
    prixMAD: 38000,
    maxVehicules: 120,
    maxCiternes: 12,
    cleActilee: false,
    notes: 'Licence multi-sites et accès API télématique en continu.'
  },
  {
    id: 'SUB-2026-005',
    licenseKey: 'HGMA2026-0000-DEMO-TEST-998877665544', // 36 caractères
    clientName: 'Démo Évaluation Maroc',
    entreprise: 'Compagnie Marocaine des Hydrocarbures (Essai)',
    contact: '+212 5 22 22 10 00',
    telephone: '+212 6 61 00 00 00',
    ville: 'Casablanca',
    plan: 'Essai',
    dateEmission: '2026-09-25',
    dateExpiration: '2026-10-25',
    statut: 'Actif',
    prixMAD: 0,
    maxVehicules: 10,
    maxCiternes: 2,
    cleActilee: false,
    notes: 'Période d essai 30 jours pour démonstration client.'
  }
];

export const INITIAL_SECURITY_CONFIG: SecurityConfig = {
  emergencyLockdown: false,
  maintenanceMode: false,
  readOnlyMode: false,
  requireSignatures: true,
  doubleValidationReceptions: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  allowOfflineMode: true,
  masterPinCode: 'MAROC2026' // Code secret maître de déverrouillage d'urgence
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-10-09 08:30:12',
    user: 'Yassine Benali (Admin)',
    action: 'Démarrage Système',
    module: 'Sécurité Centrale',
    details: 'Initialisation du backend et vérification de la licence 36 caractères.',
    status: 'Succès',
    ipAddress: '192.168.1.10 (Local Usine)'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-10-09 08:35:44',
    user: 'Samir Chaabane (Pompiste)',
    action: 'Délivrance Carburant',
    module: 'Pistolet Volucompteur',
    details: 'Plein effectué sur Engin CAT 336D (48291-A-12) : 280,50 L avec signature.',
    status: 'Succès',
    ipAddress: '192.168.1.42 (Borne Dépot)'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-10-09 08:42:19',
    user: 'Système Automatique',
    action: 'Audit Métrologique',
    module: 'Citernes',
    details: 'Contrôle téléjauge Citerne 1 (Mohammedia) : 38 450 L (76.9%). Normal.',
    status: 'Succès',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-10-09 08:50:02',
    user: 'Anonyme',
    action: 'Tentative d Accès',
    module: 'Authentification',
    details: 'Connexion rapide réussie pour profil Administrateur.',
    status: 'Sécurité',
    ipAddress: '192.168.1.15'
  }
];
