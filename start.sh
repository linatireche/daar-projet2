#!/bin/bash
set -e

echo "==============================================================="
echo "  SORBONNE UNIVERSITÉ - DAAR PROJET 2 (BM Bui-Xuan)"
echo "  Moteur de Recherche de Bibliothèque Multi-Conteneurs Docker"
echo "==============================================================="
echo ""
echo "[1/3] Construction et démarrage des conteneurs Docker..."
docker compose up --build -d

echo ""
echo "[2/3] Statut des conteneurs..."
docker compose ps

echo ""
echo "==============================================================="
echo "  Application prête et opérationnelle !"
echo "==============================================================="
echo "  - Frontend Web (Interface Rose & Livres) : http://localhost:3000"
echo "  - Backend API & Documentation Swagger     : http://localhost:8000/docs"
echo "  - Base de données PostgreSQL             : localhost:5432 (Volume persistant)"
echo "==============================================================="
