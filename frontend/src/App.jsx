import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import BookReaderModal from './components/BookReaderModal';
import JaccardGraphView from './components/JaccardGraphView';
import AlgorithmBenchmark from './components/AlgorithmBenchmark';
import StatsCard from './components/StatsCard';
import { searchBooks, getStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [stats, setStats] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Modales et navigations croisées
  const [readerBookId, setReaderBookId] = useState(null);
  const [selectedGraphBookId, setSelectedGraphBookId] = useState(null);

  // Chargement des statistiques globales au montage
  useEffect(() => {
    getStats()
      .then(data => {
        setStats(data);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des stats:", err);
      });
  }, []);

  // Déclencheur de recherche
  const handleSearch = async (query, type, rankBy) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const data = await searchBooks(query, type, rankBy, 24);
      setSearchResults(data);
      if (activeTab !== 'search') {
        setActiveTab('search');
      }
    } catch (err) {
      setSearchError(err.message || "Une erreur est survenue lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInspectGraph = (bookId) => {
    setSelectedGraphBookId(bookId);
    setActiveTab('graph');
  };

  const handleOpenReader = (bookId) => {
    setReaderBookId(bookId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barre de navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Onglet 1 : Moteur de Recherche */}
        {activeTab === 'search' && (
          <div className="space-y-10">
            
            {/* Titre & Bannière de recherche - Confort visuel & Teinte Rose Douce */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-700 bg-rose-100/70 px-3.5 py-1 rounded-full border border-rose-200">
                Sorbonne Université • Master Informatique
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-5xl text-slate-900 leading-tight">
                Moteur de Recherche de <span className="text-rose-600 italic">Bibliothèque</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl mx-auto">
                Explorez plus de <strong>1 664 livres</strong> (&gt; 10 000 mots chacun) indexés en temps réel avec algorithme KMP, RegEx et classement par <strong>PageRank</strong> sur le graphe de similarité de Jaccard.
              </p>
            </div>

            {/* Barre de recherche */}
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />

            {/* Erreur éventuelle */}
            {searchError && (
              <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm text-center">
                {searchError}
              </div>
            )}

            {/* Suggestions implicites de lecture (voisins du graphe de Jaccard) */}
            {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
              <div className="glass-card rounded-2xl p-5 border border-rose-200/60 bg-gradient-to-r from-rose-50/50 via-white to-rose-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">✨</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                    Suggestions Implicites (Voisins les plus proches dans le graphe de Jaccard) :
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {searchResults.suggestions.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleOpenReader(b.id)}
                      className="p-3 bg-white hover:bg-rose-50/80 rounded-xl border border-rose-100 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-rose-600 font-semibold">{b.genre}</span>
                        <h4 className="font-serif font-bold text-xs text-slate-800 line-clamp-1">{b.title}</h4>
                        <p className="text-[11px] text-slate-500">{b.author}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-rose-50 flex justify-between text-[10px] text-slate-400">
                        <span>PR: {Number(b.pagerank).toFixed(4)}</span>
                        <span className="text-rose-600 font-medium">Lire &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats de recherche */}
            {searchResults && (
              <div className="space-y-6">
                
                {/* Résumé des résultats */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xl text-slate-900">
                      Résultats pour "{searchResults.query}"
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      {searchResults.total_results} livres trouvés
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      Temps : <strong className="font-mono text-slate-800">{searchResults.execution_time_ms} ms</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Classement : <strong className="text-rose-700 capitalize">{searchResults.ranking_metric}</strong>
                    </span>
                  </div>
                </div>

                {/* Grille de cartes de livres */}
                {searchResults.results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.results.map((item) => (
                      <BookCard
                        key={item.book.id}
                        item={item}
                        onOpenReader={handleOpenReader}
                        onInspectGraph={handleInspectGraph}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <p className="text-lg font-serif">Aucun document ne correspond à ce critère.</p>
                    <p className="text-xs">Essayez un autre mot-clef comme "philosophie", "liberté", "science" ou une RegEx.</p>
                  </div>
                )}

              </div>
            )}

            {/* Vue d'accueil si aucune recherche n'a encore été effectuée */}
            {!searchResults && stats && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Ouvrages Remarquables de la Bibliothèque (Top PageRank)
                  </h3>
                  <span className="text-xs text-rose-600 font-medium">
                    Calculés selon l'algorithme de centralité
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.top_pagerank_books.slice(0, 6).map((b) => (
                    <div
                      key={b.id}
                      className="glass-card glass-card-hover rounded-2xl p-5 border border-rose-100 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {b.genre}
                          </span>
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            PR: {Number(b.pagerank).toFixed(5)}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-slate-900 line-clamp-1">{b.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">{b.author} • {b.word_count.toLocaleString()} mots</p>
                        <p className="text-xs text-slate-600 line-clamp-2 italic bg-parchment-50 p-2.5 rounded-xl border border-rose-100/50">
                          "{b.summary}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
                        <button
                          onClick={() => handleInspectGraph(b.id)}
                          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                        >
                          <span>Graphe</span> &rarr;
                        </button>
                        <button
                          onClick={() => handleOpenReader(b.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg text-xs font-semibold transition-all border border-rose-200"
                        >
                          Lire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Onglet 2 : Graphe de Jaccard */}
        {activeTab === 'graph' && (
          <JaccardGraphView
            selectedBookId={selectedGraphBookId}
            onSelectBook={handleOpenReader}
          />
        )}

        {/* Onglet 3 : Benchmark DAAR */}
        {activeTab === 'benchmark' && (
          <AlgorithmBenchmark />
        )}

        {/* Onglet 4 : Statistiques Globales */}
        {activeTab === 'stats' && (
          <StatsCard stats={stats} onSelectBook={handleOpenReader} />
        )}

      </main>

      {/* Lecteur de livre plein écran modal */}
      {readerBookId && (
        <BookReaderModal
          bookId={readerBookId}
          query={searchResults?.query || ''}
          onClose={() => setReaderBookId(null)}
        />
      )}

      {/* Pied de page élégant */}
      <footer className="mt-auto border-t border-rose-100 bg-white/70 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
          <p className="font-serif font-medium text-slate-700">
            Sorbonne Université • Master Informatique • UE DAAR (Données, Algorithmes et Apprentissage)
          </p>
          <p>
            Projet 2 Webapp : Moteur de recherche d'une bibliothèque • Architecture multi-conteneurs Docker (Frontend, Backend FastAPI, PostgreSQL, Réseau Dédié)
          </p>
        </div>
      </footer>

    </div>
  );
}
