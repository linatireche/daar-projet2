"""
Knuth-Morris-Pratt (KMP) Pattern Matching Algorithm
Implementation for Sorbonne Université - DAAR Project 2

Algorithme de recherche exacte de sous-chaîne en temps linéaire O(N + M).
- N : taille du texte
- M : taille du motif (pattern)
"""

from typing import List, Tuple


def compute_pi_table(pattern: str) -> List[int]:
    """
    Calcule la table de préfixes pi (ou fonction d'échec) pour l'algorithme KMP.
    pi[i] représente la longueur du plus long préfixe propre de pattern[0..i]
    qui est également un suffixe propre de pattern[0..i].
    
    Complexité temporelle: O(M) où M = len(pattern).
    Complexité spatiale: O(M).
    """
    m = len(pattern)
    if m == 0:
        return []
    
    pi = [0] * m
    k = 0  # Longueur du préfixe courant
    
    for q in range(1, m):
        while k > 0 and pattern[k] != pattern[q]:
            k = pi[k - 1]
        if pattern[k] == pattern[q]:
            k += 1
        pi[q] = k
        
    return pi


def kmp_search(text: str, pattern: str, case_sensitive: bool = False) -> List[int]:
    """
    Recherche toutes les occurrences du motif 'pattern' dans le texte 'text' avec KMP.
    
    Retourne la liste des index de début de chaque occurrence trouvée dans 'text'.
    Complexité temporelle: O(N + M) dans le pire des cas.
    """
    if not pattern or not text:
        return []
        
    if not case_sensitive:
        text_cmp = text.lower()
        pattern_cmp = pattern.lower()
    else:
        text_cmp = text
        pattern_cmp = pattern

    n = len(text_cmp)
    m = len(pattern_cmp)
    
    if m > n:
        return []
        
    pi = compute_pi_table(pattern_cmp)
    matches = []
    
    q = 0  # Nombre de caractères correspondants
    for i in range(n):
        while q > 0 and pattern_cmp[q] != text_cmp[i]:
            q = pi[q - 1]
        if pattern_cmp[q] == text_cmp[i]:
            q += 1
        if q == m:
            matches.append(i - m + 1)
            q = pi[m - 1]
            
    return matches


def kmp_count(text: str, pattern: str, case_sensitive: bool = False) -> int:
    """
    Compte rapidement le nombre d'occurrences d'un motif dans un texte à l'aide de KMP.
    """
    return len(kmp_search(text, pattern, case_sensitive=case_sensitive))


def kmp_find_snippets(text: str, pattern: str, window_size: int = 120, max_snippets: int = 3) -> List[str]:
    """
    Génère des extraits de texte contextuels autour des occurrences trouvées par KMP.
    """
    matches = kmp_search(text, pattern, case_sensitive=False)
    if not matches:
        return []
        
    snippets = []
    for idx in matches[:max_snippets]:
        start = max(0, idx - window_size // 2)
        end = min(len(text), idx + len(pattern) + window_size // 2)
        
        prefix = "..." if start > 0 else ""
        suffix = "..." if end < len(text) else ""
        
        raw_snippet = text[start:end].replace("\n", " ").strip()
        snippets.append(f"{prefix}{raw_snippet}{suffix}")
        
    return snippets
