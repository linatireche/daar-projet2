import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book
from app.schemas import BookBase

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=List[BookBase])
def get_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    genre: Optional[str] = None,
    author: Optional[str] = None,
    sort_by: str = Query("pagerank", description="pagerank, clicks, word_count, id"),
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if genre:
        query = query.filter(Book.genre == genre)
    if author:
        query = query.filter(Book.author == author)

    if sort_by == "pagerank":
        query = query.order_by(Book.pagerank.desc())
    elif sort_by == "clicks":
        query = query.order_by(Book.clicks.desc())
    elif sort_by == "word_count":
        query = query.order_by(Book.word_count.desc())
    else:
        query = query.order_by(Book.id.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/{book_id}", response_model=BookBase)
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    # Incrémentation du compteur de clics utilisateur
    book.clicks += 1
    db.commit()
    db.refresh(book)
    return book


@router.get("/{book_id}/content")
def get_book_content(book_id: int, max_chars: int = Query(50000, ge=1000, le=200000), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouvé")

    if not os.path.exists(book.file_path):
        raise HTTPException(status_code=404, detail="Fichier texte introuvable sur le volume")

    with open(book.file_path, "r", encoding="utf-8") as f:
        content = f.read(max_chars)

    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "word_count": book.word_count,
        "content": content,
        "is_truncated": len(content) >= max_chars
    }
