"""
Unit Tests for DAAR Library Search Engine Algorithms
Sorbonne Université - Master Informatique (BM Bui-Xuan)
Utilisé par la pipeline CI/CD (GitHub Actions / GitLab CI)
"""

import math
import pytest
from app.algorithms.kmp import compute_pi_table, kmp_search, kmp_count
from app.algorithms.inverted_index import InvertedIndex, normalize_text, tokenize
from app.algorithms.jaccard_graph import JaccardGraph
from app.algorithms.centrality import compute_pagerank, compute_closeness_centrality, compute_betweenness_centrality


class TestKMPAlgorithm:
    def test_pi_table_computation(self):
        # Pour "ABABCABAB", la table pi doit correspondre aux préfixes-suffixes propres
        pattern = "ABABCABAB"
        pi = compute_pi_table(pattern)
        assert len(pi) == len(pattern)
        assert pi[0] == 0
        assert pi[1] == 0  # 'AB' -> 0
        assert pi[2] == 1  # 'ABA' -> 'A' (1)
        assert pi[3] == 2  # 'ABAB' -> 'AB' (2)

    def test_kmp_exact_search(self):
        text = "Dans les bibliothèques de la Sorbonne, les étudiants étudient à la Sorbonne."
        matches = kmp_search(text, "Sorbonne")
        assert len(matches) == 2
        assert text[matches[0]:matches[0]+8] == "Sorbonne"
        assert text[matches[1]:matches[1]+8] == "Sorbonne"

    def test_kmp_case_insensitive_and_count(self):
        text = "Livre livre LIVRE LiVrE"
        count = kmp_count(text, "livre", case_sensitive=False)
        assert count == 4


class TestInvertedIndex:
    def test_normalization_and_tokenization(self):
        norm = normalize_text("L'Éléphant à la Sorbonne !")
        assert "elephant" in norm
        assert "sorbonne" in norm

        tokens = tokenize("Les algorithmes de recherche à la Sorbonne")
        token_words = [t for t, _ in tokens]
        assert "algorithmes" in token_words
        assert "sorbonne" in token_words

    def test_index_and_search(self):
        index = InvertedIndex()
        index.add_document(1, "La philosophie à la Sorbonne et la liberté de penser.")
        index.add_document(2, "Le voyage et la liberté des explorateurs.")

        # Recherche terme unique
        res_philo = index.search_term("philosophie")
        assert 1 in res_philo
        assert 2 not in res_philo

        # Recherche requête OR
        res_or = index.search_query("liberté Sorbonne", mode="OR")
        assert 1 in res_or
        assert 2 in res_or

        # Recherche requête AND
        res_and = index.search_query("liberté Sorbonne", mode="AND")
        assert 1 in res_and
        assert 2 not in res_and


class TestJaccardAndCentrality:
    def test_jaccard_similarity_calculation(self):
        set_a = {"sorbonne", "livre", "philosophie", "paris"}
        set_b = {"sorbonne", "livre", "science", "mathematiques"}

        # Intersection: {"sorbonne", "livre"} (2)
        # Union: {"sorbonne", "livre", "philosophie", "paris", "science", "mathematiques"} (6)
        # J = 2/6 = 0.3333...
        sim = JaccardGraph.compute_jaccard(set_a, set_b)
        assert pytest.approx(sim, 0.01) == 1.0 / 3.0

    def test_pagerank_and_closeness(self):
        graph = JaccardGraph(threshold=0.1)
        graph.add_edge(1, 2, 0.5)
        graph.add_edge(2, 3, 0.8)
        graph.add_edge(3, 1, 0.4)
        graph.add_edge(3, 4, 0.9)

        # Calcul PageRank
        pr = compute_pagerank(graph, damping_factor=0.85)
        assert len(pr) == 4
        # La somme des probabilités PageRank doit converger vers 1.0
        assert pytest.approx(sum(pr.values()), 0.01) == 1.0

        # Calcul Closeness
        closeness = compute_closeness_centrality(graph)
        assert len(closeness) == 4
        # Le nœud 3 est le plus central car connecté à 1, 2 et 4
        assert closeness[3] >= closeness[4]
