from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, JaccardEdge
from app.schemas import GraphResponse, GraphNode, GraphEdge

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("", response_model=GraphResponse)
def get_graph_data(
    center_book_id: Optional[int] = Query(None, description="Livre au centre du sous-graphe"),
    max_nodes: int = Query(60, ge=10, le=150),
    min_similarity: float = Query(0.10, ge=0.01, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Retourne les nœuds et les arêtes pour la visualisation interactive du graphe de Jaccard.
    """
    if center_book_id:
        # Trouver les voisins directs et de second ordre du livre
        direct_edges = db.query(JaccardEdge).filter(
            (JaccardEdge.source_id == center_book_id) | (JaccardEdge.target_id == center_book_id)
        ).filter(JaccardEdge.similarity >= min_similarity).all()

        node_ids = {center_book_id}
        for e in direct_edges:
            node_ids.add(e.source_id)
            node_ids.add(e.target_id)

        # Si trop peu, ajouter quelques sommets à haut PageRank
        if len(node_ids) < 15:
            top_pr = db.query(Book.id).order_by(Book.pagerank.desc()).limit(15).all()
            for row in top_pr:
                node_ids.add(row[0])
    else:
        # Extraire les sommets les plus centraux (PageRank élevé)
        top_books = db.query(Book.id).order_by(Book.pagerank.desc()).limit(max_nodes).all()
        node_ids = {b[0] for b in top_books}

    # Récupérer les livres correspondants
    books = db.query(Book).filter(Book.id.in_(list(node_ids))).all()
    nodes = [
        GraphNode(
            id=b.id,
            label=b.title,
            author=b.author,
            pagerank=round(b.pagerank, 6),
            closeness=round(b.closeness, 4),
            betweenness=round(b.betweenness, 6),
            word_count=b.word_count
        )
        for b in books
    ]

    # Récupérer les arêtes reliant ces sommets
    edges_db = db.query(JaccardEdge).filter(
        JaccardEdge.source_id.in_(list(node_ids)),
        JaccardEdge.target_id.in_(list(node_ids)),
        JaccardEdge.similarity >= min_similarity
    ).limit(300).all()

    edges = [
        GraphEdge(
            source=e.source_id,
            target=e.target_id,
            weight=round(e.similarity, 4)
        )
        for e in edges_db
    ]

    return GraphResponse(nodes=nodes, edges=edges)
