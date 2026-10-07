import React, { useState } from 'react';
import { 
  Database, 
  Save, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Truck, 
  ArrowDownToLine, 
  Fuel, 
  Users, 
  Building2, 
  SlidersHorizontal,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface LocalStorageModuleProps {
  stats: {
    citernesCount: number;
    vehiclesCount: number;
    entriesCount: number;
    dispensesCount: number;
    usersCount: number;
    fournisseursCount: number;
    vehicleTypesCount: number;
    alertsCount: number;
  };
  onForceSave: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonData: any) => boolean;
  onResetDemo: () => void;
}

export const LocalStorageModule: React.FC<LocalStorageModuleProps> = ({
  stats,
  onForceSave,
  onExportBackup,
  onImportBackup,
  onResetDemo
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(new Date().toLocaleTimeString('fr-FR'));

  const handleManualSave = () => {
    onForceSave();
    const time = new Date().toLocaleTimeString('fr-FR');
    setLastSavedTimestamp(time);
    setSaveMessage(`Toutes les données industrielles ont été réenregistrées avec succès dans le stockage local à ${time}.`);
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const success = onImportBackup(parsed);
        if (success) {
          setSaveMessage('Sauvegarde restaurée avec succès ! Les données locales ont été actualisées.');
          setImportError(null);
        } else {
          setImportError('Le fichier JSON ne contient pas la structure de données attendue.');
        }
      } catch (err) {
        setImportError('Erreur de lecture du fichier JSON. Assurez-vous qu’il s’agit d’une sauvegarde valide.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 font-industrial tracking-wide flex items-center gap-2">
              Gestion du Stockage Local & Sauvegardes
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Actif & Persistant
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toutes vos saisies (citernes, pleins, dépotages, signatures et opérateurs) sont conservées en mémoire locale sécurisée sur ce poste.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualSave}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer Localement Maintenant</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveMessage}</span>
          </div>
          <span className="text-[11px] font-mono-num text-emerald-400/80">
            Dernière sync : {lastSavedTimestamp}
          </span>
        </div>
      )}

      {importError && (
        <div className="p-4 bg-red-950/80 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {/* Grid of registered local records */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Citernes & Cuves</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.citernesCount}
          </div>
          <span className="text-[10px] text-slate-500">Enregistrées localement</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Parc Véhicules</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.vehiclesCount}
          </div>
          <span className="text-[10px] text-slate-500">Engins & compteurs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Entrées de Stock (BL)</span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.entriesCount}
          </div>
          <span className="text-[10px] text-slate-500">Bons signés en local</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Sorties / Pleins Pistolet</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.dispensesCount}
          </div>
          <span className="text-[10px] text-slate-500">Tickets & doubles signatures</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Utilisateurs & Agents</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.usersCount}
          </div>
          <span className="text-[10px] text-slate-500">Rôles & Badges RFID</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Fournisseurs Gasoil</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.fournisseursCount}
          </div>
          <span className="text-[10px] text-slate-500">Contrats référencés</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Types d'Engins</span>
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.vehicleTypesCount}
          </div>
          <span className="text-[10px] text-slate-500">Consommations de base</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Journal d'Alertes</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-100">
            {stats.alertsCount}
          </div>
          <span className="text-[10px] text-slate-500">Surconsommation & seuils</span>
        </div>
      </div>

      {/* Export & Import Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-industrial">
                Exporter la Sauvegarde Locale (JSON)
              </h4>
              <p className="text-xs text-slate-400">
                Télécharger une copie intégrale de toutes les tables pour archivage externe ou transfert vers un autre poste.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onExportBackup}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Sauvegarde Complète (JSON)</span>
          </button>
        </div>

        {/* Import Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-industrial">
                Restaurer depuis une Sauvegarde (JSON)
              </h4>
              <p className="text-xs text-slate-400">
                Charger un fichier de sauvegarde précédemment exporté pour écraser ou restaurer l'état de l'usine.
              </p>
            </div>
          </div>

          <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Sélectionner le Fichier JSON de Restauration</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
