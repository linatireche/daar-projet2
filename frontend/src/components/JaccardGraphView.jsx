import React, { useState, useEffect, useRef } from 'react';
import { getGraphData } from '../services/api';

export default function JaccardGraphView({ selectedBookId, onSelectBook }) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [minSim, setMinSim] = useState(0.12);
  const [nodePositions, setNodePositions] = useState({});

  useEffect(() => {
    setIsLoading(true);
    getGraphData(selectedBookId, 50)
      .then(data => {
        setGraph(data);
        // Calcul d'une disposition circulaire/force simple pour les nœuds
        const positions = {};
        const count = data.nodes.length;
        const centerX = 400;
        const centerY = 280;
        const radius = Math.min(centerX, centerY) - 70;

        data.nodes.forEach((node, idx) => {
          // Si c'est le livre central, on le place au milieu
          if (selectedBookId && node.id === selectedBookId) {
            positions[node.id] = { x: centerX, y: centerY };
          } else {
            const angle = (idx / count) * 2 * Math.PI;
            // Rayon varié pour un rendu plus naturel en constellation
            const r = radius * (0.65 + (idx % 3) * 0.16);
            positions[node.id] = {
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle)
            };
          }
        });
        setNodePositions(positions);
        setIsLoading(false);

        if (selectedBookId) {
          const found = data.nodes.find(n => n.id === selectedBookId);
          if (found) setSelectedNode(found);
        }
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [selectedBookId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* En-tête explicatif DAAR */}
      <div className="glass-card rounded-3xl p-6 border border-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block">
            Algorithmique DAAR • Graphe de Jaccard
          </span>
          <h2 className="font-serif font-bold text-2xl text-slate-900">
            Topologie du Graphe de Similarité
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Les arêtes représentent la similarité de Jaccard <code className="bg-rose-50 px-1 py-0.5 rounded text-rose-800 font-mono">J(A, B) = |W_A ∩ W_B| / |W_A ∪ W_B|</code> entre les ensembles de vocabulaire des livres. Les scores de centralité (PageRank, Closeness) sont dérivés de ce réseau.
          </p>
        </div>

        {/* Statistiques rapides du graphe affiché */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-rose-100 shadow-sm text-xs">
          <div>
            <span className="text-slate-400 block">Sommets</span>
            <span className="font-bold text-slate-800 text-sm">{graph.nodes.length}</span>
          </div>
          <div className="h-6 w-px bg-rose-100"></div>
          <div>
            <span className="text-slate-400 block">Arêtes</span>
            <span className="font-bold text-slate-800 text-sm">{graph.edges.length}</span>
          </div>
        </div>
      </div>

      {/* Zone du graphe interactif et panneau de détails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vue SVG du graphe */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-4 border border-rose-100 overflow-hidden relative min-h-[580px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <svg className="animate-spin h-8 w-8 text-rose-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span className="text-xs">Génération de la topologie du graphe...</span>
            </div>
          ) : (
            <svg viewBox="0 0 800 560" className="w-full h-auto cursor-grab active:cursor-grabbing select-none">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Rendu des arêtes (Jaccard edges) */}
              {graph.edges.map((edge, idx) => {
                const src = nodePositions[edge.source];
                const dst = nodePositions[edge.target];
                if (!src || !dst) return null;

                const isConnectedToSelected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

                return (
                  <line
                    key={idx}
                    x1={src.x}
                    y1={src.y}
                    x2={dst.x}
                    y2={dst.y}
                    stroke={isConnectedToSelected ? "#E11D48" : "url(#edgeGrad)"}
                    strokeWidth={isConnectedToSelected ? 2.5 : Math.max(1, edge.weight * 5)}
                    strokeOpacity={isConnectedToSelected ? 0.9 : 0.4}
                  />
                );
              })}

              {/* Rendu des nœuds (Books) */}
              {graph.nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isSelected = selectedNode?.id === node.id;
                // Rayon proportionnel au PageRank
                const radius = 9 + Math.min(node.pagerank * 4500, 16);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    <circle
                      r={radius + 3}
                      fill={isSelected ? "#FFE4E6" : "transparent"}
                      className="transition-all"
                    />
                    <circle
                      r={radius}
                      fill={isSelected ? "#E11D48" : "#0B1D3A"}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="shadow-md"
                    />
                    {/* Label court */}
                    <text
                      y={radius + 13}
                      textAnchor="middle"
                      className="text-[9px] font-sans font-medium fill-slate-700 pointer-events-none"
                    >
                      {node.label.length > 15 ? node.label.slice(0, 13) + '..' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Légende en bas à gauche */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-rose-100 text-[11px] space-y-1 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span>
              <span className="text-slate-600">Livre (taille ∝ PageRank)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span className="text-slate-600">Livre sélectionné</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-rose-300"></span>
              <span className="text-slate-600">Arête Jaccard (épaisseur ∝ J)</span>
            </div>
          </div>
        </div>

        {/* Détails du nœud sélectionné */}
        <div className="glass-card rounded-3xl p-6 border border-rose-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block mb-2">
              Analyse Algorithmique du Sommet
            </span>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 leading-tight">
                    {selectedNode.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Auteur : <span className="text-slate-800 font-medium">{selectedNode.author}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Longueur : <span className="text-rose-600 font-semibold">{selectedNode.word_count.toLocaleString()} mots</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-rose-100">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Indices de Centralité calculés :
                  </span>

                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">PageRank :</span>
                      <span className="font-mono font-bold text-rose-700">
                        {Number(selectedNode.pagerank).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Closeness :</span>
                      <span className="font-mono font-bold text-slate-800">
                        {Number(selectedNode.closeness).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Betweenness :</span>
                      <span className="font-mono font-bold text-slate-800">
                        {Number(selectedNode.betweenness).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voisins directs dans le graphe */}
                <div className="pt-2 border-t border-rose-100">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Voisins de similarité (Recommandations Jaccard) :
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {graph.edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e, i) => {
                        const neighborId = e.source === selectedNode.id ? e.target : e.source;
                        const neighbor = graph.nodes.find(n => n.id === neighborId);
                        if (!neighbor) return null;
                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedNode(neighbor)}
                            className="p-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-100/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="text-slate-800 font-medium truncate max-w-[140px]">{neighbor.label}</span>
                            <span className="text-rose-600 font-mono text-[11px] font-semibold">J = {e.weight}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Cliquez sur un sommet du graphe pour inspecter ses scores de centralité et ses arêtes de similarité de Jaccard.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-rose-100 text-[11px] text-slate-400">
            Conforme aux exigences DAAR de BM Bui-Xuan.
          </div>

        </div>

      </div>

    </div>
  );
}
