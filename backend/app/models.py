from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    year = Column(Integer, default=1900)
    genre = Column(String(100), default="Littérature")
    word_count = Column(Integer, nullable=False)
    language = Column(String(10), default="fr")
    clicks = Column(Integer, default=0)
    file_path = Column(String(512), nullable=False)
    summary = Column(Text, nullable=True)

    # Scores de centralité calculés sur le graphe de Jaccard
    pagerank = Column(Float, default=0.0, index=True)
    closeness = Column(Float, default=0.0, index=True)
    betweenness = Column(Float, default=0.0, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class JaccardEdge(Base):
    __tablename__ = "jaccard_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), index=True)
    target_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), index=True)
    similarity = Column(Float, nullable=False)

    __table_args__ = (
        Index("idx_source_target", "source_id", "target_id"),
    )


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), nullable=False)
    search_type = Column(String(50), default="keyword")  # keyword, regex, kmp
    ranking_metric = Column(String(50), default="pagerank")
    results_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
