import { show_details } from "./features.js"

//Création d'un noeud pour les commandes
export function art_commande(id, table, datetime, status, total){
    const article = document.createElement('article')
    const statusClasse = status == 'en cours' ? 'en_cours' : status
    
    article.dataset.id = id
    article.dataset.status = statusClasse
    article.classList.add('commandes')
    article.innerHTML = `
        <p class="d-f ai-c"><span>#${id}</span><span class="status ${statusClasse}">${status}</span></p>
        <p><strong>Table n°</strong><span>${table}</span>
        <p><strong>Créée le: </strong><span>${datetime.toLocaleString()}</span></p>
        <h3>Total: $${total}</h3>
        <button title="Montrer détails" aria-label="Montrer détails">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM8 13C7.44 13 7 12.55 7 12C7 11.45 7.45 11 8 11C8.55 11 9 11.45 9 12C9 12.55 8.56 13 8 13ZM12 13C11.44 13 11 12.55 11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12C13 12.55 12.56 13 12 13ZM16 13C15.44 13 15 12.55 15 12C15 11.45 15.45 11 16 11C16.55 11 17 11.45 17 12C17 12.55 16.56 13 16 13Z" fill="#a1a0af"/></svg>
        </button>
    `

    //Pour regarder les détails de la commande
    article.querySelector('button').addEventListener('click', () => {
        show_details(id, table, datetime, article.dataset, total)
    })

    return article
}

export function plat(id, nom_plat, prix, categorie){
    const plat = document.createElement('div')
    plat.classList.add('plat', 'd-f', 'fd-cl')
    plat.dataset.id = id
    plat.dataset.categorie = categorie
    plat.innerHTML += `
        <div class="inf d-f jc-sb">
            <h4>${nom_plat}</h4>
            <h3>$${prix}</h3>
        </div>
        <div class="control d-f ai-e jc-e">
            <div class="quantite">
                <span>x</span>
                <input type="number" min="1" max="99" >
            </div>
            <button class="add main_button">Ajouter</button>
            <button class="remove secondary_button">Retirer</button>
        </div>
    `

    return plat
}

export function plat_commandé(id_detail, nom_plat, quantite, sous_total){
    const plt_com = document.createElement('div')
    plt_com.classList.add('plat_commandé', 'd-f', 'fd-cl', 'jc-sb')
    plt_com.dataset.id_detail = id_detail
    plt_com.innerHTML = `
        <p class="d-f ai-c jc-sb">
            <span>${nom_plat} * ${quantite}</span>
            <span>$${sous_total}</span>
        </p>
        <div class="d-f jc-e">
            <button class="secondary_button">Supprimer</button>
            <button class="main_button">Modifier</button>
        </div>
    `

    return plt_com
}