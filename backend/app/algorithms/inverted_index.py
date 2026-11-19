"""
Inverted Index Implementation with Positional Index and TF-IDF
Sorbonne Université - DAAR Project 2

Structure de données fondamentale pour la recherche plein texte :
Index inversé : mot-clé -> { doc_id -> [positions des occurrences] }
Permet une recherche en O(1) par mot-clé pour retrouver la liste des documents pertinents.
"""

import math
import re
import unicodedata
from typing import Dict, List, Set, Tuple, Optional


def normalize_text(text: str) -> str:
    """Normalise une chaîne : minuscules, suppression des accents et ponctuation."""
    # Décomposition NFKD pour séparer les accents
    nfkd = unicodedata.normalize('NFKD', text)
    without_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return without_accents.lower()


def tokenize(text: str) -> List[Tuple[str, int]]:
    """
    Découpe le texte en mots avec leurs positions respectives dans la chaîne originale.
    Retourne une liste de tuples (token, start_char_index).
    """
    tokens = []
    # Recherche tous les mots alphanumériques de taille >= 2
    for match in re.finditer(r'\b[a-zA-Z0-9_\u00C0-\u017F]{2,}\b', text):
        clean_word = normalize_text(match.group())
        if clean_word:
            tokens.append((clean_word, match.start()))
    return tokens


class InvertedIndex:
    def __init__(self):
        # index: term -> { doc_id -> list of start_char_positions }
        self.index: Dict[str, Dict[int, List[int]]] = {}
        # doc_lengths: doc_id -> total number of tokens
        self.doc_lengths: Dict[int, int] = {}
        # doc_metadata: doc_id -> {title, author, ...}
        self.doc_metadata: Dict[int, dict] = {}
        # total documents count
        self.num_docs: int = 0

    def add_document(self, doc_id: int, text: str, metadata: Optional[dict] = None) -> int:
        """
        Indexe un document dans l'index inversé.
        Retourne le nombre total de mots indexés.
        """
        tokens = tokenize(text)
        self.doc_lengths[doc_id] = len(tokens)
        self.num_docs = len(self.doc_lengths)
        if metadata:
            self.doc_metadata[doc_id] = metadata

        for term, pos in tokens:
            if term not in self.index:
                self.index[term] = {}
            if doc_id not in self.index[term]:
                self.index[term][doc_id] = []
            self.index[term][doc_id].append(pos)

        return len(tokens)

    def search_term(self, term: str) -> Dict[int, List[int]]:
        """
        Recherche un terme unique normalisé dans l'index.
        Retourne un dictionnaire { doc_id: [positions] }.
        """
        norm_term = normalize_text(term.strip())
        return self.index.get(norm_term, {})

    def search_query(self, query: str, mode: str = "OR") -> Dict[int, Dict]:
        """
        Recherche une requête composée d'un ou plusieurs mots.
        Modes disponibles: 'AND', 'OR'.
        Retourne un dictionnaire:
        { doc_id: { 'occurrences': int, 'positions': list, 'score_tfidf': float } }
        """
        query_tokens = [normalize_text(t) for t, _ in tokenize(query)]
        if not query_tokens:
            return {}

        results: Dict[int, Dict] = {}

        if mode == "AND":
            # Intersection des listes de doc_ids
            doc_sets = [set(self.index.get(t, {}).keys()) for t in query_tokens]
            matching_docs = set.intersection(*doc_sets) if doc_sets else set()
        else:  # OR
            matching_docs = set()
            for t in query_tokens:
                matching_docs.update(self.index.get(t, {}).keys())

        # Calcul des scores TF-IDF et agrégation des positions
        total_n = max(self.num_docs, 1)

        for doc_id in matching_docs:
            doc_len = max(self.doc_lengths.get(doc_id, 1), 1)
            total_occ = 0
            all_positions = []
            tfidf_sum = 0.0

            for t in query_tokens:
                doc_dict = self.index.get(t, {})
                if doc_id in doc_dict:
                    positions = doc_dict[doc_id]
                    tf = len(positions) / doc_len
                    df = len(doc_dict)
                    idf = math.log((total_n + 1) / (df + 1)) + 1.0
                    tfidf_sum += tf * idf
                    total_occ += len(positions)
                    all_positions.extend(positions)

            all_positions.sort()
            results[doc_id] = {
                "occurrences": total_occ,
                "positions": all_positions,
                "score_tfidf": tfidf_sum,
                "matching_terms": [t for t in query_tokens if doc_id in self.index.get(t, {})]
            }

        return results

    def get_vocabulary(self) -> List[str]:
        """Retourne la liste complète de tous les mots uniques indexés."""
        return list(self.index.keys())

    def get_terms_matching_prefix(self, prefix: str, max_results: int = 10) -> List[str]:
        """Auto-complétion de termes pour la barre de recherche."""
        norm_p = normalize_text(prefix)
        matches = [t for t in self.index.keys() if t.startswith(norm_p)]
        # Tri par popularité globale (somme des documents contenant le mot)
        matches.sort(key=lambda t: len(self.index[t]), reverse=True)
        return matches[:max_results]
