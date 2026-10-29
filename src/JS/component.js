import { get_details } from "./features.js"

const modal = document.querySelector('#modal')
const popup = document.querySelector('#popup')

//Création d'un noeud pour les commandes
export function art_commande(id, table, datetime, status, total){
    const article = document.createElement('article')
    const statusClasse = status == 'en cours' ? 'en_cours' : status
    
    article.dataset.id = id
    article.dataset.status = statusClasse
    article.classList.add('commandes')
    article.innerHTML = `
        <p><span>#${id}</span><span class="status ${statusClasse}">${status}</span></p>
        <p><strong>Table n°</strong><span>${table}</span>
        <p><strong>Créée le: </strong><span>${datetime.toLocaleString()}</span></p>
        <h3>Total: $${total}</h3>
        <button title="Montrer détails" aria-label="Montrer détails">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM8 13C7.44 13 7 12.55 7 12C7 11.45 7.45 11 8 11C8.55 11 9 11.45 9 12C9 12.55 8.56 13 8 13ZM12 13C11.44 13 11 12.55 11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12C13 12.55 12.56 13 12 13ZM16 13C15.44 13 15 12.55 15 12C15 11.45 15.45 11 16 11C16.55 11 17 11.45 17 12C17 12.55 16.56 13 16 13Z" fill="#a1a0af"/></svg>
        </button>
    `

    //Pour regarder les détails de la commande
    article.querySelector('button').addEventListener('click', async () => {
        const plats = await get_details(id, modal)
        const win = modal.querySelector('article')
        
        modal.style.display = 'flex'
        win.classList.add('details_commande')
        win.innerHTML = `
            <div class="head">
                <button class='exit'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h3>Details</h3>
                <span class="status ${statusClasse}">${status}</span>
                <button class="edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/><path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="black" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5"/></svg>
                </button>
            </div>
            <div class="options">
                <button data-status="en_cours" class="edit_en_cours" ${statusClasse == 'en_cours' && 'disabled'}>Marquer en cours</button>
                <button data-status="servie" class="edit_servie" ${statusClasse == 'servie' && 'disabled'}>Marquer servie</button>
                <button data-status="payée" class="edit_payée" ${statusClasse == 'payée' && 'disabled'}>Marquer payée</button>
                <button class="supp_com">Supprimer</button>
            </div>
            <fieldset class="details">
                <legend><strong>Détails commande</strong></legend>
                <h3>Table n°${table}</h3>
                <p><strong>Créée le </strong><span>${datetime}</span></p>
                <p><strong>ID: </strong><span>${id}</span></p>
            </fieldset>
            <fieldset class="plats">
                <legend><strong>Plats commandés</strong></legend>
            </fieldset>
            <fieldset class="bill">
                <legend><strong>Total</strong></legend>
                <h3>Total: ${total}$</h3>
            </fieldset>
        `

        const options = win.querySelector('.options')

        win.querySelector('.exit')
            .addEventListener('click', () => {
                modal.style.display = 'none'
                win.classList.remove('details_commande')
                win.innerHTML = ''
            })
        win.querySelector('.edit')
            .addEventListener('click', (e) => {
                e.stopPropagation()
                options.style.display = 'flex'
                window.addEventListener('click', (e) => {
                    const { target } = e
                    if (!options.contains(target)) options.style.display = 'none'
                })
            })

        //Lors de la suppression de la commande
        options.querySelector('.supp_com').addEventListener('click', () => {
            const notif = document.createElement('div')
            const delay = setTimeout(() => {
                popup.classList.add('hidden')
                popup.removeEventListener('click', undo)
            }, 10000)
            const undo = () => {
                clearTimeout(delay)
                notif.remove()
            }
            
            notif.classList.add('popup')
            notif.innerHTML = `
                <p>Commande supprimée</p>
                <button id="undo">
                    <span>Annuler</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M7.12988 18.3101H15.1299C17.8899 18.3101 20.1299 16.0701 20.1299 13.3101C20.1299 10.5501 17.8899 8.31006 15.1299 8.31006H4.12988" stroke="#f1f0ff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.43012 10.8099L3.87012 8.24994L6.43012 5.68994" stroke="#f1f0ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            `
            popup.appendChild(notif)
            modal.style.display = 'none'
            win.innerHTML = ''

            notif.querySelector('button').addEventListener('click', undo)
        })

        const refresh = async () => {
            const plat_liste = win.querySelector('.plats')
            const plats = await get_details(id, modal)

            plat_liste.innerHTML = '<legend>Plats commandés</legend>'

            if (!Array.isArray(plats)){
                plat_liste.classList.add('erreur')
                plat_liste.innerHTML += `
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
                    <h3>Erreur de chargement...</h3>
                    <button>Réessayer</button>
                `
                plat_liste.querySelector('button')
                            .addEventListener('click', () => {
                                plat_liste.classList.remove('erreur')
                                refresh()
                            })
                return
            }

            plat_liste.innerHTML += `
                ${
                    plats.reduce((liste, { nom_plat, quantite, prix}) => {
                        return liste + `
                            <p>
                                <span>${nom_plat} * ${quantite}</span>
                                <span>$${prix}</span>
                            </p>
                        `
                    }, '')
                }
            `
        }
        
        refresh()
    })

    return article
}

export function plat(id, nom_plat, prix, categorie){
    const plat = document.createElement('div')
    plat.classList.add('plat')
    plat.dataset.id = id
    plat.dataset.categorie = categorie
    plat.innerHTML += `
        <div class="inf">
            <h4>${nom_plat}</h4>
            <h3>$${prix}</h3>
        </div>
        <div class="control">
            <div class="quantite">
                <span>x</span>
                <input type="number" min="1" max="99" >
            </div>
            <button class="add">Ajouter</button>
            <button class="remove">Retirer</button>
        </div>
    `

    return plat
}