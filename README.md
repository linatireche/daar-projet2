# 🏛️ DAAR Projet 2 — Moteur de Recherche de Bibliothèque Textuelle
> **Sorbonne Université • Master 1 Informatique • Année 2025–2026**  
> **UE DAAR (Données, Algorithmes et Apprentissage)**  
> **Responsable d'UE :** Binh-Minh BUI-XUAN  
> **Binôme :** **Lina TIRECHE** & **Nouha KARA**

---

![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-brightgreen?logo=github-actions)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Containers-Docker%20Compose-2496ed?logo=docker)
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes%20ReplicaSets-326ce5?logo=kubernetes)
![Tests](https://img.shields.io/badge/Tests-7%2F7%20Passed-success?logo=pytest)

---

## 📑 Sommaire
1. [Présentation du Projet](#-présentation-du-projet)
2. [Conformité au Cahier des Charges DAAR](#-conformité-au-cahier-des-charges-daar)
3. [Architecture Logicielle](#-architecture-logicielle)
4. [Algorithmes Implémentés & Complexités](#-algorithmes-implémentés--complexités)
5. [Démarrage Rapide (1 Commande)](#-démarrage-rapide-en-1-commande)
6. [Orchestration Kubernetes & ReplicaSets](#-orchestration-kubernetes--replicasets)
7. [Intégration Continue (CI/CD)](#-intégration-continue-cicd)
8. [Résultats des Benchmarks](#-résultats-des-benchmarks)

---

## 📖 Présentation du Projet

Ce projet implémente un **moteur de recherche textuelle distribué** appliqué à une bibliothèque de grande envergure. L'application propose une interface web réactive aux couleurs de **Sorbonne Université** permettant la recherche instantanée par mot-clé, la recherche exacte par motif de sous-chaîne, l'évaluation de requêtes régulières (RegEx), la recommandation d'ouvrages similaires via un graphe de Jaccard, ainsi que l'analyse topologique par centralités de graphe.

L'ensemble de l'écosystème est containerisé, hautement disponible et conçu pour résister aux pannes grâce à une séparation étanche des couches de données, de logique métier et de présentation.

---

## 🎯 Conformité au Cahier des Charges DAAR

| Exigence du Sujet DAAR | Spécification Demandée | Réalisation dans notre Projet |
| :--- | :--- | :---: |
| **Volume de la bibliothèque** | $\ge 1\,664$ livres textuels | ✅ **1 665 livres textuels** (API Gutenberg) |
| **Longueur par livre** | $\ge 10\,000$ mots par livre | ✅ **11 298 mots en moyenne** par livre (18,8M mots) |
| **Recherche par mot-clé** | Table d'indexage inversé et KMP | ✅ **Index inversé TF-IDF ($O(1)$) & KMP ($O(N+M)$)** |
| **Recherche avancée** | Expressions rationnelles (RegEx) | ✅ **Moteur RegEx plein texte et sur vocabulaire** |
| **Graphe de similarité** | $J(A, B) = \frac{\vert A \cap B \vert}{\vert A \cup B \vert}$ | ✅ **Graphe de Jaccard (9 628 arêtes, seuil $\theta=0{,}12$)** |
| **Classement implicite** | Centralités de graphe | ✅ **PageRank ($d=0{,}85$), Closeness & Betweenness** |
| **Suggestions implicites** | Recommandations de voisins | ✅ **Suggestions automatiques des voisins dans le graphe** |
| **Liseuse intégrée** | Visualisation plein texte | ✅ **Liseuse avec surlignage et contrôle de zoom** |
| **Architecture conteneurisée** | Docker Compose 3-tiers | ✅ **3 conteneurs isolés sur réseau bridge dédié** |
| **Kubernetes & ReplicaSets** | Déploiement résilient | ✅ **ReplicaSet (3 répliques backend, 2 frontend, Ingress)** |
| **Pipeline CI/CD** | Automatisation des tests | ✅ **GitHub Actions & GitLab CI (4 jobs automatisés)** |

---

## 🏗️ Architecture Logicielle

L'application repose sur une architecture microservices 3-tiers distribuée :

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Navigateur Web / Client                │
                  │              http://localhost:3000 (ou :80)            │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTP / JSON
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Réseau Docker dédié : daar-network                                                        │
│                                                                                           │
│   ┌───────────────────────────┐                     ┌─────────────────────────────────┐   │
│   │  daar-frontend (Nginx)    │                     │   daar-backend (FastAPI)        │   │
│   │  • SPA React 18 / Vite    │                     │   • Moteur KMP & Index Inversé  │   │
│   │  • Port 80 / 3000         │                     │   • Graphe Jaccard & PageRank   │   │
│   │  • Reverse proxy API      │                     │   • API REST OpenAPI (:8000)    │   │
│   └───────────────────────────┘                     └────────────────┬────────────────┘   │
│                                                                      │                    │
│                                                                      │ SQL (Port 5432)    │
│                                                                      ▼                    │
│                                                     ┌─────────────────────────────────┐   │
│                                                     │   daar-db (PostgreSQL 16)       │   │
│                                                     │   • 1 665 Livres (18,8M mots)   │   │
│                                                     │   • 9 628 Arêtes de Jaccard     │   │
│                                                     │   • Volume persistant : db_data │   │
│                                                     └─────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Algorithmes Implémentés & Complexités

### 1. Knuth-Morris-Pratt (KMP) — `backend/app/algorithms/kmp.py`
- **Principe :** Recherche exacte d'un motif $P$ de longueur $M$ dans un texte $T$ de longueur $N$.
- **Table d'échec $\pi$ :** Précalcul en $O(M)$ des plus longs préfixes propres qui sont également suffixes.
- **Complexité temporelle totale :** $O(N + M)$ sans aucun retour en arrière du pointeur de lecture.

### 2. Index Inversé & TF-IDF — `backend/app/algorithms/inverted_index.py`
- **Principe :** Dictionnaire de projection associant chaque terme normalisé à la liste des documents le contenant.
- **Pondération :** $\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\left(\frac{N}{\text{DF}(t)}\right)$.
- **Complexité d'interrogation :** $O(1)$ en temps d'accès hash, classé en $O(K \log K)$ sur les $K$ documents pertinents.

### 3. Graphe de Similarité de Jaccard — `backend/app/algorithms/jaccard_graph.py`
- **Principe :** $J(A, B) = \frac{|W_A \cap W_B|}{|W_A \cup W_B|}$ sur les ensembles de vocabulaire nettoyés.
- **Optimisation :** Seuil de pertinence $\theta = 0{,}12$ et conservation des $k=6$ plus proches voisins pour chaque sommet.
- **Résultat :** Réseau de 1 665 nœuds et **9 628 arêtes pondérées**.

### 4. Centralités de Graphe — `backend/app/algorithms/centrality.py`
- **PageRank :** Méthode de la puissance itérative ($d=0{,}85$, convergence $\varepsilon = 10^{-6}$ atteinte en $< 35$ itérations).
- **Closeness Centrality :** Calcul par parcours BFS avec la correction de **Wasserman-Faust** pour les composantes non connexes.
- **Betweenness Centrality :** Algorithme de **Brandes** en $O(|V| \cdot |E|)$ calculant la proportion de plus courts chemins.

---

## 🚀 Démarrage Rapide en 1 Commande

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.

### Lancement
```bash
# Cloner le dépôt (si ce n'est pas déjà fait)
git clone https://github.com/linatireche/daar-projet2.git
cd daar-projet2

# Démarrer l'ensemble de l'application
docker compose up --build
```
> **Sous Windows :** Vous pouvez également double-cliquer directement sur le fichier [`start.bat`](start.bat).

### Accès aux interfaces
- 🌐 **Interface Web (Frontend) :** [http://localhost:3000](http://localhost:3000) (ou `http://localhost`)
- 📚 **Documentation API Swagger :** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **Base PostgreSQL :** `localhost:5432` (`user: daar_user`, `db: daar_library`)

---

## ☸️ Orchestration Kubernetes & ReplicaSets

Le dossier `k8s/` contient la configuration complète pour un déploiement en production :

- **3 Répliques Backend :** Gérées par ReplicaSet (`04-backend.yaml` et `04-backend-replicaset-standalone.yaml`) pour distribuer les requêtes algorithmiques.
- **2 Répliques Frontend :** Haute disponibilité assurée par Nginx.
- **Persistance :** PersistentVolumeClaims (`postgres-pvc` et `books-pvc`) garantissant 0 perte de données.
- **Ingress Nginx :** Routage unifié du trafic externe.

```bash
# Déploiement en 1 commande sur un cluster Kubernetes (Minikube / Kind / K8s)
kubectl apply -k k8s/

# Vérification des ReplicaSets actifs
kubectl get replicasets -n daar-library
```
> **Sous Windows :** Double-cliquez sur [`k8s-deploy.bat`](k8s-deploy.bat).

---

## 🔄 Intégration Continue (CI/CD)

Le workflow GitHub Actions (`.github/workflows/ci-cd.yml`) valide chaque commit à travers 4 étapes automatisées :

1. 🐍 **Tests Algorithmes (Pytest) :** Validation des 7 tests unitaires couvrant KMP, index inversé, Jaccard et PageRank.
2. ⚛️ **Build Frontend (React / Vite) :** Compilation et validation TypeScript.
3. 🐳 **Build Docker :** Compilation des conteneurs avec Docker Buildx.
4. ☸️ **Validation Kubernetes :** Validation de syntaxe et de structure Kustomize 100% hors-ligne.

### Exécuter les tests en local :
```bash
docker compose exec backend python -m pytest tests/ -v
```
*(Résultat : `7 passed in 0.03s`)*

---

## 📊 Résultats des Benchmarks

Mesures expérimentales réelles obtenues sur notre corpus de 1 665 livres :

| Méthode de Recherche | Complexité Théorique | Temps Moyen Mesuré | Avantage Majeur |
| :--- | :---: | :---: | :--- |
| **Index Inversé (TF-IDF)** | $O(1)$ lookup | **~6 ms** | Classement instantané par pertinence |
| **Expressions Régulières** | Linéaire sur index | **~8 ms** | Flexibilité des motifs (wildcards, regex) |
| **Knuth-Morris-Pratt (KMP)** | $O(N + M)$ | **~26 ms** | Recherche exacte absolue dans le texte brut |

---

*Sorbonne Université • Master 1 Informatique • UE DAAR • Projet réalisé par Lina Tireche & Nouha Kara.*
