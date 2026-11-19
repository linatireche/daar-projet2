import React from 'react';
import SorbonneLogo from './SorbonneLogo';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Sorbonne Université & Titre */}
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => setActiveTab('search')}>
            <SorbonneLogo />
            <div className="hidden lg:block border-l border-rose-200 pl-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block">
                Projet 2 Webapp DAAR
              </span>
              <span className="text-sm font-serif font-bold text-slate-800">
                Bibliothèque & Moteur de Recherche
              </span>
            </div>
          </div>

          {/* Onglets de navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              Recherche
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'graph'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              Graphe de Jaccard
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              Benchmark DAAR
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              Statistiques
            </button>
          </nav>

          {/* Badge rapide */}
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
              {stats?.total_books ? `${stats.total_books} livres` : '1665 livres'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
