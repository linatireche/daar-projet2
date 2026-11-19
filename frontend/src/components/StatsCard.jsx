import React from 'react';

export default function StatsCard({ stats, onSelectBook }) {
  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Grille des 4 indicateurs clés DAAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Livres totaux */}
        <div className="glass-card rounded-2xl p-5 border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Taille Bibliothèque
            </span>
            <span className="font-serif font-bold text-2xl text-slate-900 mt-1 block">
              {stats.total_books.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              ✓ Requis : &ge; 1664 livres
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-xl text-rose-600">
            📚
          </div>
        </div>

        {/* Mots moyens par livre */}
        <div className="glass-card rounded-2xl p-5 border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Mots Moyens / Livre
            </span>
            <span className="font-serif font-bold text-2xl text-slate-900 mt-1 block">
              {Math.round(stats.avg_words_per_book).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              ✓ Requis : &ge; 10 000 mots
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-xl text-rose-600">
            📝
          </div>
        </div>

        {/* Taille du Vocabulaire */}
        <div className="glass-card rounded-2xl p-5 border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Vocabulaire Indexé
            </span>
            <span className="font-serif font-bold text-2xl text-slate-900 mt-1 block">
              {stats.vocabulary_size.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Termes distincts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-xl text-rose-600">
            🔤
          </div>
        </div>

        {/* Arêtes Graphe Jaccard */}
        <div className="glass-card rounded-2xl p-5 border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Arêtes Jaccard
            </span>
            <span className="font-serif font-bold text-2xl text-slate-900 mt-1 block">
              {stats.graph_edges_count.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Connexions calculées
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-xl text-rose-600">
            🕸️
          </div>
        </div>

      </div>

      {/* Tableau des Livres à plus fort PageRank */}
      <div className="glass-card rounded-3xl p-6 border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block">
              Classement Implicite par Centralité
            </span>
            <h3 className="font-serif font-bold text-xl text-slate-900">
              Top Livres par Indice de PageRank sur le Graphe de Jaccard
            </h3>
          </div>
          <span className="text-xs text-slate-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Algorithme de Puissance Iterative
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-rose-100 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Rang</th>
                <th className="py-3 px-4 font-semibold">Titre</th>
                <th className="py-3 px-4 font-semibold">Auteur</th>
                <th className="py-3 px-4 font-semibold">Genre</th>
                <th className="py-3 px-4 font-semibold">Nombre de mots</th>
                <th className="py-3 px-4 font-semibold">PageRank</th>
                <th className="py-3 px-4 font-semibold">Closeness</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-slate-700">
              {stats.top_pagerank_books.map((b, idx) => (
                <tr key={b.id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-rose-600">#{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{b.title}</td>
                  <td className="py-3 px-4 text-slate-600">{b.author}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                      {b.genre}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{b.word_count.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-700">{Number(b.pagerank).toFixed(6)}</td>
                  <td className="py-3 px-4 font-mono">{Number(b.closeness).toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectBook(b.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                    >
                      Consulter &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
