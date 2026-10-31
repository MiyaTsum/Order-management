import { handleFilter, create_commande, get_commandes, find_commande } from "./features.js"

//Récuperation de la liste des commandes après rendu complet de la page
window.addEventListener('DOMContentLoaded', get_commandes)

//Filtrage de la liste des commandes par les bouttons des bouttons de navigation
document.querySelectorAll('body main header nav button')
        .forEach(each => {
            each.addEventListener('click', handleFilter)
        })

//Recherche des commandes en fonction de l'ID et de la condition de filtrage
document.querySelector('#search input')
        .addEventListener('input', (e) => {
            const { currentTarget: target } = e
            const { value } = target
            document.querySelector('#search button').disabled = !value

            if (value <= 0) return
            find_commande()
        })

//Vidage de la barre de recherche
document.querySelector('#search button')
        .addEventListener('click', (e) => {
            const { currentTarget: target } = e
            target.previousElementSibling.value = ''
            target.disabled = true
            find_commande()
        })

//Ouverture du catalogue
document.querySelectorAll('#create, #liste .noResult button')
        .forEach(each => {
                each.addEventListener('click', create_commande)
        })

//Récupération des commandes en cas d'échec de chargement
document.querySelector('#liste .onError button')
        .addEventListener('click', get_commandes)