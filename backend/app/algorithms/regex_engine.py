"""
RegEx Search Engine (Recherche Avancée par Expression Régulière)
Sorbonne Université - DAAR Project 2

Deux modes de recherche selon les spécifications du sujet :
1. Recherche RegEx sur l'index (Index-based RegEx) :
   Recherche les mots du vocabulaire de l'index inversé vérifiant le motif RegEx,
   puis agrège les documents correspondants (très rapide).
2. Recherche RegEx directe sur le texte intégral (Full-text RegEx) :
   Parcourt le texte complet des livres (démontre la dégradation de performance
   discutée dans l'énoncé du projet).
"""

import re
import time
from typing import Dict, List, Optional, Tuple
from app.algorithms.inverted_index import InvertedIndex


class RegexSearchEngine:
    def __init__(self, inverted_index: InvertedIndex):
        self.index = inverted_index

    def search_via_index(self, pattern_str: str) -> Tuple[Dict[int, Dict], List[str], float]:
        """
        Mode 1 : Recherche RegEx sur le vocabulaire de la table d'indexage.
        Retourne (résultats_par_doc, mots_correspondants, temps_execution_ms).
        """
        start_time = time.perf_counter()
        
        try:
            regex = re.compile(pattern_str, re.IGNORECASE)
        except re.error as e:
            raise ValueError(f"Expression régulière invalide: {str(e)}")

        matching_terms = []
        # Parcourt le vocabulaire de l'index
        for term in self.index.get_vocabulary():
            if regex.search(term):
                matching_terms.append(term)

        # Agrégation des documents
        doc_matches: Dict[int, Dict] = {}
        for term in matching_terms:
            doc_dict = self.index.search_term(term)
            for doc_id, positions in doc_dict.items():
                if doc_id not in doc_matches:
                    doc_matches[doc_id] = {
                        "occurrences": 0,
                        "positions": [],
                        "matching_terms": set()
                    }
                doc_matches[doc_id]["occurrences"] += len(positions)
                doc_matches[doc_id]["positions"].extend(positions)
                doc_matches[doc_id]["matching_terms"].add(term)

        # Conversion du set en list et tri des positions
        for doc_id, data in doc_matches.items():
            data["matching_terms"] = list(data["matching_terms"])
            data["positions"].sort()

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return doc_matches, matching_terms, elapsed_ms

    def search_direct_text(self, pattern_str: str, books: List[dict], max_docs: Optional[int] = None) -> Tuple[Dict[int, Dict], float]:
        """
        Mode 2 : Recherche RegEx directe sur le texte intégral brut des livres.
        Démontre le coût d'un scan complet séquentiel sur N documents.
        Retourne (résultats_par_doc, temps_execution_ms).
        """
        start_time = time.perf_counter()

        try:
            regex = re.compile(pattern_str, re.IGNORECASE)
        except re.error as e:
            raise ValueError(f"Expression régulière invalide: {str(e)}")

        doc_matches: Dict[int, Dict] = {}
        target_books = books[:max_docs] if max_docs else books

        for b in target_books:
            doc_id = b["id"]
            text = b.get("content", "")
            if not text:
                continue

            matches = list(regex.finditer(text))
            if matches:
                positions = [m.start() for m in matches]
                matched_words = list(set([m.group() for m in matches[:20]]))
                doc_matches[doc_id] = {
                    "occurrences": len(matches),
                    "positions": positions,
                    "matching_terms": matched_words
                }

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return doc_matches, elapsed_ms
