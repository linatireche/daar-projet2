"""
Service Métier de Recherche, Classement et Suggestions
Sorbonne Université - DAAR Project 2
"""

import os
import time
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models import Book, SearchHistory
from app.algorithms.inverted_index import InvertedIndex
from app.algorithms.jaccard_graph import JaccardGraph
from app.algorithms.kmp import kmp_search, kmp_find_snippets
from app.algorithms.regex_engine import RegexSearchEngine
from app.schemas import SearchResponse, SearchResultItem, BookBase, BenchmarkComparison


class BookService:
    def __init__(self, db: Session, inverted_index: InvertedIndex, jaccard_graph: JaccardGraph):
        self.db = db
        self.index = inverted_index
        self.graph = jaccard_graph
        self.regex_engine = RegexSearchEngine(inverted_index)

    def search(
        self,
        query: str,
        search_type: str = "keyword",       # 'keyword', 'regex', 'kmp'
        ranking_metric: str = "pagerank",   # 'pagerank', 'closeness', 'betweenness', 'occurrences', 'tfidf', 'hybrid'
        limit: int = 20
    ) -> SearchResponse:
        start_time = time.perf_counter()
        query_clean = query.strip()
        if not query_clean:
            return SearchResponse(
                query=query,
                search_type=search_type,
                ranking_metric=ranking_metric,
                total_results=0,
                execution_time_ms=0.0,
                results=[],
                suggestions=[]
            )

        matching_doc_data: Dict[int, Dict] = {}
        matched_terms = []

        if search_type == "regex":
            matching_doc_data, matched_terms, _ = self.regex_engine.search_via_index(query_clean)
        elif search_type == "kmp":
            # Recherche KMP explicite sur un échantillon ou l'ensemble
            all_books = self.db.query(Book).all()
            for b in all_books:
                if os.path.exists(b.file_path):
                    with open(b.file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                    matches = kmp_search(text, query_clean, case_sensitive=False)
                    if matches:
                        matching_doc_data[b.id] = {
                            "occurrences": len(matches),
                            "positions": matches,
                            "score_tfidf": float(len(matches)),
                            "matching_terms": [query_clean]
                        }
        else:  # 'keyword' via Index Inversé
            matching_doc_data = self.index.search_query(query_clean, mode="OR")
            matched_terms = [query_clean]

        total_results = len(matching_doc_data)
        if total_results == 0:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SearchResponse(
                query=query,
                search_type=search_type,
                ranking_metric=ranking_metric,
                total_results=0,
                execution_time_ms=round(elapsed_ms, 2),
                results=[],
                suggestions=[],
                matching_terms=matched_terms
            )

        # Récupération des livres correspondants depuis la base de données
        doc_ids = list(matching_doc_data.keys())
        books_db = {b.id: b for b in self.db.query(Book).filter(Book.id.in_(doc_ids)).all()}

        # Calcul du score de classement
        scored_items = []
        for doc_id, meta in matching_doc_data.items():
            book = books_db.get(doc_id)
            if not book:
                continue

            occurrences = meta.get("occurrences", 0)
            tfidf = meta.get("score_tfidf", 0.0)

            # Critère de classement imposé par le projet
            if ranking_metric == "pagerank":
                final_score = book.pagerank * 10000.0 + (occurrences * 0.1)
            elif ranking_metric == "closeness":
                final_score = book.closeness * 100.0 + (occurrences * 0.1)
            elif ranking_metric == "betweenness":
                final_score = book.betweenness * 100000.0 + (occurrences * 0.1)
            elif ranking_metric == "occurrences":
                final_score = float(occurrences)
            elif ranking_metric == "tfidf":
                final_score = float(tfidf)
            elif ranking_metric == "hybrid":
                final_score = (book.pagerank * 5000.0) + (book.closeness * 50.0) + (tfidf * 10.0)
            else:
                final_score = book.pagerank

            scored_items.append((final_score, book, meta))

        # Tri décroissant selon le critère de pertinence
        scored_items.sort(key=lambda x: x[0], reverse=True)

        # Construction des résultats et génération des extraits (snippets)
        results = []
        top_doc_ids = []

        for final_score, book, meta in scored_items[:limit]:
            top_doc_ids.append(book.id)
            snippets = []
            if os.path.exists(book.file_path):
                try:
                    with open(book.file_path, "r", encoding="utf-8") as f:
                        content = f.read(12000)  # Lit les premiers caractères pour l'extrait
                    snippets = kmp_find_snippets(content, query_clean, window_size=110, max_snippets=2)
                except Exception:
                    snippets = [book.summary or ""]
            if not snippets and book.summary:
                snippets = [book.summary]

            item = SearchResultItem(
                book=BookBase.model_validate(book),
                occurrences=meta.get("occurrences", 0),
                score_tfidf=round(meta.get("score_tfidf", 0.0), 4),
                final_score=round(final_score, 4),
                snippets=snippets,
                matched_terms=list(meta.get("matching_terms", []))[:5]
            )
            results.append(item)

        # Génération des suggestions implicites (voisins dans le graphe de Jaccard)
        suggested_pairs = self.graph.get_suggestions(top_doc_ids, max_suggestions=4)
        suggested_ids = [s_id for s_id, _ in suggested_pairs]
        suggested_books_db = self.db.query(Book).filter(Book.id.in_(suggested_ids)).all()
        # Conserver l'ordre des suggestions
        book_map = {b.id: b for b in suggested_books_db}
        suggestions = [BookBase.model_validate(book_map[s_id]) for s_id in suggested_ids if s_id in book_map]

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # Enregistrement dans l'historique
        try:
            history = SearchHistory(
                query=query_clean,
                search_type=search_type,
                ranking_metric=ranking_metric,
                results_count=total_results,
                execution_time_ms=round(elapsed_ms, 2)
            )
            self.db.add(history)
            self.db.commit()
        except Exception:
            self.db.rollback()

        return SearchResponse(
            query=query,
            search_type=search_type,
            ranking_metric=ranking_metric,
            total_results=total_results,
            execution_time_ms=round(elapsed_ms, 2),
            results=results,
            suggestions=suggestions,
            matching_terms=matched_terms
        )

    def benchmark_comparison(self, pattern: str, max_books_to_scan: int = 50) -> BenchmarkComparison:
        """
        Compare les performances des trois approches (KMP, Index inversé, RegEx)
        sur un même motif pour le rapport et la soutenance.
        """
        sample_books = self.db.query(Book).limit(max_books_to_scan).all()

        # 1. Index Inversé
        t0 = time.perf_counter()
        index_res = self.index.search_query(pattern, mode="OR")
        index_time_ms = (time.perf_counter() - t0) * 1000.0

        # 2. Algorithme KMP sur les fichiers texte des livres
        t0 = time.perf_counter()
        kmp_count = 0
        for b in sample_books:
            if os.path.exists(b.file_path):
                with open(b.file_path, "r", encoding="utf-8") as f:
                    text = f.read(15000)
                matches = kmp_search(text, pattern, case_sensitive=False)
                kmp_count += len(matches)
        kmp_time_ms = (time.perf_counter() - t0) * 1000.0

        # 3. RegEx sur l'index vs fulltext
        t0 = time.perf_counter()
        regex_res, _, _ = self.regex_engine.search_via_index(pattern)
        regex_time_ms = (time.perf_counter() - t0) * 1000.0

        return BenchmarkComparison(
            pattern=pattern,
            kmp_time_ms=round(kmp_time_ms, 2),
            index_time_ms=round(index_time_ms, 2),
            regex_time_ms=round(regex_time_ms, 2),
            matches_found=len(index_res) or kmp_count,
            scanned_books_count=len(sample_books)
        )
