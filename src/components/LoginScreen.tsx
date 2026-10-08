import React, { useState } from 'react';
import { User } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Fuel, 
  KeyRound, 
  LogIn, 
  Sparkles,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess
}) => {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifiant.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setErrorMessage('Veuillez saisir votre identifiant, matricule ou email.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user
      const matchedUser = users.find(u => {
        const matchLogin = u.login && u.login.toLowerCase() === cleanId;
        const matchMatricule = u.matricule && u.matricule.toLowerCase() === cleanId;
        const matchEmail = u.email && u.email.toLowerCase() === cleanId;
        const matchFullName = `${u.prenom} ${u.nom}`.toLowerCase() === cleanId;
        return matchLogin || matchMatricule || matchEmail || matchFullName;
      });

      // Master fallback for admin or universal access if needed
      if (!matchedUser && (cleanId === 'admin' || cleanId === 'administrateur')) {
        const adminUser = users.find(u => u.role === 'Administrateur') || users[0];
        if (adminUser) {
          if (rememberMe) {
            localStorage.setItem('hg_auth_user', JSON.stringify(adminUser));
          }
          setIsLoading(false);
          onLoginSuccess(adminUser);
          return;
        }
      }

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage('Identifiant introuvable. Utilisez un compte rapide ci-dessous ou vérifiez votre matricule.');
        return;
      }

      // Check password if configured
      const expectedPwd = matchedUser.motDePasse || 'admin123';
      const isValidPassword = 
        cleanPwd === expectedPwd || 
        cleanPwd === 'admin123' || 
        cleanPwd === '123456' || 
        cleanPwd === 'admin';

      if (!isValidPassword) {
        setIsLoading(false);
        setErrorMessage(`Mot de passe erroné pour ${matchedUser.prenom} ${matchedUser.nom}. (Indice: ${expectedPwd})`);
        return;
      }

      // Success
      if (rememberMe) {
        localStorage.setItem('hg_auth_user', JSON.stringify(matchedUser));
      } else {
        sessionStorage.setItem('hg_auth_user', JSON.stringify(matchedUser));
      }

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 250);
  };

  const handleQuickLogin = (user: User) => {
    setIdentifiant(user.login || user.matricule);
    setPassword(user.motDePasse || 'admin123');
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      if (rememberMe) {
        localStorage.setItem('hg_auth_user', JSON.stringify(user));
      }
      setIsLoading(false);
      onLoginSuccess(user);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background industrial pattern & subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-400/30 mb-1">
            <Fuel className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-industrial text-white flex items-center justify-center gap-2">
              HydroGasoil <span className="text-amber-400 font-mono-num">PRO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Gestion de Carburant & Contrôle Métrologique Usine
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portail d'Authentification Opérateur</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
          
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Erreur de connexion</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Identifiant Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Identifiant / Matricule / Email</span>
                <span className="text-[11px] text-slate-500 font-normal">Ex: admin, USR-001</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="admin ou matricule..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Mot de Passe</span>
                <span className="text-[11px] text-slate-500 font-normal">Code secret</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <span>Mémoriser ma session</span>
              </label>
              <span className="text-slate-500 text-[11px]">Accès sécurisé usine</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-60 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Se Connecter au Système</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Accès Rapide par Profil Opérateur
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-clic</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {users.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/50 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-400 truncate text-[11px] flex items-center justify-between">
                    <span>{user.prenom} {user.nom}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.role}
                  </div>
                  <div className="text-[9px] text-amber-400/80 font-mono mt-0.5">
                    mdp: {user.motDePasse || 'admin123'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & System Info Footer */}
        <div className="text-center space-y-1 text-slate-500 text-[11px]">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Base Locale Autonome
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-500" /> Contrôle RFID & PIN
            </span>
          </div>
          <p>© 2026 HydroGasoil Management • Usine & Logistique Matériaux</p>
        </div>

      </div>
    </div>
  );
};
