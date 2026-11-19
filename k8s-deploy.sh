#!/bin/bash
set -e

echo "==============================================================="
echo "  SORBONNE UNIVERSITÉ - DÉPLOIEMENT KUBERNETES & REPLICASET"
echo "  Projet 2 DAAR - Bibliothèque & Moteur de Recherche"
echo "==============================================================="
echo ""

echo "[1/3] Application des manifestes Kubernetes dans le namespace daar-library..."
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-config-secrets.yaml
kubectl apply -f k8s/02-storage.yaml
kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-backend.yaml
kubectl apply -f k8s/05-frontend.yaml
kubectl apply -f k8s/06-ingress.yaml

echo ""
echo "[2/3] Vérification des ReplicaSets Kubernetes actifs..."
kubectl get replicaset -n daar-library -o wide

echo ""
echo "[3/3] Statut des Pods et des Services..."
kubectl get pods -n daar-library
kubectl get svc -n daar-library

echo ""
echo "==============================================================="
echo "  Déploiement Kubernetes terminé !"
echo "  - Port Forward direct Frontend : kubectl port-forward -n daar-library svc/frontend-service 3000:80"
echo "  - Port Forward direct Backend  : kubectl port-forward -n daar-library svc/backend-service 8000:8000"
echo "==============================================================="
