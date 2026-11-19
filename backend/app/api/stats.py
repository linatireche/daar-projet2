from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Book, JaccardEdge
from app.schemas import LibraryStats, BenchmarkComparison, BookBase
from app.services.book_service import BookService
from app.algorithms.state import app_state

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=LibraryStats)
def get_library_stats(db: Session = Depends(get_db)):
    total_books = db.query(func.count(Book.id)).scalar() or 0
    total_words = db.query(func.sum(Book.word_count)).scalar() or 0
    avg_words = float(total_words / total_books) if total_books > 0 else 0.0
    edges_count = db.query(func.count(JaccardEdge.id)).scalar() or 0
    
    vocab_size = len(app_state.inverted_index.index) if app_state.inverted_index else 0
    
    top_pr_books = db.query(Book).order_by(Book.pagerank.desc()).limit(5).all()

    return LibraryStats(
        total_books=total_books,
        total_words=total_words,
        avg_words_per_book=round(avg_words, 1),
        vocabulary_size=vocab_size,
        graph_edges_count=edges_count,
        top_pagerank_books=[BookBase.model_validate(b) for b in top_pr_books]
    )


@router.get("/benchmark", response_model=BenchmarkComparison)
def run_benchmark(
    pattern: str = Query("philosophie", min_length=2),
    sample_size: int = Query(50, ge=10, le=200),
    db: Session = Depends(get_db)
):
    service = BookService(db, app_state.inverted_index, app_state.jaccard_graph)
    return service.benchmark_comparison(pattern=pattern, max_books_to_scan=sample_size)
