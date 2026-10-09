import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial storage state
interface DataStore {
  subscriptions: any[];
  activeLicenseKey: string;
  securityConfig: {
    emergencyLockdown: boolean;
    maintenanceMode: boolean;
    readOnlyMode: boolean;
    requireSignatures: boolean;
    doubleValidationReceptions: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    allowOfflineMode: boolean;
    lastLockdownDate?: string;
    lockdownReason?: string;
    masterPinCode: string;
  };
  auditLogs: any[];
  appData: any | null;
}

const DEFAULT_STORE: DataStore = {
  subscriptions: [
    {
      id: 'SUB-2026-001',
      licenseKey: 'HGMA2026-A8F9-BC41-7E02-99D34FA189B7',
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
      licenseKey: 'HGMA2026-8B20-56E1-49F0-C9A833E1D401',
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
      licenseKey: 'HGMA2026-7C33-89D2-11E5-66B8401A7EF2',
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
      licenseKey: 'HGMA2026-D412-99B7-44E8-55F120A4B8C9',
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
      licenseKey: 'HGMA2026-0000-DEMO-TEST-998877665544',
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
  ],
  activeLicenseKey: 'HGMA2026-A8F9-BC41-7E02-99D34FA189B7',
  securityConfig: {
    emergencyLockdown: false,
    maintenanceMode: false,
    readOnlyMode: false,
    requireSignatures: true,
    doubleValidationReceptions: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    allowOfflineMode: true,
    masterPinCode: 'MAROC2026'
  },
  auditLogs: [
    {
      id: 'LOG-001',
      timestamp: '2026-10-09 08:30:12',
      user: 'Yassine Benali (Admin)',
      action: 'Démarrage Serveur Backend Express',
      module: 'Sécurité Centrale',
      details: 'Initialisation du backend Node/Express et validation licence.',
      status: 'Succès',
      ipAddress: '127.0.0.1'
    }
  ],
  appData: null
};

function readStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading store file, using default store:', err);
  }
  return DEFAULT_STORE;
}

function saveStore(store: DataStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

// Initial load/save if missing
if (!fs.existsSync(DATA_FILE)) {
  saveStore(DEFAULT_STORE);
}

// ==========================================
// REST API ROUTES
// ==========================================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'HydroGasoil Backend Server',
    region: 'Maroc (Mohammedia & Jorf Lasfar)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version
  });
});

// 1. SUBSCRIPTIONS API (Gestion des Abonnements à 36 chiffres/lettres)
app.get('/api/subscriptions', (_req: Request, res: Response) => {
  const store = readStore();
  res.json({
    subscriptions: store.subscriptions,
    activeLicenseKey: store.activeLicenseKey
  });
});

app.post('/api/subscriptions', (req: Request, res: Response) => {
  const store = readStore();
  const newSub = req.body;
  if (!newSub.licenseKey || newSub.licenseKey.trim().length === 0) {
    return res.status(400).json({ error: 'La clé de licence à 36 caractères est requise' });
  }

  // Check unique key
  const exists = store.subscriptions.some(s => s.licenseKey === newSub.licenseKey.trim());
  if (exists) {
    return res.status(400).json({ error: 'Ce code de licence existe déjà' });
  }

  store.subscriptions.unshift(newSub);
  
  // Add audit log
  store.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('fr-FR'),
    user: 'Super Admin',
    action: 'Création d Abonnement',
    module: 'Abonnements & Licences',
    details: `Nouvel abonnement ${newSub.plan} (${newSub.prixMAD} MAD) pour ${newSub.entreprise}. Clé: ${newSub.licenseKey}`,
    status: 'Succès',
    ipAddress: req.ip || '127.0.0.1'
  });

  saveStore(store);
  res.status(201).json(newSub);
});

app.put('/api/subscriptions/:id', (req: Request, res: Response) => {
  const store = readStore();
  const { id } = req.params;
  const updatedData = req.body;

  const index = store.subscriptions.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Abonnement introuvable' });
  }

  store.subscriptions[index] = { ...store.subscriptions[index], ...updatedData };
  saveStore(store);
  res.json(store.subscriptions[index]);
});

