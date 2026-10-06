import React from 'react';
import { StockEntry, FuelDispense, Citerne, Vehicle } from '../types';
import { Printer, X, CheckCircle, FileText, Download } from 'lucide-react';

interface PrintReceiptModalProps {
  type: 'entree' | 'sortie';
  data: StockEntry | FuelDispense;
  citernes: Citerne[];
  vehicles?: Vehicle[];
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  type,
  data,
  citernes,
  vehicles = [],
  onClose
}) => {
  const isEntree = type === 'entree';
  const entry = isEntree ? (data as StockEntry) : null;
  const dispense = !isEntree ? (data as FuelDispense) : null;

  const targetCiterne = citernes.find(c => c.id === (entry ? entry.citerneId : dispense?.citerneId));
  const targetVehicle = dispense ? vehicles.find(v => v.id === dispense.vehiculeId) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Toolbar (No-Print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-100 text-base">
              Aperçu avant Impression - {isEntree ? 'Bon de Réception Gasoil' : 'Ticket de Distribution Carburant'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg flex items-center gap-2 text-sm shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer (A4 / Ticket 80mm)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 overflow-y-auto bg-slate-900/60 flex justify-center">
          <div className="printable-receipt w-full max-w-xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200">
            {/* Plant Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase font-industrial">
                  HYDRO-GASOIL INDUSTRIAL PLANT
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complexe Industriel & Unité de Production Énergétique
                </p>
                <p className="text-[11px] text-slate-500">
                  Dépôt Hydrocarbures • Contrôle Métrologique & Qualité
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono-num font-bold text-xs rounded">
                  {isEntree ? entry?.numeroBon : dispense?.codeTicket}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono-num">
                  {new Date(isEntree ? (entry?.dateLivraison || '') : (dispense?.dateHeure || '')).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="bg-slate-100 p-2.5 rounded border border-slate-300 text-center mb-5">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isEntree 
                  ? 'BON DE RÉCEPTION ET DÉPOTAGE CARBURANT (ENTRÉE DE STOCK)' 
                  : 'BON DE DISTRIBUTION CARBURANT (SORTIE DE STOCK)'
                }
              </h2>
            </div>

            {/* Details Table */}
            {isEntree && entry && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 block font-medium">Fournisseur :</span>
                    <span className="font-bold text-slate-900 text-sm">{entry.fournisseur}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Chauffeur Livreur :</span>
                    <span className="font-semibold text-slate-800">{entry.chauffeurLivreur}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Citerne Porteuse / Tracteur :</span>
                    <span className="font-mono-num font-bold text-slate-800">{entry.immatriculationCiterneLivreur}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Citerne Cible Usine :</span>
                    <span className="font-semibold text-slate-800">
                      {targetCiterne ? `${targetCiterne.code} - ${targetCiterne.nom}` : entry.citerneId}
                    </span>
                  </div>
                </div>

                {/* Quantities & Parameters */}
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="p-2">Paramètre Mesuré</th>
                        <th className="p-2 text-right">Valeur</th>
                        <th className="p-2">Conformité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 font-medium">Volume Livré (Température Ambiante)</td>
                        <td className="p-2 text-right font-mono-num font-bold text-sm text-slate-950">
                          {entry.quantiteLivree.toLocaleString('fr-FR')} Litres
                        </td>
                        <td className="p-2 text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Conforme BL
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">Masse Volumique (Densité)</td>
                        <td className="p-2 text-right font-mono-num">{entry.densiteMesuree} kg/L</td>
                        <td className="p-2 text-slate-600">Norme NF EN ISO 3675</td>
                      </tr>
                      <tr>
                        <td className="p-2">Température Produit au Dépotage</td>
                        <td className="p-2 text-right font-mono-num">{entry.temperatureMesuree} °C</td>
                        <td className="p-2 text-slate-600">Compensation standard 15°C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {entry.notes && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-slate-700">
                    <span className="font-semibold block text-[11px] text-amber-900">Observations / Contrôle Scellés :</span>
                    <p className="italic">{entry.notes}</p>
                  </div>
                )}
              </div>
            )}

            {!isEntree && dispense && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 block font-medium">Véhicule / Machine :</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {targetVehicle ? `${targetVehicle.code} (${targetVehicle.marque} ${targetVehicle.modele})` : dispense.vehiculeId}
                    </span>
                    <span className="text-slate-600 block text-[11px]">
                      Immat: {targetVehicle?.immatriculation} • Type: {targetVehicle?.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Citerne Source / Volucompteur :</span>
                    <span className="font-semibold text-slate-800">
                      {targetCiterne ? `${targetCiterne.code} (${targetCiterne.nom})` : dispense.citerneId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Chauffeur / Opérateur Engin :</span>
                    <span className="font-semibold text-slate-800">{dispense.chauffeur}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Pompiste Distributeur :</span>
                    <span className="font-semibold text-slate-800">{dispense.pompiste}</span>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="p-2">Désignation</th>
                        <th className="p-2 text-right">Index / Quantité</th>
                        <th className="p-2">Unité / Analyse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 font-medium">Volume Carburant Pompé</td>
                        <td className="p-2 text-right font-mono-num font-bold text-sm text-slate-950">
                          {dispense.volumeLivre.toLocaleString('fr-FR')} Litres
                        </td>
                        <td className="p-2 text-slate-600">Distribution pistolet étalonné</td>
                      </tr>
                      <tr>
                        <td className="p-2">Compteur Actuel</td>
                        <td className="p-2 text-right font-mono-num">{dispense.compteurActuel.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-slate-600">{targetVehicle?.uniteMesure || 'km'}</td>
                      </tr>
                      <tr>
                        <td className="p-2">Compteur Précédent</td>
                        <td className="p-2 text-right font-mono-num">{dispense.compteurPrecedent.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-slate-600">Delta: +{dispense.deltaCompteur} {targetVehicle?.uniteMesure}</td>
                      </tr>
                      <tr className={dispense.surconsommationAlerte ? 'bg-red-50 text-red-950 font-bold' : ''}>
                        <td className="p-2 font-semibold">Ratio Consommation Calculé</td>
                        <td className="p-2 text-right font-mono-num font-bold">
                          {dispense.ratioConsommation.toFixed(2)} {targetVehicle?.uniteMesure === 'km' ? 'L/100km' : 'L/h'}
                        </td>
                        <td className="p-2">
                          {dispense.surconsommationAlerte ? (
                            <span className="text-red-700 font-bold">ALERTE SURCONSOMMATION</span>
                          ) : (
                            <span className="text-emerald-700">Dans les tolérances usine</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {dispense.remarques && (
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded text-slate-700 text-xs">
                    <span className="font-semibold block text-[11px] text-slate-900">Remarques :</span>
                    <p>{dispense.remarques}</p>
                  </div>
                )}
              </div>
            )}

            {/* Signatures Row */}
            <div className="grid grid-cols-2 gap-6 mt-6 pt-5 border-t-2 border-slate-900 text-xs">
              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  {isEntree ? 'Pour le Fournisseur / Livreur :' : 'Le Chauffeur / Opérateur Engin :'}
                </span>
                <p className="text-[11px] text-slate-500 mb-2">
                  {isEntree ? entry?.chauffeurLivreur : dispense?.chauffeur}
                </p>
                {/* Signature preview */}
                <div className="h-20 border border-slate-300 rounded bg-slate-50 flex items-center justify-center p-2">
                  {(isEntree ? entry?.signatureBase64 : dispense?.signatureChauffeur) ? (
                    <img 
                      src={isEntree ? entry?.signatureBase64 : dispense?.signatureChauffeur} 
                      alt="Signature" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Signature enregistrée</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  Pour l'Usine (Réceptionnaire / Pompiste) :
                </span>
                <p className="text-[11px] text-slate-500 mb-2">
                  {isEntree ? entry?.receptionnaireUsine : dispense?.pompiste}
                </p>
                <div className="h-20 border border-slate-300 rounded bg-slate-50 flex flex-col justify-end p-2 text-right">
                  <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
                    Visa & Tampon Officiel
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Simulation & Legal Notice */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <div className="font-mono-num">
                SYSTEME: HYDROGASOIL v4.2 • REF: {isEntree ? entry?.id : dispense?.id}
              </div>
              <div className="tracking-widest font-mono-num font-bold text-slate-700">
                |||| | ||||| ||| ||||||| || |||||| |
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
