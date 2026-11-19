"""
Graphe de Similarité de Jaccard
Sorbonne Université - DAAR Project 2

Construction et exploitation du graphe de Jaccard entre les livres :
J(A, B) = |W_A ∩ W_B| / |W_A ∪ W_B|
où W_A et W_B représentent les ensembles de mots caractéristiques de chaque livre.
"""

from collections import defaultdict
from typing import Dict, List, Set, Tuple
import math


class JaccardGraph:
    def __init__(self, threshold: float = 0.15, top_k_neighbors: int = 6):
        self.threshold = threshold
        self.top_k_neighbors = top_k_neighbors
        # Adjacency list: doc_id -> { neighbor_doc_id: similarity_weight }
        self.adj: Dict[int, Dict[int, float]] = defaultdict(dict)
        # Vocabulary sets per doc: doc_id -> Set[str]
        self.doc_vocabularies: Dict[int, Set[str]] = {}
        # Node set
        self.nodes: Set[int] = set()

    def add_document_vocabulary(self, doc_id: int, word_set: Set[str]):
        """Ajoute l'ensemble de mots représentatifs d'un livre."""
        self.doc_vocabularies[doc_id] = word_set
        self.nodes.add(doc_id)

    @staticmethod
    def compute_jaccard(set_a: Set[str], set_b: Set[str]) -> float:
        """
        Calcule la similarité de Jaccard entre deux ensembles.
        J(A, B) = |A ∩ B| / |A ∪ B|
        """
        if not set_a or not set_b:
            return 0.0
        intersection_size = len(set_a.intersection(set_b))
        if intersection_size == 0:
            return 0.0
        union_size = len(set_a.union(set_b))
        return intersection_size / union_size

    def build_graph(self):
        """
        Construit le graphe de Jaccard.
        Optimisation : Utilise un index inversé terme -> [doc_ids] pour ne comparer
        que les documents partageant au moins un mot commun, au lieu d'un parcours O(N^2) aveugle.
        """
        # Création de l'index inversé léger pour le graphe
        term_to_docs = defaultdict(list)
        for doc_id, vocab in self.doc_vocabularies.items():
            for word in vocab:
                term_to_docs[word].append(doc_id)

        # Calcul des similarités pour les paires candidates
        pair_intersections = defaultdict(int)
        for word, doc_list in term_to_docs.items():
            if len(doc_list) > 1:
                # Échantillonnage si le mot est trop fréquent (stop-word)
                if len(doc_list) > 300:
                    continue
                for i in range(len(doc_list)):
                    for j in range(i + 1, len(doc_list)):
                        u, v = doc_list[i], doc_list[j]
                        pair = (u, v) if u < v else (v, u)
                        pair_intersections[pair] += 1

        # Construction des arêtes
        for (u, v), inter_size in pair_intersections.items():
            len_u = len(self.doc_vocabularies[u])
            len_v = len(self.doc_vocabularies[v])
            union_size = len_u + len_v - inter_size
            if union_size > 0:
                sim = inter_size / union_size
                if sim >= self.threshold:
                    self.add_edge(u, v, sim)

        # Assurer que chaque sommet a au moins un certain nombre de voisins (k-plus proches voisins)
        # pour éviter les sommets isolés dans l'évaluation des centralités
        all_doc_ids = list(self.nodes)
        for u in all_doc_ids:
            if len(self.adj[u]) < self.top_k_neighbors:
                # Trouver les meilleurs candidats pour u
                candidates = []
                set_u = self.doc_vocabularies.get(u, set())
                # Échantillon de documents pour connecter
                step = max(1, len(all_doc_ids) // 60)
                for v in all_doc_ids[::step]:
                    if u != v and v not in self.adj[u]:
                        set_v = self.doc_vocabularies.get(v, set())
                        sim = self.compute_jaccard(set_u, set_v)
                        if sim > 0:
                            candidates.append((v, sim))
                candidates.sort(key=lambda x: x[1], reverse=True)
                for v, sim in candidates[:self.top_k_neighbors - len(self.adj[u])]:
                    self.add_edge(u, v, max(sim, 0.05))

    def add_edge(self, u: int, v: int, weight: float):
        """Ajoute une arête non-orientée pondérée entre u et v."""
        self.adj[u][v] = weight
        self.adj[v][u] = weight
        self.nodes.add(u)
        self.nodes.add(v)

    def get_neighbors(self, doc_id: int) -> Dict[int, float]:
        """Retourne les voisins d'un livre avec le poids de similarité."""
        return self.adj.get(doc_id, {})

    def get_suggestions(self, top_doc_ids: List[int], max_suggestions: int = 5) -> List[Tuple[int, float]]:
        """
        Génère les suggestions implicites basées sur les voisins des documents les plus pertinents.
        Retourne une liste de (doc_id, score_pertinence_voisin).
        """
        suggestion_scores = defaultdict(float)
        exclude_set = set(top_doc_ids)

        for rank_weight, doc_id in enumerate(top_doc_ids[:3]):
            factor = 1.0 / (rank_weight + 1)  # Décroissance selon le rang
            for neighbor_id, similarity in self.adj.get(doc_id, {}).items():
                if neighbor_id not in exclude_set:
                    suggestion_scores[neighbor_id] += similarity * factor

        sorted_suggestions = sorted(suggestion_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_suggestions[:max_suggestions]
