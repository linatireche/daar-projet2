import React from 'react';

export default function BookCard({ item, onOpenReader, onInspectGraph }) {
  const { book, occurrences, score_tfidf, final_score, snippets } = item;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-rose-100 flex flex-col justify-between transition-all group">
      
      <div>
        {/* En-tête : Genre & Métriques de centralité */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
            {book.genre}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700" title="Score PageRank sur graphe de Jaccard">
              PR: {Number(book.pagerank).toFixed(5)}
            </span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700" title="Indice de proximité Closeness">
              C: {Number(book.closeness).toFixed(3)}
            </span>
          </div>
        </div>

        {/* Titre et Auteur */}
        <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
          <span className="font-medium text-slate-700">{book.author}</span>
          <span>•</span>
          <span>{book.year}</span>
          <span>•</span>
          <span className="text-rose-600 font-semibold">{book.word_count.toLocaleString()} mots</span>
        </p>

        {/* Extrait de texte avec contexte */}
        <div className="bg-parchment-50 rounded-xl p-3 border border-rose-100/70 mb-4 text-xs text-slate-600 leading-relaxed italic line-clamp-3">
          {snippets && snippets.length > 0 ? (
            <span>"{snippets[0]}"</span>
          ) : (
            <span>"{book.summary}"</span>
          )}
        </div>
      </div>

      {/* Pied de carte : badges d'occurrences et boutons d'action */}
      <div className="pt-3 border-t border-rose-100/60 flex items-center justify-between">
        
        {/* Nombre d'occurrences et score */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100/70 text-rose-800 text-xs font-semibold">
            <span>🔍</span>
            <span>{occurrences} occ.</span>
          </span>
          <span className="text-[11px] text-slate-400" title="Score TF-IDF">
            TF-IDF: {score_tfidf}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onInspectGraph(book.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Visualiser dans le graphe de Jaccard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <button
            onClick={() => onOpenReader(book.id)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-semibold border border-rose-200 hover:border-transparent transition-all shadow-sm"
          >
            Lire
          </button>
        </div>

      </div>

    </div>
  );
}
