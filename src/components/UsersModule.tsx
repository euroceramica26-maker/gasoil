import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
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
  UserCheck
} from 'lucide-react';

interface UsersModuleProps {
  users: User[];
  currentUser?: User | null;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const ROLES: UserRole[] = [
  'Administrateur',
  'Chef de Dépôt',
  'Pompiste',
  'Chauffeur / Opérateur',
  'Responsable Maintenance'
];

export const UsersModule: React.FC<UsersModuleProps> = ({
  users,
  currentUser,
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
      telephone: '+216 ',
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
        ...cleanedData
      });
    } else {
      onAddUser(cleanedData);
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
                <th className="p-3.5">Rôle & Habilitation</th>
                <th className="p-3.5">Département</th>
                <th className="p-3.5">Coordonnées</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {user.matricule}
                        </span>
                        {currentUser?.id === user.id && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Vous (Actif)
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
                      <div className="font-bold text-slate-100 text-sm">
                        {user.nom} {user.prenom}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Inscrit le {user.dateCreation}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border ${
                        user.role === 'Administrateur'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                          : user.role === 'Chef de Dépôt'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                          : user.role === 'Pompiste'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                          : user.role === 'Responsable Maintenance'
                          ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{user.role}</span>
                      </span>
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
                          onClick={() => handleOpenEdit(user)}
                          title="Modifier Utilisateur"
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          title="Supprimer Utilisateur"
                          className="p-1.5 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                    placeholder="+216 98 ..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="nom@usine-hydro.com"
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
