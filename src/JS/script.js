import { update_commandes_liste, handleFilter, create_commande } from "./features.js"

const flt_total = document.querySelector('#total')
const flt_attente = document.querySelector('#attente')
const flt_payée = document.querySelector('#payée')
const flt_servie = document.querySelector('#servie')
const sec_search = document.querySelector('#search')
const btn_create = document.querySelector('#create')

window.addEventListener('DOMContentLoaded', update_commandes_liste)
flt_total.addEventListener('click', handleFilter)
flt_attente.addEventListener('click', handleFilter)
flt_payée.addEventListener('click', handleFilter)
flt_servie.addEventListener('click', handleFilter)
sec_search.querySelector('input').addEventListener('input', (e) => {
    const { target } = e
    const { value } = target
    const unvalid = !value || parseInt(value) < 1
    sec_search.querySelector('button').disabled = unvalid
    update_commandes_liste()
})
sec_search.querySelector('button').addEventListener('click', update_commandes_liste)
btn_create.addEventListener('click', create_commande)