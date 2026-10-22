import { art_commande } from "./component.js"

const flt_total = document.querySelector('#total')
const flt_attente = document.querySelector('#attente')
const flt_payée = document.querySelector('#payée')
const flt_servie = document.querySelector('#servie')
const sec_search = document.querySelector('#search')
const sect_commandes = document.querySelector('main')
const commandes_liste = sect_commandes.querySelector('div #liste')
const modal = document.querySelector('#modal')

//exemple pour tester l'interface
export let commandes = [
    { id: 1, table: 5, status: 'attente', heure: '2026/10/20 16:24:19' },
    { id: 2, table: 11, status: 'payée', heure: '2026/10/20 16:24:19' },
    { id: 3, table: 8, status: 'servie', heure: '2026/10/20 16:24:19' },
    { id: 4, table: 2, status: 'attente', heure: '2026/10/20 16:24:19' }
]
export let details_commande = [
    { id: 1, commande_id: 1, nom: 'Frite', quantite: 1, prix_uni: 4},
    { id: 2, commande_id: 1, nom: 'CocaCola', quantite: 1, prix_uni: 2},
    { id: 3, commande_id: 1, nom: 'Poulet frit', quantite: 1, prix_uni: 9},
    { id: 4, commande_id: 2, nom: 'Tacos', quantite: 2, prix_uni: 5},
    { id: 5, commande_id: 3, nom: 'Poulet frit', quantite: 2, prix_uni: 9},
    { id: 6, commande_id: 3, nom: 'Frite', quantite: 1, prix_uni: 4},
    { id: 7, commande_id: 4, nom: 'Tacos', quantite: 3, prix_uni: 5},
    { id: 8, commande_id: 4, nom: 'CocaCola', quantite: 3, prix_uni: 2}
]

let filtre = 'total'

//Mise à jour de liste lors de modificiations comme le filtrage ou la recherche
export function update_commandes_liste(){
    //Appliquage du filtre ('total', 'attente', 'servie', 'payée')
    let liste_filtrée = filtre !== 'total' ? commandes.filter(({ status }) => status == filtre) : commandes

    //Appliquage de la valeur de recherche (ID de commande)
    const { value } = sec_search.querySelector('input')
    let liste_affiché = value ? liste_filtrée.filter(({ id }) => `${id}`.startsWith(value)) : liste_filtrée

    //Modifications des statistiqueq en cas de modification
    flt_total.querySelector('span:last-child').textContent = `(${commandes.length})`
    flt_attente.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'attente').length})`
    flt_payée.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'payée').length})`
    flt_servie.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'servie').length})`

    if (!liste_affiché.length){
        //Aucune correspondance
        commandes_liste.classList.add('empty')
        commandes_liste.innerHTML = '<h3>Aucune commande</h3>'
    } else {
        commandes_liste.classList.remove('empty')
        commandes_liste.innerHTML = ''
        liste_affiché.forEach((each) => {
            commandes_liste.appendChild(art_commande(...Object.values(each)))
        })
    }
}

//En cas de mise à jour des informations sur la commande
export function update_win_details(status, id){
    const win_stat = modal.querySelector('article .status')

    modal.querySelectorAll('article .options button').forEach(each => {
        if (!each.dataset.status) return
        each.disabled = each.dataset.status == status
    })
    commandes = commandes.map(each => each.id == id ? {...each, status: status} : each)
    win_stat.classList.remove(...['attente', 'servie', 'payée'].filter(each => each != status))
    win_stat.classList.add(status)
    win_stat.textContent = status
    update_commandes_liste()
}

//Application du filtre
export function handleFilter(e){
    const { currentTarget } = e
    const { id } = currentTarget
    filtre = id
    update_commandes_liste()
    sect_commandes.querySelectorAll('header nav button').forEach(each => {
        if (each != currentTarget) each.classList.remove('selected')
    })
    currentTarget.classList.add('selected')
}

//Modification de la liste des commades
export function set_commandes(...values){
    commandes = values[0]
    details_commande = values[1]
}

export function delete_commande(id){
    commandes = commandes.filter(({ id: ID }) => ID != id)
    details_commande = details_commande.filter(({ commande_id: ID}) => ID != id)
}

//Création d'un commande
export function create_commande(){
    const win = modal.querySelector('article')
    let new_com = [] //Pour stocker les plats sélectionnés et leur informations relatives
    
    modal.style.display = 'flex'
    win.classList.add('catalogue')
    win.innerHTML = `
    <div class="head">
        <button class='exit'>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <h3>Catalogue</h3>
    </div>
    <div class="main"></div>
    <div class="footer"></div>
    `
    win.querySelector('.head .exit').addEventListener('click', () => {
        win.innerHTML = ''
        win.classList.remove('catalogue')
        modal.style.display = 'none'
    })

    get_plat()
}

//Récupération du catalogue de plat à partir de l'API
async function get_plat(){
    const win_content = modal.querySelector('article .main')

    if (win_content.classList.contains('failed')) win_content.classList.remove('failed')
    win_content.classList.add('loading')
    win_content.innerHTML = `
    <div class="loader"></div>
    <h3>Chargement du catalogue en cours...</h3>
    <p>Attendez un instant</p>
    `

    try{
        const control = new AbortController() //Pour annuler la reuête en cas de fermeture du module
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName == 'style'){
                    const isClose = getComputedStyle(modal).display == 'none'

                    if (isClose) control.abort()
                }
            })
        })
        const response = await fetch(`http://${location.host}/plat`, { signal: control.signal })

        observer.observe(modal, { attributes: true })
        
        if (!response.ok){
            //Dans le cas d'une erreur côté serveur ou client
            win_content.classList.replace('loading', 'failed')
            win_content.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
                <h3>Echec du chargement du catalogue</h3>
                <button>Réessayer</button>
            `
            win_content.querySelector('button').addEventListener('click', get_plat)
            return
        }

        const data = await response.json()

        win_content.classList.remove('loading')
        win_content.innerHTML = ''

        //Affichage du catalogue

    } catch (err){
        //En cas d'échec d'envoi de la requête
        win_content.classList.replace('loading', 'failed')
        win_content.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
            <h3>Erreur de connexion au serveur</h3>
            <button>Réessayer</button>
        `
        win_content.querySelector('button').addEventListener('click', get_plat)
        return
    }
}