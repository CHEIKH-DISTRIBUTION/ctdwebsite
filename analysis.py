import matplotlib.pyplot as plt
import networkx as nx

# Définition des parcours utilisateur sous forme de graphes
flows = {
    "Commande client": [
        ("Accueil", "Page produit"),
        ("Page produit", "Panier"),
        ("Panier", "Connexion / Inscription"),
        ("Connexion / Inscription", "Adresse de livraison"),
        ("Adresse de livraison", "Paiement"),
        ("Paiement", "Confirmation"),
        ("Confirmation", "Notification")
    ],
    "Livraison (Livreur)": [
        ("Connexion livreur", "Tableau de bord livreur"),
        ("Tableau de bord livreur", "Détails commande"),
        ("Détails commande", "Mise à jour statut"),
        ("Mise à jour statut", "Fin de mission")
    ],
    "Gestion stock (Admin)": [
        ("Connexion admin", "Tableau de bord stock"),
        ("Tableau de bord stock", "Filtre stocks bas"),
        ("Filtre stocks bas", "Action modification stock"),
        ("Action modification stock", "Mise à jour en temps réel")
    ]
}

# Création du graphe
G = nx.DiGraph()

# Ajout des nœuds et arêtes
for flow, edges in flows.items():
    G.add_edges_from(edges, flow=flow)

# Positionnement circulaire par flow
pos = nx.spring_layout(G, seed=42)

# Couleurs par type de flow
flow_colors = {
    "Commande client": "skyblue",
    "Livraison (Livreur)": "lightgreen",
    "Gestion stock (Admin)": "lightcoral"
}

node_colors = []
for node in G.nodes():
    for flow, edges in flows.items():
        if any(node in edge for edge in edges):
            node_colors.append(flow_colors[flow])
            break

# Dessin
plt.figure(figsize=(12, 8))
nx.draw(
    G, pos,
    with_labels=True,
    node_size=3000,
    node_color=node_colors,
    font_size=8,
    font_weight="bold",
    arrowsize=15
)

plt.title("Diagramme de flux des parcours utilisateurs - Site e-commerce Cheikh Distribution", fontsize=14)
plt.axis("off")
plt.show()
