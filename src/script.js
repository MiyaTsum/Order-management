const flt_total = document.querySelector('#total')
const flt_attente = document.querySelector('#attente')
const flt_payée = document.querySelector('#payée')
const flt_servie = document.querySelector('#servie')
const sec_search = document.querySelector('#search')
const btn_create = document.querySelector('#create')
const sect_commandes = document.querySelector('main')
const commandes_liste = sect_commandes.querySelector('div #liste')
const modal = document.querySelector('#modal')
const popup = document.querySelector('#popup')

let commandes = [
    { id: 1, table: 5, status: 'attente', heure: '2026/10/20 16:24:19' },
    { id: 2, table: 11, status: 'payée', heure: '2026/10/20 16:24:19' },
    { id: 3, table: 8, status: 'servie', heure: '2026/10/20 16:24:19' },
    { id: 4, table: 2, status: 'attente', heure: '2026/10/20 16:24:19' }
]
let details_commande = [
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

function art_commande(id, table, status, heure){
    const article = document.createElement('article')
    article.innerHTML = `
        <p><span>#${id}</span><span class="status ${status}">${status}</span></p>
        <p><strong>Table n°</strong><span>${table}</span>
        <p><strong>Créée le: </strong><span>${heure}</span></p>
        <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM8 13C7.44 13 7 12.55 7 12C7 11.45 7.45 11 8 11C8.55 11 9 11.45 9 12C9 12.55 8.56 13 8 13ZM12 13C11.44 13 11 12.55 11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12C13 12.55 12.56 13 12 13ZM16 13C15.44 13 15 12.55 15 12C15 11.45 15.45 11 16 11C16.55 11 17 11.45 17 12C17 12.55 16.56 13 16 13Z" fill="#a1a0af"/></svg>
        </button>
    `
    article.dataset.id = id
    article.classList.add('commandes')
    article.querySelector('button').addEventListener('click', () => {
        const inf = details_commande.filter(({ commande_id}) => commande_id == id)
        const win = modal.querySelector('article')
        modal.style.display = 'flex'
        win.classList.add('details_commande')
        win.innerHTML = `
            <div class="head">
                <button class='exit'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h2>Details</h2>
                <span class="status ${status}">${status}</span>
                <button class="edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/></svg>
                </button>
            </div>
            <div class="options">
                <button data-status="attente" class="edit_attente" ${status == 'attente' && 'disabled'}>Marquer en attente</button>
                <button data-status="servie" class="edit_servie" ${status == 'servie' && 'disabled'}>Marquer servie</button>
                <button data-status="payée" class="edit_payée" ${status == 'payée' && 'disabled'}>Marquer payée</button>
                <button class="supp_com">Supprimer</button>
            </div>
            <fieldset class="details">
                <legend>Détails commande</legend>
                <h3>Table n°${table}</h3>
                <p><strong>Créée le </strong><span>${heure}</span></p>
                <p><strong>ID: </strong><span>${id}</span></p>
            </fieldset>
            <fieldset class="plats">
                <legend>Plats commandés</legend>
            </fieldset>
            <fieldset class="bill">
                <legend>Total</legend>
                <h3>Total: ${inf.reduce((final, { quantite, prix_uni }) => final + (quantite * prix_uni), 0)}$</h3>
            </fieldset>
        `
        const exit = win.querySelector('.exit')
        const edit = win.querySelector('.edit')
        const options = win.querySelector('.options')
        inf.forEach(({ nom, quantite, prix_uni}) => {
            win.querySelector('.plats').innerHTML += `<p><strong>${nom} * ${quantite}</strong><strong>${prix_uni}$</strong></p>`
        })
        exit.addEventListener('click', () => {
            modal.style.display = 'none'
            win.innerHTML = ''
        })
        edit.addEventListener('click', (e) => {
            e.stopPropagation()
            options.style.display = 'flex'
            window.addEventListener('click', (e) => {
                const { target } = e
                if (!options.contains(target)) options.style.display = 'none'
            })
        })
        options.querySelector('.edit_attente').addEventListener('click', () => {
            update_win_details('attente', id)
        })
        options.querySelector('.edit_servie').addEventListener('click', () => {
            update_win_details('servie', id)
        })
        options.querySelector('.edit_payée').addEventListener('click', () => {
            update_win_details('payée', id)
        })
        options.querySelector('.supp_com').addEventListener('click', () => {
            popup.classList.remove('hidden')
            modal.style.display = 'none'
            win.innerHTML = ''
            const backup = [commandes, details_commande]
            commandes = commandes.filter(({ id: ID }) => ID != id)
            details_commande = details_commande.filter(({ commande_id: ID }) => ID != id)
            update_commandes_liste()
            const delay = setTimeout(() => {
                popup.classList.add('hidden')
                popup.removeEventListener('click', undo)
            }, 5000)
            const undo = () => {
                clearTimeout(delay)
                popup.classList.add('hidden')
                commandes = backup[0]
                details_commande = backup[1]
                update_commandes_liste()
            }
            popup.querySelector('button').addEventListener('click', undo)
        })
    })

    return article
}
function update_commandes_liste(){
    let liste_filtrée = filtre !== 'total' ? commandes.filter(({ status }) => status == filtre) : commandes
    const { value } = sec_search.querySelector('input')
    let liste_affiché = value ? liste_filtrée.filter(({ id }) => `${id}`.startsWith(value)) : liste_filtrée

    flt_total.querySelector('span:last-child').textContent = `(${commandes.length})`
    flt_attente.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'attente').length})`
    flt_payée.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'payée').length})`
    flt_servie.querySelector('span:last-child').textContent = `(${commandes.filter(({ status }) => status == 'servie').length})`

    if (!liste_affiché.length){
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
function update_win_details(status, id){
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

function handleFilter(e){
    const { currentTarget } = e
    const { id } = currentTarget
    filtre = id
    update_commandes_liste()
    sect_commandes.querySelectorAll('header nav button').forEach(each => {
        if (each != currentTarget) each.classList.remove('selected')
    })
    currentTarget.classList.add('selected')
}

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