"""
Algorithmes de Calcul de Centralité sur le Graphe de Jaccard
Sorbonne Université - DAAR Project 2

Implémente les trois indices de centralité vus en cours :
1. PageRank (Algorithme itératif de marche aléatoire avec téléportation)
2. Closeness Centrality (Centralité de proximité via plus courts chemins)
3. Betweenness Centrality (Centralité d'intermédiarité via l'algorithme de Brandes)
"""

from collections import deque, defaultdict
import math
from typing import Dict, List, Set, Tuple
from app.algorithms.jaccard_graph import JaccardGraph


def compute_pagerank(
    graph: JaccardGraph,
    damping_factor: float = 0.85,
    max_iter: int = 100,
    tol: float = 1e-6
) -> Dict[int, float]:
    """
    Calcule l'indice de PageRank pour chaque nœud du graphe de Jaccard.
    PR(u) = (1 - d) / N + d * sum_{v in In(u)} (PR(v) * W(v, u) / sum_w W(v, w))
    
    Complexité: O(max_iter * (|V| + |E|))
    """
    nodes = list(graph.nodes)
    n = len(nodes)
    if n == 0:
        return {}

    # Initialisation uniforme
    pr = {node: 1.0 / n for node in nodes}
    
    # Pré-calcul de la somme des poids sortants pour chaque nœud
    out_weights = {}
    for u in nodes:
        total = sum(graph.adj[u].values())
        out_weights[u] = total

    base_teleport = (1.0 - damping_factor) / n

    for iteration in range(max_iter):
        next_pr = {node: base_teleport for node in nodes}
        dangling_sum = 0.0

        for u in nodes:
            total_out = out_weights[u]
            if total_out == 0:
                dangling_sum += pr[u]
            else:
                for v, weight in graph.adj[u].items():
                    # Contribution pondérée
                    contribution = damping_factor * (pr[u] * (weight / total_out))
                    next_pr[v] += contribution

        # Redistribution de la masse des nœuds puits (dangling nodes)
        dangling_share = (damping_factor * dangling_sum) / n
        for node in nodes:
            next_pr[node] += dangling_share

        # Vérification de la convergence L1
        diff = sum(abs(next_pr[node] - pr[node]) for node in nodes)
        pr = next_pr

        if diff < tol:
            break

    return pr


def compute_closeness_centrality(
    graph: JaccardGraph,
    max_samples: int = None
) -> Dict[int, float]:
    """
    Calcule la centralité de proximité (Closeness Centrality).
    C(u) = (N - 1) / sum_{v != u} dist(u, v)
    
    Utilise un parcours en largeur (BFS) pour trouver les distances les plus courtes.
    Si le graphe n'est pas totalement connexe, utilise la correction de Wasserman & Faust.
    """
    nodes = list(graph.nodes)
    n = len(nodes)
    if n <= 1:
        return {node: 1.0 for node in nodes}

    closeness = {}
    target_nodes = nodes[:max_samples] if max_samples else nodes

    for source in target_nodes:
        # BFS pour plus court chemin non-pondéré (en nombre de sauts)
        visited = {source: 0}
        queue = deque([source])

        while queue:
            curr = queue.popleft()
            curr_dist = visited[curr]

            for neighbor in graph.adj[curr].keys():
                if neighbor not in visited:
                    visited[neighbor] = curr_dist + 1
                    queue.append(neighbor)

        # Calcul de la somme des distances aux sommets accessibles
        reachable_count = len(visited)
        if reachable_count <= 1:
            closeness[source] = 0.0
        else:
            sum_dist = sum(visited.values())
            # Formule Wasserman-Faust pour composantes connexes
            score = ((reachable_count - 1) / (n - 1)) * ((reachable_count - 1) / sum_dist)
            closeness[source] = score

    # Si échantillonnage partiel, assigne la valeur médiane aux sommets non calculés
    if max_samples and max_samples < n:
        avg_score = sum(closeness.values()) / max(len(closeness), 1)
        for node in nodes:
            if node not in closeness:
                closeness[node] = avg_score

    return closeness


def compute_betweenness_centrality(
    graph: JaccardGraph,
    max_samples: int = 150
) -> Dict[int, float]:
    """
    Calcule la centralité d'intermédiarité (Betweenness Centrality)
    selon l'algorithme de Brandes (2001).
    Complexité temporelle: O(|V| * |E|)
    """
    nodes = list(graph.nodes)
    n = len(nodes)
    betweenness = {node: 0.0 for node in nodes}

    sample_sources = nodes[:max_samples] if max_samples else nodes

    for s in sample_sources:
        # Initialisation Brandes
        stack = []
        predecessors = {w: [] for w in nodes}
        sigma = {w: 0 for w in nodes}
        sigma[s] = 1
        d = {w: -1 for w in nodes}
        d[s] = 0
        
        queue = deque([s])

        while queue:
            v = queue.popleft()
            stack.append(v)

            for w in graph.adj[v].keys():
                # w trouvé pour la première fois ?
                if d[w] < 0:
                    queue.append(w)
                    d[w] = d[v] + 1
                # Chemin le plus court passant par v ?
                if d[w] == d[v] + 1:
                    sigma[w] += sigma[v]
                    predecessors[w].append(v)

        # Phase d'accumulation des dépendances
        delta = {w: 0.0 for w in nodes}
        while stack:
            w = stack.pop()
            for v in predecessors[w]:
                if sigma[w] > 0:
                    delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w])
            if w != s:
                betweenness[w] += delta[w]

    # Normalisation pour graphe non orienté
    scale = 1.0 / (len(sample_sources) * (n - 1)) if n > 1 else 1.0
    for node in betweenness:
        betweenness[node] *= scale

    return betweenness
