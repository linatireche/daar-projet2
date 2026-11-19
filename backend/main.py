from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_engine, SessionLocal, Base
from app.services.seeder import seed_corpus_if_needed
from app.algorithms.state import app_state
from app.api import search, books, graph, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Démarrage du backend DAAR Bibliothèque...")
    engine = get_engine()
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        total_books, inverted_index, jaccard_graph = seed_corpus_if_needed(db)
        app_state.total_books = total_books
        app_state.inverted_index = inverted_index
        app_state.jaccard_graph = jaccard_graph
        print(f"Backend prêt avec {total_books} livres indexés.")
    finally:
        db.close()

    yield
    print("Arrêt du backend DAAR Bibliothèque.")


app = FastAPI(
    title="DAAR Projet 2 - Moteur de recherche d'une bibliothèque",
    description="API de recherche textuelle, graphe de Jaccard et indices de centralité (PageRank, Closeness, Betweenness) pour Sorbonne Université.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api")
app.include_router(books.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(stats.router, prefix="/api")


@app.get("/")
def root():
    return {
        "project": "DAAR Projet 2 - Moteur de recherche d'une bibliothèque",
        "institution": "Sorbonne Université",
        "status": "online",
        "docs_url": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
