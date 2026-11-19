import React, { useState, useEffect } from 'react';
import { getBookContent } from '../services/api';

export default function BookReaderModal({ bookId, query, onClose }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState('text-base');

  useEffect(() => {
    if (!bookId) return;
    setIsLoading(true);
    getBookContent(bookId)
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [bookId]);

  // Fonction pour surligner les occurrences du terme recherché dans le texte
  const renderHighlightedContent = (text, highlight) => {
    if (!highlight || !text) return text;
    try {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          part
        )
      );
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-rose-100 overflow-hidden">
        
        {/* En-tête du lecteur */}
        <div className="p-5 sm:px-8 border-b border-rose-100 flex items-center justify-between bg-parchment-50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block">
              Lecteur de Bibliothèque • Sorbonne Université
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
              {data?.title || 'Chargement du document...'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Par {data?.author} • {data?.word_count?.toLocaleString()} mots
            </p>
          </div>

          {/* Outils de lecture & Fermeture */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-rose-200 p-1 text-xs">
              <button
                onClick={() => setFontSize('text-sm')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-sm' ? 'bg-rose-100 font-bold text-rose-800' : 'text-slate-600'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('text-base')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-base' ? 'bg-rose-100 font-bold text-rose-800' : 'text-slate-600'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('text-lg')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-lg' ? 'bg-rose-100 font-bold text-rose-800' : 'text-slate-600'}`}
              >
                A+
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-rose-100/60 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corps du texte - Style typographique confortable pour la lecture */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-parchment-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="animate-spin h-8 w-8 text-rose-600 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-sm">Chargement du texte intégral...</p>
            </div>
          ) : (
            <div className={`font-serif text-slate-800 leading-relaxed whitespace-pre-line max-w-2xl mx-auto ${fontSize}`}>
              {renderHighlightedContent(data?.content, query)}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-8 py-3 bg-white border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
          <span>Taille minimale respectée (&gt; 10 000 mots par livre)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors"
          >
            Fermer la lecture
          </button>
        </div>

      </div>
    </div>
  );
}