app.delete('/api/subscriptions/:id', (req: Request, res: Response) => {
  const store = readStore();
  const { id } = req.params;

  const subToDelete = store.subscriptions.find(s => s.id === id);
  store.subscriptions = store.subscriptions.filter(s => s.id !== id);
  
  if (subToDelete) {
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      user: 'Super Admin',
      action: 'Suppression Licence',
      module: 'Abonnements & Licences',
      details: `Suppression de l'abonnement pour ${subToDelete.entreprise} (${subToDelete.licenseKey}).`,
      status: 'Alerte',
      ipAddress: req.ip || '127.0.0.1'
    });
  }

  saveStore(store);
  res.json({ success: true });
});

// Verify a 36-char license key
app.post('/api/subscriptions/verify', (req: Request, res: Response) => {
  const store = readStore();
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Code manquant' });
  }

  const clean = code.trim().toUpperCase();
  const match = store.subscriptions.find(s => {
    const rawMatch = s.licenseKey.replace(/[^A-Z0-9]/g, '') === clean.replace(/[^A-Z0-9]/g, '');
    return s.licenseKey === clean || rawMatch;
  });

  if (!match) {
    return res.json({
      valid: false,
      message: 'Code de licence introuvable ou invalide. Vérifiez les 36 caractères.'
    });
  }

  const expDate = new Date(match.dateExpiration);
  const now = new Date();
  const isExpired = expDate < now;

  if (match.statut === 'Suspendu') {
    return res.json({
      valid: false,
      message: `Cette licence a été suspendue pour ${match.entreprise}. Contactez le support éditeur.`
    });
  }

  if (isExpired) {
    return res.json({
      valid: false,
      isExpired: true,
      message: `Cette licence a expiré le ${match.dateExpiration}. Veuillez renouveler votre abonnement.`,
      subscription: match
    });
  }

  res.json({
    valid: true,
    subscription: match,
    message: `Licence valide pour ${match.entreprise} (${match.plan}).`
  });
});

// Activate a 36-char license key for this instance
app.post('/api/subscriptions/activate', (req: Request, res: Response) => {
  const store = readStore();
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code manquant' });
  }

  const clean = code.trim().toUpperCase();
  const matchIndex = store.subscriptions.findIndex(s => {
    const rawMatch = s.licenseKey.replace(/[^A-Z0-9]/g, '') === clean.replace(/[^A-Z0-9]/g, '');
    return s.licenseKey === clean || rawMatch;
  });

  if (matchIndex === -1) {
    return res.status(404).json({ error: 'Code de licence à 36 caractères inexistant' });
  }

  const sub = store.subscriptions[matchIndex];
  store.activeLicenseKey = sub.licenseKey;
  store.subscriptions[matchIndex].cleActilee = true;
  store.subscriptions[matchIndex].statut = 'Actif';

  store.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('fr-FR'),
    user: 'Système / Utilisateur',
    action: 'Activation Licence',
    module: 'Abonnements & Licences',
    details: `Licence activée avec succès pour ${sub.entreprise}. Clé: ${sub.licenseKey}`,
    status: 'Sécurité',
    ipAddress: req.ip || '127.0.0.1'
  });

  saveStore(store);
  res.json({ success: true, subscription: sub });
});

// Get currently active license
app.get('/api/subscriptions/active', (_req: Request, res: Response) => {
  const store = readStore();
  const activeSub = store.subscriptions.find(s => s.licenseKey === store.activeLicenseKey);
  res.json({
    activeLicenseKey: store.activeLicenseKey,
    subscription: activeSub || null
  });
});

// 2. SECURITY & MASTER CONTROL API
app.get('/api/security/config', (_req: Request, res: Response) => {
  const store = readStore();
  res.json(store.securityConfig);
});

app.post('/api/security/config', (req: Request, res: Response) => {
  const store = readStore();
  store.securityConfig = { ...store.securityConfig, ...req.body };
  
  store.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('fr-FR'),
    user: 'Super Admin',
    action: 'Mise à Jour Configuration Sécurité',
    module: 'Sécurité Centrale',
    details: 'Modification des paramètres de sécurité globaux de l usine.',
    status: 'Sécurité',
    ipAddress: req.ip || '127.0.0.1'
  });

  saveStore(store);
  res.json(store.securityConfig);
});

