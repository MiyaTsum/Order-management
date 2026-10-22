import { 
    update_commandes_liste, 
    update_win_details, 
    commandes, 
    details_commande,
    set_commandes,
    delete_commande
} from "./features.js"

const modal = document.querySelector('#modal')
const popup = document.querySelector('#popup')

//Création d'un noeud pour les commandes
export function art_commande(id, table, status, heure){
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

    //Pour regarder les détails de la commande
    article.querySelector('button').addEventListener('click', () => {
        //récupérer les plats relatifs à la commande
        const inf = details_commande.filter(({ commande_id}) => commande_id == id)
        const win = modal.querySelector('article')

        modal.style.display = 'flex'
        win.classList.add('details_commande')
        win.innerHTML = `
            <div class="head">
                <button class='exit'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h3>Details</h3>
                <span class="status ${status}">${status}</span>
                <button class="edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/></svg>
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

        inf.forEach(({ nom, quantite, prix_uni }) => {
            win.querySelector('.plats').innerHTML += `<p><strong>${nom} * ${quantite}</strong><strong>${prix_uni}$</strong></p>`
        })

        exit.addEventListener('click', () => {
            modal.style.display = 'none'
            win.classList.remove('details_commande')
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

        //Lors de la suppression de la commande
        options.querySelector('.supp_com').addEventListener('click', () => {
            const backup = [commandes, details_commande] //Sauvegarde en cas d'annnulation de la suppression de la commande
            const delay = setTimeout(() => {
                popup.classList.add('hidden')
                popup.removeEventListener('click', undo)
            }, 5000)
            const undo = () => {
                clearTimeout(delay)
                popup.classList.add('hidden')
                set_commandes(...backup) //Restauration des valeurs précédentes
                update_commandes_liste()
            }

            popup.classList.remove('hidden')
            modal.style.display = 'none'
            win.innerHTML = ''
            delete_commande(id) //Suppression de la commande
            update_commandes_liste()

            popup.querySelector('button').addEventListener('click', undo)
        })
    })

    return article
}