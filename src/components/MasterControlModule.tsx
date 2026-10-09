import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  Unlock, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  Building, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Printer, 
  FileText, 
  Sliders, 
  Eye, 
  EyeOff, 
  Clock, 
  Server, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  HardDrive,
  Users,
  ShieldCheck,
  Fuel,
  Info
} from 'lucide-react';
import { Subscription, SubscriptionPlan, SecurityConfig, AuditLog } from '../types';
import { generate36CharLicenseKey, validateLicenseKeyFormat, getDaysRemaining } from '../lib/licenseUtils';

interface MasterControlModuleProps {
  subscriptions: Subscription[];
  activeLicenseKey: string;
  securityConfig: SecurityConfig;
  auditLogs: AuditLog[];
  onAddSubscription: (sub: Subscription) => void;
  onUpdateSubscription: (id: string, updated: Partial<Subscription>) => void;
  onDeleteSubscription: (id: string) => void;
  onActivateLicenseKey: (key: string) => void;
  onUpdateSecurityConfig: (config: Partial<SecurityConfig>) => void;
  onToggleEmergencyLockdown: (enable: boolean, pin: string, reason?: string) => Promise<boolean>;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenActivationModal: () => void;
}

export const MasterControlModule: React.FC<MasterControlModuleProps> = ({
  subscriptions,
  activeLicenseKey,
  securityConfig,
  auditLogs,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onActivateLicenseKey,
  onUpdateSecurityConfig,
  onToggleEmergencyLockdown,
  onExportBackup,
  onImportBackup,
  onOpenActivationModal
}) => {
  const [activeTab, setActiveTab] = useState<'abonnements' | 'securite' | 'backend'>('abonnements');
  
  // Search & Filters for Subscriptions
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New Subscription Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEntreprise, setNewEntreprise] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newTelephone, setNewTelephone] = useState('+212 6 ');
  const [newVille, setNewVille] = useState('Mohammedia');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('Annuel');
  const [newPrixMAD, setNewPrixMAD] = useState(14000);
  const [newDurationDays, setNewDurationDays] = useState(365);
  const [newMaxVehicules, setNewMaxVehicules] = useState(50);
  const [newMaxCiternes, setNewMaxCiternes] = useState(6);
  const [newLicenseKey, setNewLicenseKey] = useState(() => generate36CharLicenseKey(true, 'HGMA'));
  const [newNotes, setNewNotes] = useState('');
  
  // Copied feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<{ [id: string]: boolean }>({});
  
  // Lockdown modal state
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);
  const [lockdownPinInput, setLockdownPinInput] = useState('');
  const [lockdownReasonInput, setLockdownReasonInput] = useState('');
  const [lockdownError, setLockdownError] = useState<string | null>(null);
  const [isLockdownLoading, setIsLockdownLoading] = useState(false);

  // Print Certificate Modal
  const [certificateSub, setCertificateSub] = useState<Subscription | null>(null);

  // Backend Health check
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    uptime?: number;
    timestamp?: string;
  }>({ connected: true });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus({
          connected: data.status === 'ok',
          uptime: data.uptime,
          timestamp: data.timestamp
        });
      })
      .catch(() => {
        setBackendStatus({ connected: false });
      });
  }, []);

  // Update pricing and duration when plan changes
  const handlePlanChange = (plan: SubscriptionPlan) => {
    setNewPlan(plan);
    if (plan === 'Mensuel') {
      setNewPrixMAD(1500);
      setNewDurationDays(30);
    } else if (plan === 'Trimestriel') {
      setNewPrixMAD(3900);
      setNewDurationDays(90);
    } else if (plan === 'Annuel') {
      setNewPrixMAD(14000);
      setNewDurationDays(365);
    } else if (plan === 'Entreprise') {
      setNewPrixMAD(38000);
      setNewDurationDays(1095); // 3 ans
    } else if (plan === 'Essai') {
      setNewPrixMAD(0);
      setNewDurationDays(14);
    }
  };

  const handleGenerateKey = () => {
    const key = generate36CharLicenseKey(true, 'HGMA');
    setNewLicenseKey(key);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Submit new subscription
  const handleSubmitNewSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntreprise.trim()) return;

    const today = new Date();
    const expiration = new Date();
    expiration.setDate(today.getDate() + newDurationDays);

    const sub: Subscription = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      licenseKey: newLicenseKey.trim(),
      clientName: newClientName.trim() || 'Responsable Dépôt',
      entreprise: newEntreprise.trim(),
      contact: newContact.trim() || 'Direction Logistique',
      telephone: newTelephone.trim(),
      ville: newVille.trim(),
      plan: newPlan,
      dateEmission: today.toISOString().split('T')[0],
      dateExpiration: expiration.toISOString().split('T')[0],
      statut: 'Actif',
      prixMAD: Number(newPrixMAD),
      maxVehicules: Number(newMaxVehicules),
      maxCiternes: Number(newMaxCiternes),
      notes: newNotes.trim(),
      cleActilee: false
    };

    onAddSubscription(sub);
    setIsFormOpen(false);
    
    // Reset form
    setNewEntreprise('');
    setNewClientName('');
    setNewNotes('');
    setNewLicenseKey(generate36CharLicenseKey(true, 'HGMA'));
  };

  // Emergency lockdown trigger
  const handleConfirmLockdown = async () => {
    setLockdownError(null);
    setIsLockdownLoading(true);

    const targetState = !securityConfig.emergencyLockdown;
    const success = await onToggleEmergencyLockdown(
      targetState, 
      lockdownPinInput, 
      lockdownReasonInput || (targetState ? 'Verrouillage d urgence activé par le panneau maître' : undefined)
    );

    setIsLockdownLoading(false);
    if (success) {
      setIsLockdownModalOpen(false);
      setLockdownPinInput('');
      setLockdownReasonInput('');
    } else {
      setLockdownError('Code PIN Maître incorrect. Seul le propriétaire peut exécuter cette action.');
    }
  };

  // Extend subscription
  const handleProlongSubscription = (sub: Subscription, days: number) => {
    const currentExp = new Date(sub.dateExpiration);
    currentExp.setDate(currentExp.getDate() + days);
    const newExpStr = currentExp.toISOString().split('T')[0];

    onUpdateSubscription(sub.id, {
      dateExpiration: newExpStr,
      statut: 'Actif'
    });
  };

  // Toggle suspend/active
  const handleToggleSuspend = (sub: Subscription) => {
    const newStatut = sub.statut === 'Actif' ? 'Suspendu' : 'Actif';
    onUpdateSubscription(sub.id, { statut: newStatut });
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      s.entreprise.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.licenseKey.toLowerCase().includes(q) ||
      s.ville.toLowerCase().includes(q);
    
    const matchPlan = planFilter === 'all' || s.plan === planFilter;
    const matchStatus = statusFilter === 'all' || s.statut === statusFilter;

    return matchQuery && matchPlan && matchStatus;
  });

  // Calculate KPIs
  const totalRevenueMAD = subscriptions.reduce((acc, s) => acc + (s.prixMAD || 0), 0);
  const activeSubsCount = subscriptions.filter(s => s.statut === 'Actif').length;
  const expiringSoonCount = subscriptions.filter(s => {
    const days = getDaysRemaining(s.dateExpiration);
    return days >= 0 && days <= 15 && s.statut === 'Actif';
  }).length;

  const currentActiveSub = subscriptions.find(s => s.licenseKey === activeLicenseKey) || null;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Emergency Lockdown Banner if active */}
      {securityConfig.emergencyLockdown && (
        <div className="p-4 bg-red-950/90 border-2 border-red-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-red-100 shadow-2xl shadow-red-500/30 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-600 text-white rounded-xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2 text-white">
                VERROUILLAGE TOTAL DE L'APPLICATION ACTIF (KILL SWITCH)
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                Raison : {securityConfig.lockdownReason || 'Mesure de sécurité usine enclenchée par le Super Administrateur.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setLockdownPinInput('');
              setLockdownError(null);
              setIsLockdownModalOpen(true);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-red-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow transition cursor-pointer shrink-0"
          >
            <Unlock className="w-4 h-4 text-red-700" />
            <span>Déverrouiller le Système</span>
          </button>
        </div>
      )}

      {/* Main Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-950/80 border border-red-500/50 rounded-full text-[10px] font-bold text-red-300 uppercase tracking-wider">
                🇲🇦 MAROC • SUPER ADMIN
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/50 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                <KeyRound className="w-3 h-3 text-amber-400" />
                Contrôle Total & Abonnements
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-800/90 border border-slate-700 rounded-full text-[10px] font-semibold text-emerald-400">
                <Server className="w-3 h-3" />
                Backend Express v2.5 (Port 3000)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-industrial flex items-center gap-2 mt-1">
              Panneau de Contrôle Total & Vente d'Abonnements
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-medium">
              Générez et commercialisez des abonnements avec codes uniques de 36 chiffres et lettres. Supervisez la sécurité, activez le verrouillage d'urgence et pilotez la base de données.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onOpenActivationModal()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Activer une Clé</span>
            </button>

            <button
              onClick={() => {
                setLockdownPinInput('');
                setLockdownError(null);
                setIsLockdownModalOpen(true);
              }}
              className={`px-3.5 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg ${
                securityConfig.emergencyLockdown 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
              }`}
            >
              {securityConfig.emergencyLockdown ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Déverrouiller Système</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Verrouillage d'Urgence</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                handleGenerateKey();
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nouvel Abonnement (36 Caractères)</span>
            </button>
          </div>
        </div>

        {/* Current Active Instance License Info Box */}
        {currentActiveSub && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <span className="text-slate-400">Licence Active sur cette Machine : </span>
                <strong className="text-slate-100">{currentActiveSub.entreprise}</strong>
                <span className="text-amber-400 font-semibold ml-1.5">({currentActiveSub.plan} - {currentActiveSub.ville})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300">
                <span>{currentActiveSub.licenseKey}</span>
                <button
                  onClick={() => handleCopyKey(currentActiveSub.licenseKey)}
                  className="hover:text-white transition"
                  title="Copier le code"
                >
                  {copiedKey === currentActiveSub.licenseKey ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded font-semibold text-[11px]">
                {getDaysRemaining(currentActiveSub.dateExpiration)} jours restants
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('abonnements')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'abonnements'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Vente des Abonnements ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('securite')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'securite'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Sécurité & Verrouillage d'Urgence</span>
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'backend'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Backend Express & Sauvegardes</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GESTION & VENTE DES ABONNEMENTS (CODES 36 CARACTÈRES) */}
      {/* ========================================================= */}
      {activeTab === 'abonnements' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Chiffre d'Affaires Abonnements
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono-num">
                {totalRevenueMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-normal">MAD</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Facturé sur le Royaume du Maroc</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Licences Actives
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono-num">
                {activeSubsCount} / {subscriptions.length}
              </div>
              <span className="text-[10px] text-slate-500 block">Clients industriels & transporteurs</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Expirations Proches (&lt;15j)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-orange-400 font-mono-num">
                {expiringSoonCount}
              </div>
              <span className="text-[10px] text-slate-500 block">À relancer pour renouvellement</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Format de Licence
              </span>
              <div className="text-sm font-extrabold text-slate-200 font-mono">
                36 Caractères ISO
              </div>
              <span className="text-[10px] text-slate-400 block">Alphanumérique crypté</span>
            </div>
          </div>

          {/* Form Modal: Create New Subscription */}
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                <div className="p-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-950/20 rounded-xl">
                      <KeyRound className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg tracking-tight font-industrial">
                        Émettre une Nouvelle Licence d'Abonnement (36 Caractères)
                      </h3>
                      <p className="text-xs font-semibold text-slate-950/80">
                        Création et vente de clé pour un client au Maroc
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 transition cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitNewSubscription} className="p-6 space-y-4 overflow-y-auto text-xs">
                  
                  {/* Generated 36-char license key showcase */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Code Clé Licence 36 Caractères (Généré) *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateKey}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Régénérer</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={newLicenseKey}
                        onChange={(e) => setNewLicenseKey(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono-num text-sm text-amber-300 font-bold tracking-wider focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyKey(newLicenseKey)}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      >
                        {copiedKey === newLicenseKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === newLicenseKey ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Longueur : <strong className="text-amber-400">{newLicenseKey.length}/36</strong> caractères</span>
                      <span>Format certifié compatible Maroc</span>
                    </div>
                  </div>

                  {/* Client & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Entreprise / Société Cible *</label>
                      <input
                        type="text"
                        required
                        value={newEntreprise}
                        onChange={(e) => setNewEntreprise(e.target.value)}
                        placeholder="Ex: Carrières de Mohammedia..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Nom du Contact / Responsable</label>
                      <input
                        type="text"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Ex: M. Othmane Bennani"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Téléphone Maroc</label>
                      <input
                        type="text"
                        value={newTelephone}
                        onChange={(e) => setNewTelephone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Ville / Région</label>
                      <select
                        value={newVille}
                        onChange={(e) => setNewVille(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Mohammedia">Mohammedia (Dépôt Pétrolier)</option>
                        <option value="Casablanca">Casablanca</option>
                        <option value="Jorf Lasfar">Jorf Lasfar / El Jadida</option>
                        <option value="Tanger">Tanger Med</option>
                        <option value="Marrakech">Marrakech</option>
                        <option value="Agadir">Agadir</option>
                        <option value="Fès">Fès</option>
                        <option value="Rabat">Rabat</option>
                        <option value="Oujda">Oujda</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Fonction Contact</label>
                      <input
                        type="text"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="Chef de Dépôt, DG..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Formule d'Abonnement *</label>
                      <select
                        value={newPlan}
                        onChange={(e) => handlePlanChange(e.target.value as SubscriptionPlan)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="Mensuel">Mensuel (30 jours) - 1 500 MAD</option>
                        <option value="Trimestriel">Trimestriel (90 jours) - 3 900 MAD</option>
                        <option value="Annuel">Annuel Pro (365 jours) - 14 000 MAD</option>
                        <option value="Entreprise">Entreprise Illimité (3 ans) - 38 000 MAD</option>
                        <option value="Essai">Essai Gratuit (14 jours) - 0 MAD</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Prix de Vente (MAD) *</label>
                      <input
                        type="number"
                        required
                        value={newPrixMAD}
                        onChange={(e) => setNewPrixMAD(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono-num font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Durée de Validité (Jours)</label>
                      <input
                        type="number"
                        required
                        value={newDurationDays}
                        onChange={(e) => setNewDurationDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono-num focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Technical Limits */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Max Véhicules / Engins</label>
                      <input
                        type="number"
                        value={newMaxVehicules}
                        onChange={(e) => setNewMaxVehicules(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono-num focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Max Citernes Supportées</label>
                      <input
                        type="number"
                        value={newMaxCiternes}
                        onChange={(e) => setNewMaxCiternes(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono-num focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Conditions & Notes Particulières</label>
                    <textarea
                      rows={2}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Modalités de règlement, référence devis ou bon de commande..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Valider & Émettre l'Abonnement</span>
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* Subscriptions List Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Table Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher entreprise, ville, code 36..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Toutes Formules</option>
                  <option value="Mensuel">Mensuel</option>
                  <option value="Trimestriel">Trimestriel</option>
                  <option value="Annuel">Annuel Pro</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Essai">Essai</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tous Statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Expiré">Expiré</option>
                  <option value="Suspendu">Suspendu</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Code de Licence (36 Caractères)</th>
                    <th className="p-3.5">Entreprise & Contact</th>
                    <th className="p-3.5">Ville</th>
                    <th className="p-3.5">Formule & Montant</th>
                    <th className="p-3.5">Période & Expiration</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredSubscriptions.map((sub) => {
                    const daysLeft = getDaysRemaining(sub.dateExpiration);
                    const isKeyVisible = visibleKeys[sub.id];
                    const isInstanceActive = sub.licenseKey === activeLicenseKey;

                    return (
                      <tr 
                        key={sub.id} 
                        className={`hover:bg-slate-800/40 transition ${
                          isInstanceActive ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        {/* License Key with Copy and Mask */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-num font-bold text-amber-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 tracking-wider text-[11px]">
                                {isKeyVisible 
                                  ? sub.licenseKey 
                                  : `${sub.licenseKey.slice(0, 13)}••••••••••••${sub.licenseKey.slice(-4)}`
                                }
                              </span>
                              <button
                                onClick={() => toggleKeyVisibility(sub.id)}
                                className="p-1 text-slate-500 hover:text-slate-300 transition"
                                title={isKeyVisible ? 'Masquer' : 'Afficher'}
                              >
                                {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopyKey(sub.licenseKey)}
                                className="p-1 text-slate-500 hover:text-amber-400 transition"
                                title="Copier le code à 36 caractères"
                              >
                                {copiedKey === sub.licenseKey ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {isInstanceActive && (
                              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                ✓ Licence active sur cette usine
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Company & Contact */}
                        <td className="p-3.5">
                          <div>
                            <span className="font-bold text-slate-100 block">{sub.entreprise}</span>
                            <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-slate-500" />
                              {sub.clientName} ({sub.contact})
                            </span>
                          </div>
                        </td>

                        {/* Ville */}
                        <td className="p-3.5">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {sub.ville}
                          </span>
                        </td>

                        {/* Formule & Prix */}
                        <td className="p-3.5">
                          <div>
                            <span className="font-bold text-amber-400 block">{sub.plan}</span>
                            <span className="font-mono-num text-[11px] text-slate-400 font-semibold">
                              {sub.prixMAD.toLocaleString('fr-FR')} MAD
                            </span>
                          </div>
                        </td>

                        {/* Expiration */}
                        <td className="p-3.5">
                          <div>
                            <span className="font-mono-num text-slate-300 block">{sub.dateExpiration}</span>
                            <span className={`text-[10px] font-bold ${
                              daysLeft < 0 
                                ? 'text-red-400' 
                                : daysLeft <= 15 
                                ? 'text-orange-400' 
                                : 'text-emerald-400'
                            }`}>
                              {daysLeft < 0 
                                ? `Expirée depuis ${Math.abs(daysLeft)} j` 
                                : `${daysLeft} jours restants`
                              }
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            sub.statut === 'Actif'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : sub.statut === 'Suspendu'
                              ? 'bg-red-950/80 text-red-300 border-red-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {sub.statut}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            
                            {/* Activate button if not active */}
                            {!isInstanceActive && (
                              <button
                                onClick={() => onActivateLicenseKey(sub.licenseKey)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                                title="Appliquer cette licence à l'application courante"
                              >
                                Activer
                              </button>
                            )}

                            {/* Renew / Prolong */}
                            <button
                              onClick={() => handleProlongSubscription(sub, 365)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                              title="Prolonger de 1 an (+365 jours)"
                            >
                              +1 An
                            </button>

                            {/* Certificate preview */}
                            <button
                              onClick={() => setCertificateSub(sub)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                              title="Certificat Officiel / Bon d'Abonnement"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Suspend / Resume */}
                            <button
                              onClick={() => handleToggleSuspend(sub)}
                              className={`p-1.5 transition ${
                                sub.statut === 'Actif' 
                                  ? 'text-red-400 hover:text-red-300' 
                                  : 'text-emerald-400 hover:text-emerald-300'
                              }`}
                              title={sub.statut === 'Actif' ? 'Suspendre la licence' : 'Réactiver la licence'}
                            >
                              {sub.statut === 'Actif' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer définitivement l'abonnement pour ${sub.entreprise} ?`)) {
                                  onDeleteSubscription(sub.id);
                                }
                              }}
                              className="p-1.5 text-slate-600 hover:text-red-400 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Aucun abonnement ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CONTRÔLE DE SÉCURITÉ & VERROUILLAGE D'URGENCE */}
      {/* ========================================================= */}
      {activeTab === 'securite' && (
        <div className="space-y-6">
          
          {/* Emergency Kill Switch Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/80 border border-red-500/50 rounded-full text-[10px] font-bold text-red-300 uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  Sécurité Absolue Usine & Métrologie
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight font-industrial">
                  Bouton d'Urgence : Verrouillage Total Immédiat (Kill Switch)
                </h3>
                <p className="text-xs text-slate-400">
                  En cas de suspicion de fraude de carburant, fuite sur citerne, incident ou non-paiement client : déclenchez un arrêt immédiat de toutes les délivrances et accès opérateurs sur la plateforme.
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                  <span>Code PIN Maître requis : <strong>••••••••</strong> (Défaut : MAROC2026)</span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => {
                    setLockdownPinInput('');
                    setLockdownError(null);
                    setIsLockdownModalOpen(true);
                  }}
                  className={`px-6 py-4 rounded-2xl font-extrabold text-sm flex items-center gap-3 transition cursor-pointer shadow-2xl ${
                    securityConfig.emergencyLockdown
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                  }`}
                >
                  {securityConfig.emergencyLockdown ? (
                    <>
                      <Unlock className="w-6 h-6" />
                      <span>DÉVERROUILLER L'APPLICATION</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-6 h-6" />
                      <span>ENCLENCHER LE VERROUILLAGE D'URGENCE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Switches & Governance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Global Switches */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Politique & Gouvernance Usine
              </h4>

              <div className="space-y-3 text-xs">
                {/* Require Signature */}
                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-slate-200 block">Signature Manuscrite Obligatoire</span>
                    <span className="text-[11px] text-slate-500">Exige la griffe du chauffeur et du pompiste avant toute sortie</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityConfig.requireSignatures}
                    onChange={(e) => onUpdateSecurityConfig({ requireSignatures: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                </label>

                {/* Double validation */}
                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-slate-200 block">Double Validation Réceptions Carburant</span>
                    <span className="text-[11px] text-slate-500">Validation par le Chef de Dépôt avant ajustement des stocks citernes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityConfig.doubleValidationReceptions}
                    onChange={(e) => onUpdateSecurityConfig({ doubleValidationReceptions: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                </label>

                {/* Maintenance Mode */}
                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-slate-200 block">Mode Maintenance Dépôt</span>
                    <span className="text-[11px] text-slate-500">Avertit les utilisateurs d'un étalonnage en cours des volucompteurs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityConfig.maintenanceMode}
                    onChange={(e) => onUpdateSecurityConfig({ maintenanceMode: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                </label>

                {/* Read Only Mode */}
                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-slate-200 block">Mode Lecture Seule (Audit & Contrôle)</span>
                    <span className="text-[11px] text-slate-500">Gèle les ajouts et modifications (idéal pour inspection douanière)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityConfig.readOnlyMode}
                    onChange={(e) => onUpdateSecurityConfig({ readOnlyMode: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Session Security */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Sessions & Protection Anti-Intrusion
              </h4>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Délai d'Inactivité de Session (Déconnexion Auto)</label>
                  <select
                    value={securityConfig.sessionTimeoutMinutes}
                    onChange={(e) => onUpdateSecurityConfig({ sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value={15}>15 minutes (Haute Sécurité)</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes (Recommandé)</option>
                    <option value={120}>2 heures</option>
                    <option value={480}>8 heures (Poste de travail complet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Nombre Max de Tentatives de Connexion Échouées</label>
                  <select
                    value={securityConfig.maxLoginAttempts}
                    onChange={(e) => onUpdateSecurityConfig({ maxLoginAttempts: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value={3}>3 tentatives (Blocage immédiat)</option>
                    <option value={5}>5 tentatives</option>
                    <option value={10}>10 tentatives</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-300 block">Code PIN Maître de Secours</span>
                  <p className="text-[11px] text-slate-500">
                    Utilisé pour déverrouiller l'application en cas d'urgence : <code className="text-amber-400 font-mono">MAROC2026</code>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Journal d'Audit de Sécurité en Direct (Audit Logs)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Horodatage infalsifiable des connexions, délivrances et modifications de configuration
                </p>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {auditLogs.length} événements
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Détails Opérationnels</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono-num text-[11px] text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-bold text-slate-200 whitespace-nowrap">
                        {log.user}
                      </td>
                      <td className="p-3 text-slate-300 font-semibold">
                        {log.action}
                      </td>
                      <td className="p-3 text-amber-400/90 whitespace-nowrap">
                        {log.module}
                      </td>
                      <td className="p-3 text-slate-400 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'Succès'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'Sécurité'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                            : log.status === 'Alerte'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BACKEND EXPRESS & SAUVEGARDES USINE */}
      {/* ========================================================= */}
      {activeTab === 'backend' && (
        <div className="space-y-6">
          
          {/* Server Architecture Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-industrial">
                    Serveur Backend Express (Node.js & API REST)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connectivité temps réel et persistance sécurisée sur disque usine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  En Ligne & Opérationnel
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Port d'Écoute</span>
                <span className="font-mono text-sm font-bold text-amber-300">0.0.0.0:3000</span>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Base de Données</span>
                <span className="font-mono text-sm font-bold text-slate-200">/data/store.json (Persistant)</span>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Temps de Fonctionnement</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {backendStatus.uptime ? `${Math.floor(backendStatus.uptime)} secondes` : 'Actif'}
                </span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Export Backup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Sauvegarde Complète (Export JSON)</h4>
                  <p className="text-[11px] text-slate-400">Téléchargez l'intégralité des stocks, véhicules et abonnements</p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Génère un fichier d'archive certifié contenant les citernes, délivrances, livraisons, véhicules et licences 36 caractères.
              </p>

              <button
                onClick={onExportBackup}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Télécharger la Sauvegarde Immédiate</span>
              </button>
            </div>

            {/* Import Backup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Restauration depuis un Fichier</h4>
                  <p className="text-[11px] text-slate-400">Restaurez une sauvegarde précédente sur le backend</p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Sélectionnez un fichier JSON exporté pour réinjecter les données sans interruption de service.
              </p>

              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-blue-500/40 transition cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Sélectionner Fichier de Restauration</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onImportBackup(file);
                    }
                  }}
                />
              </label>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EMERGENCY LOCKDOWN / KILL SWITCH */}
      {/* ========================================================= */}
      {isLockdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/60 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-950/80 rounded-xl border border-red-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {securityConfig.emergencyLockdown ? 'Déverrouiller le Système' : 'Verrouillage d Urgence'}
                </h3>
                <span className="text-xs text-red-300 font-semibold">
                  Action réservée au Super Administrateur
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {securityConfig.emergencyLockdown
                ? 'Cette action rétablira immédiatement l accès aux délivrances de carburant et réceptions de stock.'
                : 'Attention : le verrouillage d urgence bloque immédiatement toutes les pompes et opérations de gasoil sur l usine.'}
            </p>

            {!securityConfig.emergencyLockdown && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Raison du Verrouillage</label>
                <input
                  type="text"
                  value={lockdownReasonInput}
                  onChange={(e) => setLockdownReasonInput(e.target.value)}
                  placeholder="Ex: Audit inopiné, maintenance d urgence, fraude..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Code PIN Maître de Sécurité *</label>
              <input
                type="password"
                required
                autoFocus
                value={lockdownPinInput}
                onChange={(e) => {
                  setLockdownPinInput(e.target.value);
                  setLockdownError(null);
                }}
                placeholder="Code PIN Maître (défaut: MAROC2026)"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            {lockdownError && (
              <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-200">
                {lockdownError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLockdownModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isLockdownLoading || !lockdownPinInput.trim()}
                onClick={handleConfirmLockdown}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50 ${
                  securityConfig.emergencyLockdown
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isLockdownLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : securityConfig.emergencyLockdown ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Confirmer Déverrouillage</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Confirmer Verrouillage d Urgence</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL CERTIFICATE & INVOICE PREVIEW */}
      {/* ========================================================= */}
      {certificateSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇲🇦</span>
                <h3 className="font-extrabold text-base text-white font-industrial">
                  Certificat d'Abonnement Logiciel Officiel
                </h3>
              </div>
              <button
                onClick={() => setCertificateSub(null)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-white text-slate-900 rounded-xl space-y-4 shadow font-sans text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase">HYDROGASOIL MAROC</h4>
                  <p className="text-[10px] text-slate-600">Supervision Métrologique & Gestion Industrielle de Carburant</p>
                  <p className="text-[10px] text-slate-500">Royaume du Maroc • Mohammedia & Jorf Lasfar</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    CERTIFICAT N° {certificateSub.id}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Émis le {certificateSub.dateEmission}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-bold text-slate-600">Client / Entreprise :</span>
                  <span className="font-extrabold text-slate-900">{certificateSub.entreprise}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-bold text-slate-600">Ville & Dépôt :</span>
                  <span className="font-semibold text-slate-800">{certificateSub.ville}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-bold text-slate-600">Formule d'Abonnement :</span>
                  <span className="font-bold text-amber-700">{certificateSub.plan}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-bold text-slate-600">Période de Validité :</span>
                  <span className="font-semibold text-slate-800">Du {certificateSub.dateEmission} au {certificateSub.dateExpiration}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-bold text-slate-600">Montant Facturé :</span>
                  <span className="font-extrabold text-slate-900 font-mono">{certificateSub.prixMAD.toLocaleString('fr-FR')} MAD TTC</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-700 text-[11px] block">CLÉ DE LICENCE LOGICIELLE (36 CARACTÈRES) :</span>
                <code className="block bg-white p-2 rounded border border-slate-300 font-mono text-center font-bold text-sm text-slate-950 tracking-wider select-all">
                  {certificateSub.licenseKey}
                </code>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span>Cachet Émetteur : HydroGasoil Solutions Maroc</span>
                <span className="font-bold text-emerald-700">Licence Authentifiée</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleCopyKey(certificateSub.licenseKey)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === certificateSub.licenseKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copier la Clé 36</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer le Certificat</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
