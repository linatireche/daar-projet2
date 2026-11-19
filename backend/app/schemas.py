from typing import List, Optional, Dict
from pydantic import BaseModel


class BookBase(BaseModel):
    id: int
    title: str
    author: str
    year: int
    genre: str
    word_count: int
    language: str
    clicks: int
    summary: Optional[str] = None
    pagerank: float
    closeness: float
    betweenness: float

    class Config:
        from_attributes = True


class SearchResultItem(BaseModel):
    book: BookBase
    occurrences: int
    score_tfidf: float
    final_score: float
    snippets: List[str]
    matched_terms: List[str]


class SearchResponse(BaseModel):
    query: str
    search_type: str
    ranking_metric: str
    total_results: int
    execution_time_ms: float
    results: List[SearchResultItem]
    suggestions: List[BookBase]
    matching_terms: Optional[List[str]] = None


class GraphNode(BaseModel):
    id: int
    label: str
    author: str
    pagerank: float
    closeness: float
    betweenness: float
    word_count: int


class GraphEdge(BaseModel):
    source: int
    target: int
    weight: float


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class BenchmarkComparison(BaseModel):
    pattern: str
    kmp_time_ms: float
    index_time_ms: float
    regex_time_ms: float
    matches_found: int
    scanned_books_count: int


class LibraryStats(BaseModel):
    total_books: int
    total_words: int
    avg_words_per_book: float
    vocabulary_size: int
    graph_edges_count: int
    top_pagerank_books: List[BookBase]
