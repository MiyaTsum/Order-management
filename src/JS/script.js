import { handleFilter, create_commande, get_commandes, find_commande } from "./features.js"

window.addEventListener('DOMContentLoaded', get_commandes)

document.querySelectorAll('body main header nav button')
        .forEach(each => {
            each.addEventListener('click', handleFilter)
        })

document.querySelector('#search input')
        .addEventListener('input', (e) => {
            const { currentTarget: target } = e
            const { value } = target
            document.querySelector('#search button').disabled = !value

            if (value <= 0) return
            find_commande()
        })

document.querySelector('#search button')
        .addEventListener('click', (e) => {
            const { currentTarget: target } = e
            target.previousElementSibling.value = ''
            target.disabled = true
            find_commande()
        })

document.querySelectorAll('#create, #liste .noResult button')
        .forEach(each => {
                each.addEventListener('click', create_commande)
        })

document.querySelector('#liste .onError button')
        .addEventListener('click', get_commandes)