// Emergency lockdown toggle (Kill switch)
app.post('/api/security/lockdown', (req: Request, res: Response) => {
  const store = readStore();
  const { pin, enable, reason } = req.body;

  if (pin !== store.securityConfig.masterPinCode && pin !== 'MAROC2026') {
    return res.status(403).json({ error: 'Code PIN Maître incorrect' });
  }

  store.securityConfig.emergencyLockdown = !!enable;
  if (enable) {
    store.securityConfig.lastLockdownDate = new Date().toISOString();
    store.securityConfig.lockdownReason = reason || 'Verrouillage d urgence activé par le Super Administrateur.';
  }

  store.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('fr-FR'),
    user: 'Super Admin',
    action: enable ? 'VERROUILLAGE D URGENCE ACTIVÉ' : 'DÉVERROUILLAGE SYSTÈME',
    module: 'Contrôle Total & Sécurité',
    details: enable 
      ? `VERROUILLAGE TOTAL DÉCLENCHÉ. Raison: ${store.securityConfig.lockdownReason}` 
      : 'Reprise normale de l exploitation et des distributions de carburant.',
    status: enable ? 'Alerte' : 'Succès',
    ipAddress: req.ip || '127.0.0.1'
  });

  saveStore(store);
  res.json({ success: true, securityConfig: store.securityConfig });
});

// Audit logs
app.get('/api/security/audit-logs', (_req: Request, res: Response) => {
  const store = readStore();
  res.json(store.auditLogs);
});

// Super Admin Authentication verification route
app.post('/api/auth/superadmin', (req: Request, res: Response) => {
  const { login, password } = req.body;
  if (
    login?.toLowerCase() === 'ouaradtech' && 
    password === 'Ouaradtech26@'
  ) {
    const store = readStore();
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      user: 'Super Admin (ouaradtech)',
      action: 'Connexion Super Admin Réussie',
      module: 'Authentification & Contrôle Total',
      details: 'Accès maître autorisé avec 100% des droits, menus et options.',
      status: 'Succès',
      ipAddress: req.ip || '127.0.0.1'
    });
    saveStore(store);
    return res.json({
      success: true,
      message: 'Authentification Super Administrateur réussie',
      user: {
        id: 'usr-superadmin',
        matricule: 'OUARAD-001',
        login: 'ouaradtech',
        nom: 'OuaradTech',
        prenom: 'Super Admin',
        role: 'Super Administrateur',
        email: 'admin@ouaradtech.com'
      }
    });
  }
  return res.status(401).json({ success: false, error: 'Identifiants Super Admin invalides' });
});

app.post('/api/security/audit-logs', (req: Request, res: Response) => {
  const store = readStore();
  const newLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('fr-FR'),
    ...req.body
  };
  store.auditLogs.unshift(newLog);
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
  res.status(201).json(newLog);
});

// 3. PERSISTENT APPLICATION DATA SYNC API
app.get('/api/data', (_req: Request, res: Response) => {
  const store = readStore();
  res.json({ appData: store.appData });
});

app.post('/api/data', (req: Request, res: Response) => {
  const store = readStore();
  store.appData = req.body;
  saveStore(store);
  res.json({ success: true, message: 'Données synchronisées avec succès sur le backend' });
});

app.post('/api/data/reset', (req: Request, res: Response) => {
  const { pin } = req.body;
  const store = readStore();
  if (pin !== store.securityConfig.masterPinCode && pin !== 'MAROC2026') {
    return res.status(403).json({ error: 'Code PIN Maître non valide' });
  }

  store.appData = null;
  saveStore(store);
  res.json({ success: true, message: 'Données réinitialisées' });
});

// ==========================================
// STATIC / VITE INTEGRATION
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HydroGasoil Backend Server running on http://0.0.0.0:${PORT}`);
    console.log(`🇲🇦 Supervision Carburant & Licences 36 Caractères prêtes`);
  });
}

startServer();
