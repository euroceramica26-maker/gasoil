import React, { useState } from 'react';
import { User, UserRole, UserStatus, UserPermissions, Subscription } from '../types';
import { getDefaultPermissionsForRole, ensureUserPermissions, FULL_PERMISSIONS } from '../lib/userPermissions';
import { ConfirmModal } from './ConfirmModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  Key, 
  Phone, 
  Mail, 
  CheckCircle2, 
  X, 
  Download, 
  BadgeCheck, 
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Crown,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  Sparkles,
  Layers,
  Fuel,
  Truck,
  Building2,
  FileText,
  AlertCircle,
  HardDrive,
  ShieldAlert,
  Printer,
  ArrowDownToLine,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

interface UsersModuleProps {
  users: User[];
  currentUser?: User | null;
  subscriptions?: Subscription[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const ROLES: UserRole[] = [
  'Super Administrateur',
  'Administrateur',
  'Administrateur Client',
  'Chef de Dépôt',
  'Pompiste',
  'Chauffeur / Opérateur',
  'Responsable Maintenance',
  'Client / Opérateur Invité'
];

export const UsersModule: React.FC<UsersModuleProps> = ({
  users,
  currentUser,
  subscriptions = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Tous');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Modal de gestion des Habilitations, Menus et Options
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<UserPermissions | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    matricule: '',
    login: '',
    motDePasse: '',
    nom: '',
    prenom: '',
    role: 'Pompiste' as UserRole,
    email: '',
    telephone: '',
    statut: 'Actif' as UserStatus,
    badgeCode: '',
    departement: 'Station Distribution',
    dateCreation: new Date().toISOString().split('T')[0]
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      matricule: `USR-${randNum}`,
      login: `user${randNum}`,
      motDePasse: '123456',
      nom: '',
      prenom: '',
      role: 'Pompiste',
      email: '',
      telephone: '+212 ',
      statut: 'Actif',
      badgeCode: `RFID-${Math.floor(10000 + Math.random() * 90000)}`,
      departement: 'Station Distribution',
      dateCreation: new Date().toISOString().split('T')[0]
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      matricule: user.matricule,
      login: user.login || user.matricule.toLowerCase(),
      motDePasse: user.motDePasse || 'admin123',
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      email: user.email,
      telephone: user.telephone,
      statut: user.statut,
      badgeCode: user.badgeCode,
      departement: user.departement,
      dateCreation: user.dateCreation
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenPermissions = (user: User) => {
    const readyUser = ensureUserPermissions(user);
    setPermissionsUser(readyUser);
    setTempPermissions(JSON.parse(JSON.stringify(readyUser.permissions)));
    setSaveSuccessNotice(null);
  };

  const handleSavePermissions = () => {
    if (!permissionsUser || !tempPermissions) return;
    const updatedUser: User = {
      ...permissionsUser,
      permissions: tempPermissions
    };
    onUpdateUser(updatedUser);
    setSaveSuccessNotice(`Habilitations et menus enregistrés pour ${permissionsUser.prenom} ${permissionsUser.nom} !`);
    setTimeout(() => {
      setPermissionsUser(null);
      setSaveSuccessNotice(null);
    }, 900);
  };

  const applyPreset = (presetRole: UserRole) => {
    const presetPerms = getDefaultPermissionsForRole(presetRole);
    setTempPermissions(presetPerms);
  };

  const setAllMenus = (val: boolean) => {
    if (!tempPermissions) return;
    setTempPermissions({
      ...tempPermissions,
      menus: {
        dashboard: val,
        entries: val,
        dispenses: val,
        citernes: val,
        vehicles: val,
        gestion: val,
        fournisseurs: val,
        users: val,
        repairs: val,
        alerts: val,
        architecture: val,
        controle_total: val
      }
    });
  };

  const setAllOptions = (val: boolean) => {
    if (!tempPermissions) return;
    setTempPermissions({
      ...tempPermissions,
      options: {
        canAddEntries: val,
        canAddDispenses: val,
        canExportReports: val,
        canPrintReceipts: val,
        canManageCiternes: val,
        canManageVehicles: val,
        canManageUsers: val,
        canManageSubscriptions: val,
        canManageSecurity: val,
        canEmergencyLockdown: val
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.nom || !formData.prenom || !formData.matricule) {
      setFormError('Veuillez renseigner le nom, le prénom et le matricule.');
      return;
    }

    const cleanedData = {
      ...formData,
      login: formData.login.trim() || formData.matricule.toLowerCase(),
      motDePasse: formData.motDePasse.trim() || '123456'
    };

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...cleanedData,
        permissions: editingUser.permissions || getDefaultPermissionsForRole(cleanedData.role)
      });
    } else {
      onAddUser({
        ...cleanedData,
        permissions: getDefaultPermissionsForRole(cleanedData.role)
      });
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prenom', 'Role', 'Email', 'Telephone', 'Statut', 'Badge_RFID', 'Departement'];
    const rows = users.map(u => [
      `"${u.matricule}"`,
      `"${u.nom}"`,
      `"${u.prenom}"`,
      `"${u.role}"`,
      `"${u.email}"`,
      `"${u.telephone}"`,
      `"${u.statut}"`,
      `"${u.badgeCode}"`,
      `"${u.departement}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_usine_gasoil_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      u.nom.toLowerCase().includes(term) ||
      u.prenom.toLowerCase().includes(term) ||
      u.matricule.toLowerCase().includes(term) ||
      u.badgeCode.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.departement.toLowerCase().includes(term);

    const matchesRole = selectedRole === 'Tous' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'Tous' || u.statut === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-industrial">
            <Users className="w-5 h-5 text-amber-500" />
            Gestion des Utilisateurs & Opérateurs Usine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comptes des pompistes, chefs de dépôt, chauffeurs habilités et badges RFID ({users.length} utilisateurs)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>
      </div>

      {/* Super Admin Notice Banner */}
      {currentUser?.role === 'Super Administrateur' && (
        <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-amber-300 block text-sm">Contrôle Total des Accès (Super Admin OuaradTech)</span>
              <span className="text-slate-400 text-xs">
                Vous disposez de tous les droits d'administration. Cliquez sur le bouton <strong className="text-amber-400 font-semibold">« Menus & Droits »</strong> de n'importe quel compte client ou opérateur pour activer ou désactiver des menus et options à la carte.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Total Opérateurs</span>
          <span className="font-mono-num font-bold text-xl text-slate-100 mt-1 block">
            {users.length}
          </span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Pompistes Actifs</span>
          <span className="font-mono-num font-bold text-xl text-amber-400 mt-1 block">
            {users.filter(u => u.role === 'Pompiste' && u.statut === 'Actif').length}
          </span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Chefs de Dépôt / Admin</span>
          <span className="font-mono-num font-bold text-xl text-blue-400 mt-1 block">
            {users.filter(u => u.role === 'Chef de Dépôt' || u.role === 'Administrateur').length}
          </span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Chauffeurs Enregistrés</span>
          <span className="font-mono-num font-bold text-xl text-emerald-400 mt-1 block">
            {users.filter(u => u.role === 'Chauffeur / Opérateur').length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, badge RFID, email, département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Tous">Tous les Rôles ({users.length})</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Tous">Tous les Statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="Suspendu">Suspendu</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="p-3.5">Matricule & Badge</th>
                <th className="p-3.5">Nom & Prénom</th>
                <th className="p-3.5">Rôle Système</th>
                <th className="p-3.5">Accès Menus & Options</th>
                <th className="p-3.5">Département</th>
                <th className="p-3.5">Coordonnées</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const readyUser = ensureUserPermissions(user);
                  const menusCount = Object.values(readyUser.permissions?.menus || {}).filter(Boolean).length;
                  const optionsCount = Object.values(readyUser.permissions?.options || {}).filter(Boolean).length;
                  const isSuperAdmin = readyUser.role === 'Super Administrateur' || readyUser.login?.toLowerCase() === 'ouaradtech';

                  return (
                    <tr key={user.id} className={`hover:bg-slate-800/40 transition ${isSuperAdmin ? 'bg-amber-950/15' : ''}`}>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono-num font-bold px-2 py-0.5 rounded border ${
                            isSuperAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'text-amber-400 bg-slate-800 border-slate-700'
                          }`}>
                            {user.matricule}
                          </span>
                          {currentUser?.id === user.id && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Vous
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            <span>{user.badgeCode}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-slate-300">
                            <Lock className="w-2.5 h-2.5 text-amber-500" />
                            <span>login: <strong className="text-amber-400">{user.login || user.matricule.toLowerCase()}</strong></span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <span>{user.nom} {user.prenom}</span>
                          {isSuperAdmin && (
                            <span title="Super Administrateur - Tous Droits Actifs">
                              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Inscrit le {user.dateCreation}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {isSuperAdmin ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20">
                            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>Super Administrateur</span>
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border ${
                            user.role === 'Administrateur'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                              : user.role === 'Chef de Dépôt'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                              : user.role === 'Pompiste'
                              ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                              : user.role === 'Responsable Maintenance'
                              ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30'
                              : user.role === 'Client / Opérateur Invité'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <Shield className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        )}
                      </td>

                      {/* Colonne Habilitations Menus & Options */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleOpenPermissions(user)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 transition cursor-pointer ${
                            isSuperAdmin
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                              : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-500/60 hover:text-white'
                          }`}
                          title="Gérer les menus autorisés et options à la carte"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            <strong>{menusCount}</strong>/12 Menus • <strong>{optionsCount}</strong>/9 Options
                          </span>
                        </button>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {user.departement}
                      </td>

                      <td className="p-3.5 text-[11px] text-slate-400 space-y-0.5">
                        {user.telephone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{user.telephone}</span>
                          </div>
                        )}
                        {user.email && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block border ${
                          user.statut === 'Actif'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-950 text-red-400 border-red-500/30'
                        }`}>
                          {user.statut}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPermissions(user)}
                            title="Gérer Habilitations, Menus et Options"
                            className="p-1.5 rounded hover:bg-amber-950/60 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Modifier Utilisateur"
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin ? (
                            <span 
                              title="Compte Super Administrateur protégé"
                              className="p-1.5 text-amber-500/50 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(user)}
                              title="Supprimer Utilisateur"
                              className="p-1.5 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                {editingUser ? 'Modifier l’Utilisateur' : 'Créer un Nouvel Utilisateur'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-red-950 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Matricule Interne *</label>
                  <input
                    type="text"
                    required
                    value={formData.matricule}
                    onChange={e => setFormData({...formData, matricule: e.target.value})}
                    placeholder="USR-101"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Code Badge / RFID *</label>
                  <input
                    type="text"
                    required
                    value={formData.badgeCode}
                    onChange={e => setFormData({...formData, badgeCode: e.target.value})}
                    placeholder="RFID-12345"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono-num"
                  />
                </div>
              </div>

              {/* Login & Mot de Passe de Connexion */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                    Identifiant / Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.login}
                    onChange={e => setFormData({...formData, login: e.target.value})}
                    placeholder="ex: admin, benali"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Saisi à la connexion</span>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Mot de Passe *
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.motDePasse}
                    onChange={e => setFormData({...formData, motDePasse: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Indispensable au démarrage</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={e => setFormData({...formData, nom: e.target.value})}
                    placeholder="Benali"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={e => setFormData({...formData, prenom: e.target.value})}
                    placeholder="Ahmed"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Rôle & Fonction *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-semibold"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Statut du Compte</label>
                  <select
                    value={formData.statut}
                    onChange={e => setFormData({...formData, statut: e.target.value as UserStatus})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={e => setFormData({...formData, telephone: e.target.value})}
                    placeholder="+212 6 61 ... ou +212 5 22 ..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="nom@hydro-maroc.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Département / Affectation</label>
                <input
                  type="text"
                  value={formData.departement}
                  onChange={e => setFormData({...formData, departement: e.target.value})}
                  placeholder="Station Quai 1, Logistique, Transport..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  {editingUser ? 'Enregistrer Modifications' : 'Créer Utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuration des Habilitations, Menus & Options par le Super Admin */}
      {permissionsUser && tempPermissions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-5 shadow-2xl overflow-y-auto max-h-[92vh] space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <span>Habilitations & Accès Menus / Options</span>
                    {permissionsUser.role === 'Super Administrateur' && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        Super Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Collaborateur : <strong className="text-slate-200">{permissionsUser.prenom} {permissionsUser.nom}</strong> ({permissionsUser.matricule}) • Rôle : <span className="text-amber-400">{permissionsUser.role}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPermissionsUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 flex items-center gap-2 text-xs animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessNotice}</span>
              </div>
            )}

            {/* Rattachement à une Licence Client définie par le Super Admin */}
            {(() => {
              const matchedSub = subscriptions.find(s => 
                (permissionsUser.clientId && s.id === permissionsUser.clientId) ||
                (s.clientAdminId && s.clientAdminId === permissionsUser.id) ||
                (permissionsUser.entreprise && s.entreprise.toLowerCase() === permissionsUser.entreprise.toLowerCase())
              );
              if (!matchedSub) return null;
              return (
                <div className="p-3 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sky-300 block">
                        Licence Accordée par le Super Admin : {matchedSub.entreprise}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Plan {matchedSub.plan} • Code : {matchedSub.licenseKey.slice(0, 18)}...
                      </span>
                    </div>
                  </div>
                  {matchedSub.licensePermissions && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempPermissions(JSON.parse(JSON.stringify(matchedSub.licensePermissions)));
                      }}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-md shadow-sky-500/20"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Synchroniser avec la Licence Client</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Profils rapides */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Appliquer un profil d'accès rapide :
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('Super Administrateur')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition text-[11px]"
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Accès Total (100%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Chef de Dépôt')}
                  className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 border border-blue-500/30 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition text-[11px]"
                >
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span>Chef de Dépôt</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Pompiste')}
                  className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition text-[11px]"
                >
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span>Pompiste Station</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Client / Opérateur Invité')}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition text-[11px]"
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Client / Consultation</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Responsable Maintenance')}
                  className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition text-[11px]"
                >
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                  <span>Maintenance & Engins</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: MENUS AUTORISÉS (12 MENUS) */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>1. Menus de Navigation Autorisés ({Object.values(tempPermissions.menus).filter(Boolean).length}/12)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllMenus(true)}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Tout activer
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setAllMenus(false)}
                    className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                  >
                    Tout désactiver
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: 'dashboard', label: 'Tableau de Bord', desc: 'KPIs, stocks et jauges', icon: '📊' },
                  { key: 'entries', label: 'Entrées / Réceptions Gasoil', desc: 'Bons de livraison fournisseurs', icon: '📥' },
                  { key: 'dispenses', label: 'Distribution Volucompteurs', desc: 'Pleins véhicules et tickets', icon: '⛽' },
                  { key: 'citernes', label: 'Citernes & Jauges Cuves', desc: 'Niveaux et barèmes cuves', icon: '🛢️' },
                  { key: 'vehicles', label: 'Flotte Véhicules & Engins', desc: 'Camions, dumpers et engins', icon: '🚚' },
                  { key: 'gestion', label: 'Hub de Gestion Usine', desc: 'Paramètres globaux', icon: '⚙️' },
                  { key: 'fournisseurs', label: 'Fournisseurs Pétroliers', desc: 'Afriquia, Total, Shell...', icon: '🏢' },
                  { key: 'users', label: 'Utilisateurs & Opérateurs', desc: 'Gestion des habilitations', icon: '👥' },
                  { key: 'repairs', label: 'Maintenance & Métrologie', desc: 'Étalonnages et réparations', icon: '🔧' },
                  { key: 'alerts', label: 'Surconsommations & Alertes', desc: 'Détection des anomalies', icon: '⚠️' },
                  { key: 'architecture', label: 'Sauvegardes & Architecture', desc: 'Base locale et cloud', icon: '💾' },
                  { key: 'controle_total', label: 'Contrôle Total & Licences', desc: 'Vente abonnements 36 car.', icon: '🛡️' }
                ].map(menuItem => {
                  const isChecked = tempPermissions.menus[menuItem.key as keyof typeof tempPermissions.menus];
                  return (
                    <label
                      key={menuItem.key}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition select-none ${
                        isChecked 
                          ? 'bg-blue-950/30 border-blue-500/40 text-slate-100' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          setTempPermissions({
                            ...tempPermissions,
                            menus: {
                              ...tempPermissions.menus,
                              [menuItem.key]: e.target.checked
                            }
                          });
                        }}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs flex items-center gap-1 text-slate-200">
                          <span>{menuItem.icon}</span>
                          <span className="truncate">{menuItem.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {menuItem.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: OPTIONS & DROITS OPÉRATIONNELS (9 OPTIONS) */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>2. Options & Droits Métier ({Object.values(tempPermissions.options).filter(Boolean).length}/9)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllOptions(true)}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Tout autoriser
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setAllOptions(false)}
                    className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                  >
                    Tout interdire
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: 'canAddEntries', label: 'Saisir des Réceptions Gasoil', desc: 'Enregistrer bons de livraison', icon: <ArrowDownToLine className="w-3.5 h-3.5 text-blue-400" /> },
                  { key: 'canAddDispenses', label: 'Enregistrer des Distributions', desc: 'Pleins véhicules & décimales', icon: <Fuel className="w-3.5 h-3.5 text-amber-400" /> },
                  { key: 'canExportReports', label: 'Exporter Données CSV/Excel', desc: 'Télécharger les rapports d\'audit', icon: <Download className="w-3.5 h-3.5 text-emerald-400" /> },
                  { key: 'canPrintReceipts', label: 'Imprimer Tickets & Reçus', desc: 'Impression tickets de pompage', icon: <Printer className="w-3.5 h-3.5 text-cyan-400" /> },
                  { key: 'canManageCiternes', label: 'Configurer Cuves & Citernes', desc: 'Ajouter/modifier capacités', icon: <Layers className="w-3.5 h-3.5 text-indigo-400" /> },
                  { key: 'canManageVehicles', label: 'Gérer la Flotte Véhicules', desc: 'Ajout/modification des engins', icon: <Truck className="w-3.5 h-3.5 text-yellow-400" /> },
                  { key: 'canManageUsers', label: 'Gérer Comptes Utilisateurs', desc: 'Création et mot de passe', icon: <Users className="w-3.5 h-3.5 text-purple-400" /> },
                  { key: 'canManageSubscriptions', label: 'Vente Abonnements (36 car.)', desc: 'Émettre et valider les clés', icon: <KeyRound className="w-3.5 h-3.5 text-amber-400" /> },
                  { key: 'canEmergencyLockdown', label: 'Verrouillage d\'Urgence', desc: 'Arrêt immédiat du système usine', icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> }
                ].map(optItem => {
                  const isChecked = tempPermissions.options[optItem.key as keyof typeof tempPermissions.options];
                  return (
                    <label
                      key={optItem.key}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition select-none ${
                        isChecked 
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          setTempPermissions({
                            ...tempPermissions,
                            options: {
                              ...tempPermissions.options,
                              [optItem.key]: e.target.checked
                            }
                          });
                        }}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-slate-200">
                          {optItem.icon}
                          <span className="truncate">{optItem.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {optItem.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Action immédiate enregistrée pour le compte utilisateur.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPermissionsUser(null)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Enregistrer les Habilitations</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {userToDelete && (
        <ConfirmModal
          isOpen={true}
          title={`Supprimer l'utilisateur ${userToDelete.prenom} ${userToDelete.nom}`}
          message={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userToDelete.prenom} ${userToDelete.nom} (Matricule: ${userToDelete.matricule}) ?`}
          detail={`Rôle : ${userToDelete.role} • Badge RFID : ${userToDelete.badgeCode} • Département : ${userToDelete.departement}`}
          confirmLabel="Supprimer le Compte"
          onConfirm={() => {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};
