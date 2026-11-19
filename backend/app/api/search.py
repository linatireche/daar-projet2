from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SearchResponse
from app.services.book_service import BookService
from app.algorithms.state import app_state

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search_books(
    q: str = Query(..., description="Mot-clef ou motif RegEx à rechercher"),
    type: str = Query("keyword", description="Type de recherche: 'keyword', 'regex', 'kmp'"),
    rank_by: str = Query("pagerank", description="Critère de classement: 'pagerank', 'closeness', 'betweenness', 'occurrences', 'tfidf', 'hybrid'"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = BookService(db, app_state.inverted_index, app_state.jaccard_graph)
    return service.search(query=q, search_type=type, ranking_metric=rank_by, limit=limit)


@router.get("/suggest-terms")
def suggest_terms(
    prefix: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=20)
):
    if not app_state.inverted_index:
        return {"suggestions": []}
    terms = app_state.inverted_index.get_terms_matching_prefix(prefix, max_results=limit)
    return {"suggestions": terms}
