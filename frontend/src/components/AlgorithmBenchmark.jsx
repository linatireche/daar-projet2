import React, { useState } from 'react';
import { runBenchmark } from '../services/api';

export default function AlgorithmBenchmark() {
  const [pattern, setPattern] = useState('philosophie');
  const [sampleSize, setSampleSize] = useState(50);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async (e) => {
    e?.preventDefault();
    if (!pattern.trim()) return;
    setIsLoading(true);
    try {
      const data = await runBenchmark(pattern.trim(), sampleSize);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* En-tête */}
      <div className="glass-card rounded-3xl p-6 border border-rose-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block">
          Évaluation Expérimentale DAAR • Projet 2
        </span>
        <h2 className="font-serif font-bold text-2xl text-slate-900">
          Banc d'Essai & Benchmark des Algorithmes
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl mt-1 leading-relaxed">
          Comparaison directe des performances temporelles d'exécution entre la recherche par <strong>Index Inversé O(1)</strong>, 
          l'algorithme exact de <strong>Knuth-Morris-Pratt (KMP) O(N + M)</strong> et le moteur d'<strong>Expressions Régulières (RegEx)</strong> 
          sur un sous-ensemble de livres de la bibliothèque.
        </p>

        {/* Formulaire de test */}
        <form onSubmit={handleRun} className="mt-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Mot-motif à tester (ex: sorbonne, liberte, algorithme)..."
            className="flex-1 min-w-[220px] bg-white border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          />

          <div className="flex items-center gap-2 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-600">
            <span>Échantillon :</span>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="bg-transparent font-semibold text-rose-700 focus:outline-none"
            >
              <option value={20}>20 livres</option>
              <option value={50}>50 livres</option>
              <option value={100}>100 livres</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-200 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Mesure en cours...</span>
              </>
            ) : (
              <span>Lancer le Test</span>
            )}
          </button>
        </form>
      </div>

      {/* Résultats du Benchmark */}
      {result && (
        <div className="glass-card rounded-3xl p-6 border border-rose-100 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-100 pb-4">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Résultats de la mesure pour le motif "{result.pattern}" ({result.scanned_books_count} livres scannés)
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              {result.matches_found} occurrences détectées
            </span>
          </div>

          {/* Diagramme bâton de comparaison visuelle */}
          <div className="space-y-4">
            {/* Index Inversé */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">1. Table d'Indexage Inversé (Lookup direct)</span>
                <span className="font-mono text-emerald-600">{result.index_time_ms} ms</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                  style={{ width: `${Math.max(5, Math.min(100, (result.index_time_ms / Math.max(result.kmp_time_ms, result.regex_time_ms, 1)) * 100))}%` }}
                >
                  O(1)
                </div>
              </div>
            </div>

            {/* RegEx Index */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">2. Moteur RegEx sur Vocabulaire Indexé</span>
                <span className="font-mono text-amber-600">{result.regex_time_ms} ms</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-amber-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                  style={{ width: `${Math.max(5, Math.min(100, (result.regex_time_ms / Math.max(result.kmp_time_ms, 1)) * 100))}%` }}
                >
                  O(|V|)
                </div>
              </div>
            </div>

            {/* KMP Texte Intégral */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">3. Algorithme KMP (Scan complet séquentiel sur texte intégral)</span>
                <span className="font-mono text-rose-600">{result.kmp_time_ms} ms</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-rose-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                  style={{ width: '100%' }}
                >
                  O(N + M)
                </div>
              </div>
            </div>
          </div>

          {/* Synthèse théorique pour le rapport de projet */}
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/70 text-xs text-slate-700 space-y-2">
            <span className="font-bold text-rose-800 block">💡 Interprétation théorique (Rapport DAAR) :</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Index Inversé :</strong> Temps quasi-instantané (&lt; 2 ms) car les listes d'occurrences sont pré-calculées dans une table de hachage.</li>
              <li><strong>Algorithme KMP :</strong> Nécessite le calcul de la table de préfixes π en O(M) puis le parcours complet de N caractères. Idéal pour la recherche exacte dans un nouveau texte non-indexé.</li>
              <li><strong>Recherche RegEx :</strong> L'approche hybride opérant sur le vocabulaire évite le coût prohibitif d'un automate sur l'intégralité du corpus.</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
