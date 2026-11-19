/**
 * Client API vers le backend FastAPI
 * En production Docker, les requêtes /api sont relayées par Nginx vers backend:8000
 */

const BASE_URL = '/api';

export async function searchBooks(query, type = 'keyword', rankBy = 'pagerank', limit = 20) {
  const params = new URLSearchParams({
    q: query,
    type: type,
    rank_by: rankBy,
    limit: limit.toString()
  });
  const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erreur lors de la recherche');
  }
  return res.json();
}

export async function getSuggestTerms(prefix) {
  if (!prefix || prefix.length < 1) return [];
  const res = await fetch(`${BASE_URL}/search/suggest-terms?prefix=${encodeURIComponent(prefix)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

export async function getBookDetail(bookId) {
  const res = await fetch(`${BASE_URL}/books/${bookId}`);
  if (!res.ok) throw new Error('Impossible de charger les détails du livre');
  return res.json();
}

export async function getBookContent(bookId) {
  const res = await fetch(`${BASE_URL}/books/${bookId}/content`);
  if (!res.ok) throw new Error('Impossible de charger le texte du livre');
  return res.json();
}

export async function getGraphData(centerBookId = null, maxNodes = 60) {
  let url = `${BASE_URL}/graph?max_nodes=${maxNodes}`;
  if (centerBookId) url += `&center_book_id=${centerBookId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors du chargement du graphe');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des statistiques');
  return res.json();
}

export async function runBenchmark(pattern = 'philosophie', sampleSize = 50) {
  const res = await fetch(`${BASE_URL}/stats/benchmark?pattern=${encodeURIComponent(pattern)}&sample_size=${sampleSize}`);
  if (!res.ok) throw new Error('Erreur lors de l\'exécution du benchmark');
  return res.json();
}
