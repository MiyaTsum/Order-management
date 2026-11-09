import { handleFilter, create_commande, get_commandes, find_commande, filtre, stat } from "./features.js"

const btn_nav = document.querySelectorAll('body main header nav button')
const input_search = document.querySelector('#search input')
const button_search = document.querySelector('#search button')
const button_create = document.querySelector('#create')
const noResult_button = document.querySelector('#liste .noResult button')
let delay = null
//Récuperation de la liste des commandes après rendu complet de la page
window.addEventListener('DOMContentLoaded', get_commandes)

//Filtrage de la liste des commandes par les bouttons des bouttons de navigation
btn_nav.forEach(each => {
            each.addEventListener('click', async (e) => {
                const { currentTarget: target } = e
                const { id } = target
                await handleFilter(id)
            })
        })

//Recherche des commandes en fonction de l'ID et de la condition de filtrage
input_search.addEventListener('input', async (e) => {
            clearTimeout(delay)
            const { currentTarget: target } = e
            let { value } = target
            value = Number(value)

            button_search.disabled = !value
            if (value <= 0 || value != parseInt(value)) return
            delay = setTimeout(async () => {
                btn_nav.forEach( each => each.disabled = true)
                button_create.disabled = true
                noResult_button.style.display = 'none'
                await find_commande(value)
            }, 1000)
        })

// Vidage de la barre de recherche
document.querySelector('#search button')
        .addEventListener('click', (e) => {
                clearTimeout(delay)
                const { currentTarget: target } = e

                input_search.value = ''
                btn_nav.forEach( each => each.disabled = false)
                button_create.disabled = false
                noResult_button.style.display = 'block'
                handleFilter(filtre)
        })

//Ouverture du catalogue
button_create.addEventListener('click', create_commande)
noResult_button.addEventListener('click', create_commande)

//Récupération des commandes en cas d'échec de chargement
document.querySelector('#liste .onError button')
        .addEventListener('click', get_commandes)

// Affichage des statistiques
document.querySelector('#statistiques')
        .addEventListener('click', () => {
                alert(`nombre de commandes: ${stat.nb_commandes},\nen cours: ${stat.en_cours},\nservie: ${stat.servie},\npayée: ${stat.payée},\nchiffres d'affaires: ${stat.chiffres_affaires},\ntotal moyen: ${stat.total_moyen},\ntotal minimum: ${stat.total_min},\ntotal maximum: ${stat.total_max}`)
        })