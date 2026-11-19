import React, { useState, useEffect, useRef } from 'react';
import { getSuggestTerms } from '../services/api';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('keyword'); // 'keyword', 'kmp', 'regex'
  const [rankBy, setRankBy] = useState('pagerank');       // 'pagerank', 'closeness', 'betweenness', 'occurrences', 'tfidf'
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef(null);

  // Recherche d'auto-complétion lors de la frappe
  useEffect(() => {
    if (searchType === 'keyword' && query.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const list = await getSuggestTerms(query.trim());
          setSuggestions(list);
          setShowSuggestions(list.length > 0);
        } catch (e) {
          setSuggestions([]);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchType]);

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      onSearch(query.trim(), searchType, rankBy);
    }
  };

  const handleSelectSuggestion = (term) => {
    setQuery(term);
    setShowSuggestions(false);
    onSearch(term, searchType, rankBy);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Conteneur principal de recherche avec glassmorphism doux */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-rose-100/50 border border-rose-200/80 p-2 transition-all focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
          
          {/* Icône de recherche */}
          <div className="pl-3 pr-2 text-rose-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Champ texte */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === 'regex'
                ? "Entrez une RegEx (ex: philosoph.*|sorbon.*|h[eé]ros)"
                : searchType === 'kmp'
                ? "Recherche de sous-chaîne exacte par algorithme KMP..."
                : "Recherchez un mot-clef (ex: sorbonne, liberté, voyage, philosophie)..."
            }
            className="flex-1 px-3 py-3 text-slate-800 placeholder-slate-400 text-base md:text-lg bg-transparent focus:outline-none"
          />

          {/* Bouton d'effacement rapide */}
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Bouton Lancer la recherche */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200 transition-all"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              <span>Chercher</span>
            )}
          </button>
        </div>

        {/* Menu déroulant des suggestions d'auto-complétion */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionBoxRef}
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-rose-100 overflow-hidden z-50 divide-y divide-rose-50"
          >
            {suggestions.map((term, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(term)}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-rose-50 cursor-pointer text-slate-700 hover:text-rose-700 text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 text-xs">📖</span>
                  <span>{term}</span>
                </div>
                <span className="text-[11px] text-slate-400">suggestion</span>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Barres d'options : Type de recherche & Métrique de classement */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-2">
        
        {/* Type de recherche */}
        <div className="flex items-center gap-1.5 bg-rose-50/70 p-1 rounded-xl border border-rose-200/60">
          <span className="text-xs font-semibold text-rose-800 px-2">Type :</span>
          <button
            type="button"
            onClick={() => setSearchType('keyword')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              searchType === 'keyword'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Mot-clé (Index)
          </button>
          <button
            type="button"
            onClick={() => setSearchType('kmp')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              searchType === 'kmp'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            KMP Explicite
          </button>
          <button
            type="button"
            onClick={() => setSearchType('regex')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              searchType === 'regex'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            RegEx Avancée
          </button>
        </div>

        {/* Critère de classement imposé par le projet DAAR */}
        <div className="flex items-center gap-2">
          <label htmlFor="ranking-select" className="text-xs font-medium text-slate-600">
            Tri par :
          </label>
          <select
            id="ranking-select"
            value={rankBy}
            onChange={(e) => {
              setRankBy(e.target.value);
              if (query.trim()) {
                onSearch(query.trim(), searchType, e.target.value);
              }
            }}
            className="text-xs bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="pagerank">🏆 PageRank (Graphe Jaccard)</option>
            <option value="closeness">📍 Closeness Centrality</option>
            <option value="betweenness">🔄 Betweenness Centrality</option>
            <option value="occurrences">🔢 Nombre d'occurrences</option>
            <option value="tfidf">📊 Score TF-IDF</option>
            <option value="hybrid">✨ Score Hybride (PR + TF-IDF)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
