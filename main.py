from graphviz import Digraph

# Création du diagramme
dot = Digraph(comment='Flux de paiement - Cheikh Distribution', format='png')
dot.attr(rankdir='LR', size='8')

# Styles
dot.attr('node', shape='box', style='rounded,filled', color='#4A90E2', fontname='Arial', fontsize='10', fillcolor='#EAF4FF')

# Noeuds
dot.node('C', 'Client')
dot.node('CB', 'Choix de la méthode de paiement')
dot.node('WOM', 'Paiement Mobile (Wave / OM / CB)')
dot.node('COD', 'Paiement en espèces (Cash on Delivery)')
dot.node('API', 'Appel API Paiement')
dot.node('WEB', 'Réception du webhook de confirmation')
dot.node('CONF', 'Commande confirmée')
dot.node('FAIL', 'Échec paiement / Rejet')
dot.node('LIV', 'Livreur')
dot.node('ENC', 'Encaissement espèces confirmé par livreur')
dot.node('ANN', 'Commande annulée et stock réajusté')

# Arcs Paiement mobile
dot.edge('C', 'CB')
dot.edge('CB', 'WOM', label='Option 1')
dot.edge('WOM', 'API', label='Initier transaction')
dot.edge('API', 'WEB', label='Réponse service tiers')
dot.edge('WEB', 'CONF', label='Succès')
dot.edge('WEB', 'FAIL', label='Échec', color='red')
dot.edge('FAIL', 'CB', label='Changer méthode / Retry', style='dashed')

# Arcs Paiement en espèces
dot.edge('CB', 'COD', label='Option 2')
dot.edge('COD', 'LIV', label='Commande en attente de paiement')
dot.edge('LIV', 'ENC', label='Paiement reçu')
dot.edge('ENC', 'CONF', label='Confirmation')
dot.edge('LIV', 'ANN', label='Paiement refusé', color='red')

# Export
output_path = '/mnt/data/flux_paiement_cheikh_distribution'
dot.render(output_path, cleanup=True)

output_path + '.png'
