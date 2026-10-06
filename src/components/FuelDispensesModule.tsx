import React, { useState } from 'react';
import { FuelDispense, Vehicle, Citerne } from '../types';
import { SignaturePad } from './SignaturePad';
import { PrintReceiptModal } from './PrintReceiptModal';
import { ConfirmModal } from './ConfirmModal';
import { Fuel, Plus, Printer, AlertTriangle, CheckCircle2, TrendingUp, Calendar, User, Gauge, X, FileSignature, Trash2 } from 'lucide-react';

interface FuelDispensesModuleProps {
  dispenses: FuelDispense[];
  vehicles: Vehicle[];
  citernes: Citerne[];
  onAddDispense: (dispense: Omit<FuelDispense, 'id'>) => void;
  onDeleteDispense?: (id: string, restoreTankStock: boolean) => void;
}

export const FuelDispensesModule: React.FC<FuelDispensesModuleProps> = ({
  dispenses,
  vehicles,
  citernes,
  onAddDispense,
  onDeleteDispense
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDispenseForPrint, setSelectedDispenseForPrint] = useState<FuelDispense | null>(null);
  const [dispenseToDelete, setDispenseToDelete] = useState<FuelDispense | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [citerneId, setCiterneId] = useState(citernes[0]?.id || '');
  const [pompiste, setPompiste] = useState('Samir Chaabane');
  const [chauffeur, setChauffeur] = useState('');
  const [volumeLivre, setVolumeLivre] = useState<number>(150);
  const [compteurActuel, setCompteurActuel] = useState<number>(0);
  const [remarques, setRemarques] = useState('');
  const [signatureChauffeur, setSignatureChauffeur] = useState('');

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const currentCiterne = citernes.find(c => c.id === citerneId);

  // Auto calculate delta and ratio
  const compteurPrecedent = currentVehicle ? currentVehicle.kilometrageOuHeures : 0;
  const delta = Math.max(0, compteurActuel - compteurPrecedent);

  let calculatedRatio = 0;
  if (currentVehicle && delta > 0 && volumeLivre > 0) {
    if (currentVehicle.uniteMesure === 'km') {
      calculatedRatio = (volumeLivre / delta) * 100;
    } else {
      calculatedRatio = volumeLivre / delta;
    }
  }

  const isOverconsumption = currentVehicle && calculatedRatio > 0
    ? calculatedRatio > currentVehicle.consommationMoyenneTheorique * 1.15
    : false;

  const handleOpenForm = () => {
    const v = vehicles[0];
    setSelectedVehicleId(v?.id || '');
    setCiterneId(citernes[0]?.id || '');
    setCompteurActuel((v?.kilometrageOuHeures || 0) + (v?.uniteMesure === 'km' ? 250 : 12));
    setVolumeLivre(120);
    setChauffeur('Mourad Kharrat');
    setPompiste('Samir Chaabane');
    setRemarques('');
    setSignatureChauffeur('');
    setIsFormOpen(true);
  };

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find(item => item.id === vId);
    if (v) {
      const suggestedIncrement = v.uniteMesure === 'km' ? 300 : 15;
      setCompteurActuel(v.kilometrageOuHeures + suggestedIncrement);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!currentVehicle || !currentCiterne) return;

    if (volumeLivre <= 0) {
      setFormError('Veuillez saisir un volume de carburant valide supérieur à 0.');
      return;
    }

    if (volumeLivre > currentCiterne.stockActuel) {
      setFormError(`Stock insuffisant dans ${currentCiterne.code} (reste ${currentCiterne.stockActuel.toLocaleString()} L).`);
      return;
    }

    if (compteurActuel < compteurPrecedent) {
      setFormError(`L'index compteur actuel (${compteurActuel}) ne peut pas être inférieur au compteur précédent (${compteurPrecedent}).`);
      return;
    }

    const newDispense: Omit<FuelDispense, 'id'> = {
      codeTicket: `SORT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dateHeure: new Date().toISOString(),
      citerneId,
      vehiculeId: selectedVehicleId,
      pompiste,
      chauffeur: chauffeur || 'Chauffeur de bord',
      volumeLivre,
      compteurActuel,
      compteurPrecedent,
      deltaCompteur: delta,
      ratioConsommation: Number(calculatedRatio.toFixed(2)),
      surconsommationAlerte: isOverconsumption,
      signatureChauffeur,
      remarques
    };

    onAddDispense(newDispense);
    setIsFormOpen(false);

    // Auto open ticket print preview
    setSelectedDispenseForPrint({
      ...newDispense,
      id: `dsp-${Date.now()}`
    });
  };

  return (
    <div className="space-y-5">
      {actionFeedback && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionFeedback(null)} 
            className="text-emerald-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-industrial">
            <Fuel className="w-5 h-5 text-amber-500" />
            Module 3 : Gestion des Sorties & Pleins Carburant
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Délivrance au pistolet, calcul de consommation unitaire (L/100km ou L/h) et détection des surconsommations
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Distribuer Carburant (Nouveau Plein)</span>
        </button>
      </div>

      {/* Fuel Dispenses History Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Historique des Distributions ({dispenses.length} pleins)
          </span>
          <span className="text-xs text-slate-500 font-mono-num">
            Total distribué : {dispenses.reduce((acc, d) => acc + d.volumeLivre, 0).toLocaleString('fr-FR')} L
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="p-3.5">N° Ticket / Heure</th>
                <th className="p-3.5">Véhicule & Engin</th>
                <th className="p-3.5">Citerne Source</th>
                <th className="p-3.5">Volume Délivré</th>
                <th className="p-3.5">Delta Compteur</th>
                <th className="p-3.5">Ratio Consommation</th>
                <th className="p-3.5">Intervenants</th>
                <th className="p-3.5 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {dispenses.map(dsp => {
                const veh = vehicles.find(v => v.id === dsp.vehiculeId);
                const cit = citernes.find(c => c.id === dsp.citerneId);

                return (
                  <tr key={dsp.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <span className="font-mono-num font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {dsp.codeTicket}
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono-num mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(dsp.dateHeure).toLocaleString('fr-FR')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="text-amber-400 font-industrial">{veh?.code || 'N/A'}</span>
                        <span>{veh?.marque} {veh?.modele}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono-num block">
                        Immat: {veh?.immatriculation} • {veh?.departement}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200">
                        {cit?.code || dsp.citerneId}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {cit?.nom}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono-num font-bold text-sm text-slate-100">
                      {dsp.volumeLivre.toLocaleString('fr-FR')} L
                    </td>

                    <td className="p-3.5 font-mono-num text-[11px] text-slate-300">
                      <div>Index: {dsp.compteurActuel.toLocaleString()} {veh?.uniteMesure}</div>
                      <div className="text-slate-500">Préc: {dsp.compteurPrecedent.toLocaleString()} (+{dsp.deltaCompteur})</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono-num font-bold text-sm ${
                          dsp.surconsommationAlerte ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {dsp.ratioConsommation.toFixed(1)} {veh?.uniteMesure === 'km' ? 'L/100km' : 'L/h'}
                        </span>
                        {dsp.surconsommationAlerte && (
                          <span title="Surconsommation détectée !" className="p-0.5 bg-red-950 text-red-400 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-num">
                        Théorique: {veh?.consommationMoyenneTheorique}
                      </span>
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-400">
                      <div>Chauffeur: <span className="text-slate-200">{dsp.chauffeur}</span></div>
                      <div>Pompiste: <span className="text-slate-300">{dsp.pompiste}</span></div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDispenseForPrint(dsp)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </button>

                        {onDeleteDispense && (
                          <button
                            type="button"
                            onClick={() => setDispenseToDelete(dsp)}
                            title="Supprimer cette distribution de carburant"
                            className="px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Distribution de Carburant */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-5 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-industrial">
                  <Fuel className="w-5 h-5 text-amber-500" />
                  Délivrance de Carburant au Pistolet (Plein)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calcul en direct de la consommation moyenne et contrôle de cohérence
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-950 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Véhicule / Machine Cible *</label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => handleVehicleChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-semibold"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.code} - {v.marque} {v.modele} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Citerne Source / Pompe *</label>
                  <select
                    value={citerneId}
                    onChange={e => setCiterneId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-semibold"
                  >
                    {citernes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - Stock dispo: {c.stockActuel.toLocaleString()} L
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle Context Info Card */}
              {currentVehicle && (
                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Dernier Index Enregistré</span>
                    <span className="font-mono-num font-bold text-slate-200 text-sm">
                      {compteurPrecedent.toLocaleString('fr-FR')} {currentVehicle.uniteMesure}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Réservoir Véhicule</span>
                    <span className="font-mono-num font-bold text-slate-200 text-sm">
                      {currentVehicle.capaciteReservoir} Litres
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Norme Constructeur</span>
                    <span className="font-mono-num font-bold text-amber-400 text-sm">
                      {currentVehicle.consommationMoyenneTheorique} {currentVehicle.uniteMesure === 'km' ? 'L/100km' : 'L/h'}
                    </span>
                  </div>
                </div>
              )}

              {/* Counters & Volume Delivered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold text-amber-400">
                    Volume Carburant Pompé (Litres) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={currentVehicle?.capaciteReservoir ? currentVehicle.capaciteReservoir * 1.2 : 2000}
                    value={volumeLivre}
                    onChange={e => setVolumeLivre(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold font-mono-num text-base"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold text-slate-200">
                    Index Compteur Actuel ({currentVehicle?.uniteMesure}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={compteurPrecedent}
                    value={compteurActuel}
                    onChange={e => setCompteurActuel(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono-num text-base"
                  />
                </div>
              </div>

              {/* Dynamic Consumption Preview Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isOverconsumption 
                  ? 'bg-red-950/70 border-red-500/40 text-red-200' 
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Gauge className={`w-5 h-5 ${isOverconsumption ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                  <div>
                    <span className="font-semibold text-xs block">
                      {isOverconsumption ? 'Alerte Surconsommation Détectée !' : 'Calcul Instantané de la Consommation :'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Delta: +{delta} {currentVehicle?.uniteMesure} parcourus depuis le dernier plein
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono-num text-base font-bold block">
                    {calculatedRatio > 0 ? calculatedRatio.toFixed(2) : '--'} {currentVehicle?.uniteMesure === 'km' ? 'L/100km' : 'L/h'}
                  </span>
                  <span className="text-[10px] opacity-70 font-mono-num">
                    Réf constructeur: {currentVehicle?.consommationMoyenneTheorique}
                  </span>
                </div>
              </div>

              {/* Drivers & Operators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Chauffeur / Opérateur Engin *</label>
                  <input
                    type="text"
                    required
                    value={chauffeur}
                    onChange={e => setChauffeur(e.target.value)}
                    placeholder="Nom du conducteur..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Pompiste Distributeur *</label>
                  <input
                    type="text"
                    required
                    value={pompiste}
                    onChange={e => setPompiste(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Remarques / Anomalies Éventuelles</label>
                <input
                  type="text"
                  value={remarques}
                  onChange={e => setRemarques(e.target.value)}
                  placeholder="Ex: Utilisation intensives en côte, ralenti prolongé..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              {/* Signature Capture */}
              <div className="pt-1">
                <SignaturePad
                  signatoryTitle="Émargement Manuscrit du Chauffeur / Destinataire"
                  onSave={(signatureData) => {
                    setSignatureChauffeur(signatureData);
                  }}
                  initialSignature={signatureChauffeur}
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  Valider Distribution & Générer Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Print Modal */}
      {selectedDispenseForPrint && (
        <PrintReceiptModal
          type="sortie"
          data={selectedDispenseForPrint}
          citernes={citernes}
          vehicles={vehicles}
          onClose={() => setSelectedDispenseForPrint(null)}
        />
      )}

      {/* In-App Delete Confirmation Modal */}
      {dispenseToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Supprimer la distribution de carburant"
          message={`Êtes-vous sûr de vouloir supprimer définitivement le ticket ${dispenseToDelete.codeTicket} ?`}
          detail={`Action : Suppression du ticket et restitution de ${dispenseToDelete.volumeLivre.toLocaleString('fr-FR')} Litres dans la citerne source.`}
          confirmLabel="Supprimer Définitivement"
          onConfirm={() => {
            const ticket = dispenseToDelete.codeTicket;
            const vol = dispenseToDelete.volumeLivre;
            if (onDeleteDispense) {
              onDeleteDispense(dispenseToDelete.id, true);
            }
            setDispenseToDelete(null);
            setActionFeedback(`Distribution ${ticket} supprimée avec succès. +${vol.toLocaleString('fr-FR')} L restitués dans la citerne.`);
          }}
          onCancel={() => setDispenseToDelete(null)}
        />
      )}
    </div>
  );
};
