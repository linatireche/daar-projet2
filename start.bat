@echo off
echo ===============================================================
echo   SORBONNE UNIVERSITE - DAAR PROJET 2 (BM Bui-Xuan)
echo   Moteur de Recherche de Bibliotheque Multi-Conteneurs Docker
echo ===============================================================
echo.
echo [1/3] Construction et demarrage des conteneurs Docker...
docker compose up --build -d

echo.
echo [2/3] Verification des conteneurs en cours d'execution...
docker compose ps

echo.
echo ===============================================================
echo  Application prete et operationnelle !
echo ===============================================================
echo  - Frontend Web (Interface Rose & Livres) : http://localhost:3000
echo  - Backend API & Documentation Swagger     : http://localhost:8000/docs
echo  - Base de donnees PostgreSQL             : localhost:5432 (Volume persistant)
echo ===============================================================
echo.
pause
