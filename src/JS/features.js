import { art_commande, plat, plat_commandé } from "./component.js"

let filtre = 'total' //Stockage de la condition de filtrage ('total', 'en_cours', 'servie', 'payée')

const commandes_liste = document.querySelector('#liste')
const modal = document.querySelector('#modal')

//Modification de la condition de filtrage et mise à jour des états des bouttons
export function handleFilter(e){
    const { currentTarget: target } = e
    const { id } = target
    filtre = id

    document.querySelectorAll('header nav button')
            .forEach(each => {
                const isTarget = each == target
                const classes = isTarget ? ["secondary_button", "main_button"] : ["main_button", "secondary_button"]
                each.classList[isTarget ? 'add' : 'remove']('selected')
                each.classList.replace(...classes)
            })
    find_commande()
}

//Filtrage des commandes
export async function find_commande(){
    const { value } = document.querySelector('#search input') //Condition de recherche (ID)
    const commandes = commandes_liste.querySelectorAll('.commandes')
    
    commandes.forEach(each => {
        const { dataset } = each

        if (dataset.status == 'null'){
            each.style.display = 'none'
            return
        }

        //Filtrage en fonction de la condition de recherche par le filtre
        const filtrageParStatus = (filtre == 'total') ? 'block' : ((filtre == dataset.status) ? 'block' : 'none')

        //Filtrage en fonction de la condition de recherche par ID
        const filtrageParId = (!value || `${dataset.id}`.startsWith(value)) ? (filtrageParStatus) : 'none'
        each.style.display = filtrageParId
    })

    //Vérification en cas d'absence de correspondance
    const empty = Array.from(commandes).every(each => getComputedStyle(each).display == 'none')
    commandes_liste.classList[empty ? 'add' : 'remove']('empty', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
}

//Ouverture du catalogue et création d'une commande
export async function create_commande(){
    const win = modal.querySelector('article')

    //Fonction de fermeture du module
    const cancel = () => {
        win.innerHTML = ''
        win.classList.remove('catalogue', 'd-f', 'fd-cl')
        modal.style.display = 'none'
    }

    //Récupération de la liste des tables et définition du numéro de table maximale séléctionnables
    const table = await get_table() 
    const max = table.length ? table.reduce((num_max, { num_table }) => num_max < num_table ? num_table : num_max, 0) : null

    let previous_value = '' //Numéro de table (contrôle des saisies des utilisateurs)
    let categorie = 'entrée' //Condition de filtrage par catégorie (added, entrée, plat principal ou dessert)
    let new_com = [] //Stockage les plats sélectionnés et leur informations relatives

    //Ouverture du module et définition du contenu
    modal.style.display = 'flex'
    win.classList.add('catalogue', 'd-f', 'fd-cl')
    win.innerHTML = `
    <div class="header">
        <div class="head d-f ai-c">
            <button class='exit'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <h3>Catalogue</h3>
            <button disabled>Voir détails</button>
        </div>
        <div class="nav d-f jc-se">
            <button data-categorie="entrée" class="selected">Entrée</button>
            <button data-categorie="plat principal" >Plat principal</button>
            <button data-categorie="dessert" >Dessert</button>
        </div>
    </div>
    <div class="main d-f fd-cl">
        <div class="onLoading d-f fd-cl ai-c jc-c">
            <div class="loader"></div>
            <h3>Chargement du catalogue en cours...</h3>
            <p>Attendez un instant</p>
        </div>
        <div class="onFailed  d-f fd-cl ai-c jc-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
            <h3>Echec du chargement du catalogue</h3>
            <button class="main_button">Réessayer</button>
        </div>
    </div>
    <div class="footer d-f jc-sb ai-c">
        <div class="inf">
            <input type="number" min="1" ${!max ? 'disabled' : `max=${max} placeholder='Table 1-${max}'`} placeholder="num table">
        </div>
        <div class="control">
            <button class="cancel secondary_button">Annuler</button>
            <button class="confirm main_button" disabled>Confirmer</button>
        </div>
    </div>
    `

    const btn_details = win.querySelector('.header .head button:last-child')
    const btn_nav = win.querySelectorAll('.header .nav button')
    const btn_confirm = win.querySelector('.footer .control .confirm')
    const num_table = win.querySelector('.footer .inf input')

    //Fermeture et annulation de la création de la commande
    win.querySelectorAll('.header .head .exit, .footer .control .cancel')
        .forEach(each => {
            each.addEventListener('click', cancel)
        })

    //Filtrage des plats par catégorie
    btn_nav.forEach(each => {
            each.addEventListener('click', () => {
                for (let btn of btn_nav){
                    btn.classList[btn == each ? 'add' : 'remove']('selected')
                }
                categorie = each.dataset.categorie //Modification de la condition de filtrage
                filterCatalogue(categorie)
            })
    })

    //Selection du numéro de table et gestion des saisie utilisateurs
    num_table.addEventListener('input', (e) => {
        const { currentTarget: target } = e
        const { value } = target
        
        if (Number(value) > max) target.value = previous_value
        else {
            btn_confirm.disabled = !value || Number(value) <= 0 || !new_com.length
            previous_value = value
        }
    })

    //Confirmation et envoi des détails de la commande
    btn_confirm.addEventListener('click', () => {
        post_commande({ num_table: Number(num_table.value), plats: new_com})
    })

    //Lister les plats selectionnés
    btn_details.addEventListener('click', () => {
            categorie = 'added'
            filterCatalogue(categorie)
            btn_nav.forEach(each => each.classList.remove('selected'))
        })

    //Récupération et affichage du catalogue
    const refresh = async () => {
        await get_plat()
        await filterCatalogue(categorie)

        //Ajout des fonctionnalités de choix des plats
        win.querySelectorAll('.main .plat')
            .forEach(each => {
                const quantite = each.querySelector('.control .quantite input')
                const id = parseInt(each.dataset.id)

                //Modification de la quantite voulue du plat
                const change_value = (e) => {
                        const { target } = e
                        const { value } = target

                        if (value !== ''){
                            new_com = new_com.map(plat => {
                                const { id_plat } = plat
                            
                                return id_plat === id ? {...plat, quantite: parseInt(value)} : plat
                            })
                        }
                    }
                const handleBlur = (e) => {
                    const { target } = e
                    const { value } = target
                        
                    if (!value){
                        target.value = new_com.filter(({ id_plat }) => id_plat === id)[0].quantite
                    }
                }

                //Ajout du plat dans la liste new_com
                const handleAdd = () => {
                    each.classList.add('added')

                    quantite.value = 1
                    quantite.addEventListener('input', change_value)
                    quantite.addEventListener('blur', handleBlur)

                    new_com.push({ id_plat: id, quantite: 1 })
                    btn_confirm.disabled = !num_table.value || Number(num_table.value) <= 0 || !new_com.length
                    btn_details.disabled = !new_com.length
                }

                //Retrait du plat dans la liste new_com
                const handleRemove = () => {
                    each.classList.remove('added')
                        
                    quantite.removeEventListener('input', change_value)
                    quantite.removeEventListener('blur', handleBlur)
                        
                    new_com = new_com.filter(({ id_plat: ID }) => ID != id)
                    btn_confirm.disabled = !num_table.value || Number(num_table.value) <= 0 || !new_com.length
                    btn_details.disabled = !new_com.length
                        
                    if (categorie != 'added') return
                        
                    //En cas de suppression lors de l'affichage de la liste des plats séléctionnés
                    filterCatalogue('added')
                    //Liste des plats seléctionnés vides
                    if (!new_com.length){
                        btn_nav[0].classList.add('selected')
                        categorie = 'entrée'
                        filterCatalogue('entrée')
                    }
                }

                each.querySelector('.control .add').addEventListener('click', handleAdd)
                each.querySelector('.control .remove').addEventListener('click', handleRemove)
                }
            )
    }

    refresh()

    //En cas d'échec du chargement du catalogue
    win.querySelector('.main .onFailed')
        .addEventListener('click', refresh)
}

//Récupération de la liste des tables séléctionnable
async function get_table(){
    try{
        const response = await fetch('/table')
        const result = await response.json()

        if (!response.ok){
            //Dans le cas d'une erreur client ou serveur (erreur 400 ou 500)
            console.log(result.erreur)
            return []
        }

        return result
    } catch(err){
        //En cas d'échec d'envoi de la requête
        console.log(err)
        return []
    }
}

//Gestion du filtrage des plats du catalogue
async function filterCatalogue(categorie){
    const win = modal.querySelector('article .main')
    const plats = win.querySelectorAll('.plat')

    plats.forEach(each => {
        each.style.display = (categorie != 'added' ? each.dataset.categorie == categorie : each.classList.contains('added')) ? 'flex' : 'none'
    })

    return
}

//Confirmation de la création de la commande
async function post_commande(commande){
    const win = modal.querySelector('article')

    // Modification du contenu du module
    if (!win.classList.contains('done')) win.classList.add('done', 'ai-c', 'jc-c')
    win.classList.add('loading')
    win.innerHTML = `
        <div class="onLoading d-f fd-cl jc-c ai-c">
            <div class="loader"></div>
            <h3>Envoi de la commande en cours...</h3>
        </div>
        <div class="onFailed d-f fd-cl jc-c ai-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
            <h3></h3>
            <div class="d-f">
                <button class="secondary_button">Annuler</button>
                <button class="main_button">Réessayer</button>
            </div>
        </div>
    `

    // En cas d'échec et annulation de l'envoi de la commande
    win.querySelector('.onFailed button:first-child')
        .addEventListener('click', () => {
            // Fermeture du module
            win.classList.remove('done', 'failed', 'catalogue', 'ai-c', 'jc-c')
            win.innerHTML = ''
            modal.style.display = 'none'
        })

    // Tentative d'envoi de la commande après echec
    win.querySelector('.onFailed button:last-child')
        .addEventListener('click', () => {
            win.classList.remove('failed')
            post_commande(commande)
        })
    
    try{
        const response = await fetch('/commande', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(commande)
        })

        if (!response.ok){
            win.classList.replace('loading', 'failed')
            win.querySelector('.onFailed h3').textContent = "Erreur lors de l'envoi de la commande"
            console.log(await response.json())
            return
        }

        // Fermeture du module et mise à jour de la liste des commandes
        win.classList.remove('done', 'catalogue', 'ai-c', 'jc-c')
        win.innerHTML = ''
        modal.style.display = 'none'
        await get_commandes()
        return
    } catch (err){
        win.classList.replace('loading', 'failed')
        win.querySelector('.onFailed h3').textContent = 'Erreur de connexion au serveur'
        console.log(err)
        return
    }
}

// Récupération de la liste des commandes
export async function get_commandes(){
    const commandes_chargées = {} // Table de vérité des commandes déjà chargées
    commandes_liste.querySelectorAll('.commandes')
                    .forEach(each => {
                        commandes_chargées[each.dataset.id] = true
                    })
    
    commandes_liste.classList.remove('error', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
    try{
        const response = await fetch('/commande')

        if (!response.ok){
            commandes_liste.classList.add('error', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
            commandes_liste.querySelector('.onError h3').textContent = 'Erreur de chargement des commandes'
            return
        }

        const data = await response.json()
        const { length } = data
        
        // Eviter le cas d'une liste vide
        if (length){
            data.forEach((each) => {
                // Ajout dans la liste si la commande n'est pas encore déjà chargée et affichée
                if (!commandes_chargées[each.id_commande]) commandes_liste.appendChild(art_commande(...Object.values(each)))
            })
        }

        await find_commande()
        await update_nav()
        
    } catch (err){
        commandes_liste.classList.add('error', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
        commandes_liste.querySelector('.onError h3').textContent = 'Erreur de connexion au serveur'
        console.log(err)
        return 
    }
}

// Mise à jour des bouttons de navigation
async function update_nav(){
    const liste = commandes_liste.querySelectorAll('.commandes')
    let length = 0
    let en_cours = 0
    let servie = 0
    let payée = 0
    
    liste.forEach(({ dataset }) => {
        const { status } = dataset
        if (status == 'en_cours'){
            en_cours += 1
        } else if (status == 'servie'){
            servie += 1
        } else if (status == 'payée'){
            payée += 1
        }
    })
    length = en_cours + servie + payée

    document.querySelector('#en_cours span:last-child').innerHTML = `(${en_cours})`
    document.querySelector('#servie span:last-child').innerHTML = `(${servie})`
    document.querySelector('#payée span:last-child').innerHTML = `(${payée})`
    document.querySelector('#total span:last-child').innerHTML = `(${length})`
    document.querySelector('#search input').disabled = !length
    document.querySelectorAll('header nav button').forEach(each => {
                each.disabled = !length
            })

    return
}

//Récupération du catalogue de plat
async function get_plat(){
    const win = modal.querySelector('article .main')
    
    if (win.classList.contains('failed')) win.classList.remove('failed')
        win.classList.add('loading', 'ai-c', 'jc-c')
    
    try{
        const control = new AbortController() //Pour annuler la requête en cas de fermeture du module lors de l'envoie de la requête
        const observer = new MutationObserver(([mutation]) => {
            if (mutation.attributeName == 'style'){
                const isClose = getComputedStyle(modal).display == 'none'
                
                if (isClose) control.abort()
                }
        }) // Observation et vérification de la fermeture du module à chaque mutation de style
        const response = await fetch('/plat', { signal: control.signal })
        
        observer.observe(modal, { attributes: true }) // Activation de l'observateur
        
        if (!response.ok){
            win.classList.replace('loading', 'failed')
            win.querySelector('.onFailed h3').textContent = 'Erreur de chargement du catalogue'
            return
        }
        
        //Ajout des plats dans le catalogue
        const data = await response.json()
        win.classList.remove('loading', 'ai-c', 'jc-c')
        for (const plats of data){
            const p_node = plat(...Object.values(plats))
            win.appendChild(p_node)
        }
        
        return

    } catch (err){
        win.classList.replace('loading', 'failed')
        win.querySelector('.onFailed h3').textContent = 'Erreur de chargement du catalogue'
        return
    }
}

// Affichage des détails de la commannde et gestion des mises à jour et suppression
export async function show_details(id, dataset, total){
    const win = modal.querySelector('article')
    
    // Ouverture du module
    modal.style.display = 'flex'
    win.classList.add('details_commande', 'd-f', 'fd-cl')
    win.innerHTML = `
        <div class="head d-f ai-c">
            <button class='exit'>
                <svg class="d-f ai-c jc-c" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="#000000" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <h3>Details</h3>
            <select name="status">
                <option value="en cours" ${dataset.status == 'en_cours' ? 'selected' : ''}>En cours</option>
                <option value="servie" ${dataset.status == 'servie' ? 'selected' : ''}>Servie</option>
                <option value="payée" ${dataset.status == 'payée' ? 'selected' : ''}>Payée</option>
            </select>
        </div>
        <fieldset class="plats d-f fd-cl">
            <legend><strong>Plats commandés</strong></legend>
            <div class='onError d-f fd-cl ai-c jc-c'>
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
                <h3></h3>
                <button class="main_button">Réessayer</button>
            </div>
        </fieldset>
        <div class="footer d-f jc-sb">
            <h3 class="d-f jc-e ai-c"><span>Total: </span><span>$${Number(total).toFixed(2)}</span></h3>
            <button class="main_button">Supprimer</button>
        </div>
    `

    // Fermeture du module
    win.querySelector('.exit')
        .addEventListener('click', () => {
                modal.style.display = 'none'
                win.classList.remove('details_commande', 'd-f', 'fd-cl')
                win.innerHTML = ''
        })

    // Gestion des modifications de statut 
    win.querySelector('.head select')
        .addEventListener('change', async (e) => {
            const { currentTarget: target } = e
            const { value } = target
            const result = await patch_commande(id, value) // Resultat de mise à jour de la commande
            let current_com = null

            // En cas d'échec
            if (!result.success){
                target.value = dataset.status // Remise à la valeur initiale du statut de la commande
                return
            }

            // Mise à jour de l'affichage de la commande dans la liste et de son dataset
            for (const com of Array.from(commandes_liste.querySelectorAll('.commandes'))){
                if (Number(com.dataset.id) === id){
                    current_com = com
                    break
                }
            }
            const label = current_com.querySelector('.status')
            label.classList.replace(dataset.status, value === "en cours" ? 'en_cours' : value)
            label.textContent = value
            current_com.dataset.status = value === 'en cours' ? 'en_cours' : value

            await update_nav()
            await find_commande()
        })

    // Gestion de la suppression de la commande
    win.querySelector('.footer button:last-child').addEventListener('click', () => {
        delete_commande(id)
        modal.style.display = 'none'
        win.innerHTML = ''
        win.classList.remove('details_commande', 'd-f', 'fd-cl')
    })

    const details = await get_details(id)
    const lignes = details?.lignes

    // En cas de retour d'une liste non vide
    if (lignes && Array.isArray(lignes) && lignes.length){
        const plat_liste = win.querySelector('.plats')

        // Ajout des plats commandés
        for (const { id_detail, prix, nom_plat, quantite, sous_total } of lignes){
            plat_liste.appendChild(plat_commandé(id_detail, prix, nom_plat, quantite, sous_total))
        }
        win.querySelector('.footer h3 span:last-child').textContent = `$${Number(details.total).toFixed(2)}`
    }


    //Gestion de modification et suppression des plats commandés
    win.querySelectorAll('.plat_commandé')
        .forEach(each => {
            const { id_detail } = each.dataset
            const [ supp, edit ] = each.querySelectorAll('.control button')

            // Suppresion du plat dans les détails
            supp.addEventListener('click', async () => {
                const result = await delete_details(id_detail, id)

                if (result.erreur){
                    console.log(result.erreur)
                    return
                }

                // Retrait du plat de l'affichage
                each.remove()

                if (result.success == 'plat commandé supprimé'){
                    //Calcul du prix total
                    const pTotal =
                        Array.from(win.querySelectorAll('.plat_commandé')).reduce((total, { dataset }) => {
                            const { quantite, prix } = dataset
                        
                            return (Number(quantite) * Number(prix)) + total
                        }, 0)

                    // Mise à jour de l'affichage des détails du module (prix total) et de la commande correspondant dans la liste
                    win.querySelector('.footer h3 span:last-child').textContent = `$${(pTotal)}`
                    for (const com of commandes_liste.querySelectorAll('.commandes')){
                        if (Number(com.dataset.id) == id){
                            com.querySelector('h3').textContent =`Total: $${pTotal.toFixed(2)}`
                            break
                        }
                    }
                    return
                }

                // En cas où il n'y a plus de plat dans la liste des plats commandés
                for (const com of commandes_liste.querySelectorAll('.commandes')){
                    if (Number(com.dataset.id) == id){
                        // Retrait de la commande de l'affichage
                        com.remove()
                        break
                    }
                }
                await update_nav()
                await find_commande()

                modal.style.display = 'none'
                win.classList.remove('details_commande', 'd-f', 'fd-cl')
                win.innerHTML = ''
            })
            edit.addEventListener('click', () => {
                const [ cancl, confrm ] = each.querySelectorAll('.edit button')
                const quantite = each.querySelector('.edit input')
                let previous_value = ''

                each.classList.add('inEditing')
                quantite.focus()
                quantite.value = each.dataset.quantite

                // Gestion des saisies utilsateurs
                quantite.addEventListener('input', (e) => {
                    const { currentTarget: target } = e
                    const value = Number(target.value)
                    
                    confrm.disabled = !value || value < 0 || value != parseInt(value)

                    if (value >= 100){
                        target.value = previous_value
                        return
                    }

                    previous_value = String(value)
                })

                // Confirmation des modifications à appliquer
                confrm.addEventListener('click', async () => {
                    const result = await patch_detail(each.dataset.id_detail, Number(quantite.value))

                    if (result.erreur){
                        console.log(result.erreur)
                    } else {
                        const inf = each.querySelector('p span:first-child') // Nom_plat et quantite du plat
                        const [nom_plat] = inf.textContent.split('*')
                        const sous_total = each.querySelector('p span:last-child') // Sous-total du plat
    
                        // Mise à jour du dataset et des affichages (prix et quantite) des details et commandes
                        each.dataset.quantite = quantite.value
                        inf.textContent = nom_plat + '*' + ` ${quantite.value}`
                        sous_total.textContent = `$${(Number(each.dataset.prix) * Number(each.dataset.quantite)).toFixed(2)}`
    
                        // Calcul du nouveau prix total
                        const pTotal = 
                                Array.from(win.querySelectorAll('.plat_commandé')).reduce((total, { dataset }) => {
                                    const { quantite, prix } = dataset
                                
                                    return (Number(quantite) * Number(prix)) + total
                                }, 0)
                        win.querySelector('.footer h3 span:last-child').textContent = `$${(pTotal).toFixed(2)}`
                        for (const com of commandes_liste.querySelectorAll('.commandes')){
                            if (Number(com.dataset.id) == id){
                                com.querySelector('h3').textContent = `Total: $${pTotal.toFixed(2)}`
                                break
                            }
                        }
                    }

                    each.classList.remove('inEditing')
                })

                // Arrêt de la modification des details du plat
                cancl.addEventListener('click', function(e){
                    each.classList.remove('inEditing')
                    e.currentTarget.removeEventListener('click', this)
                })
                win.addEventListener('click', function(e){
                    const { target } = e

                    if (!each.contains(target)){
                        each.classList.remove('inEditing')
                        win.removeEventListener('click', this)
                    }
                })
            })
        })
}

// Mise à jour du status de la commande
async function patch_commande(id, status){
    try{
        const response = await fetch(`/commande/${id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        })
        const result = await response.json()

        return result
    } catch(err){
        console.log(err)
        return { erreur: 'Erreur de connexion serveur'}
    }
}

//Suppression de commande
async function delete_commande(id){
    const notif = document.createElement('div')

    // Back up en cas d'annulation 
    let com_node = null
    let com_status = null

    // Annulation de suppression
    const undo = () => {
        clearTimeout(delay)
        notif.remove()
        com_node.dataset.status = com_status
        update_nav()
        find_commande()
    }

    //Suppresion définitive
    const permDel = () => {
        notif.remove()
        com_node.remove()
    }

    // Retardement de l'envoi de la requête de suppression
    const delay = setTimeout(async () => {
        try{
            const response =  await fetch(`/commande/${id}`, { method: 'DELETE' })
            const result = await response.json()

            if (!response.ok){
                undo()
                console.log(result.erreur)
                return
            }

            console.log(result.success)
            permDel()
        } catch(err){
            undo()
            console.log(err)
        }
    }, 10000)

    // Affichage de la notification
    notif.classList.add('popup')
    notif.innerHTML = `
            <p>Commande supprimée</p>
            <button id="undo" class="main_button">
                <span>Annuler</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M7.12988 18.3101H15.1299C17.8899 18.3101 20.1299 16.0701 20.1299 13.3101C20.1299 10.5501 17.8899 8.31006 15.1299 8.31006H4.12988" stroke="#f1f0ff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.43012 10.8099L3.87012 8.24994L6.43012 5.68994" stroke="#f1f0ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
    `
    popup.appendChild(notif)
    
    // Recherche de la commande correspondante
    for (const com of (commandes_liste.querySelectorAll('.commandes'))){
        if (com.dataset.id == id){
            com_node = com
            com_status = com.dataset.status
            com_node.dataset.status = null
            break
        }
    }
    
    await update_nav()
    await find_commande()

    notif.querySelector('button').addEventListener('click', undo)
}


// Récupération des details d'une commande
async function get_details(id){
    const plat_liste = modal.querySelector('article .plats')

    try{
        const control = new AbortController()
        const observer = new MutationObserver(([mutation]) => {
            if (mutation.attributeName == 'style'){
                const isClosed = getComputedStyle(modal).display == 'none'

                if (isClosed) control.abort()
            }
        })
        const response = await fetch(`/commande/${id}`, { signal: control.signal })

        observer.observe(modal, { attributes: true })

        if (!response.ok){
            plat_liste.classList.add('erreur', 'jc-c', 'ai-c')
            plat_liste.querySelector('.onError h3').textContent = 'Erreur de chargement des détails'
            plat_liste.querySelector('button')
                        .addEventListener('click', () => {
                                plat_liste.classList.remove('erreur', 'jc-c', 'ai-c')
                                get_details(id)
                        })
            return
        }
        const data = await response.json()

        return data
    } catch (err){
        plat_liste.classList.add('erreur', 'jc-c', 'ai-c')
        plat_liste.querySelector('.onError h3').textContent = 'Erreur de connexion au serveur'
        plat_liste.querySelector('button')
                    .addEventListener('click', () => {
                            plat_liste.classList.remove('erreur', 'jc-c', 'ai-c')
                            get_details(id)
                    })
        console.log(err)
    }
}

// Suppression d'un plat commandé
async function delete_details(id_detail, id_commande){
    try{
        const response = await fetch(`/details/${id_detail}`, { 
            method: 'DELETE',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ id_commande: id_commande })
         })
        const result = await response.json()

        return result
    } catch(err){
        console.log(err)
        return { erreur: 'Erreur de connexion serveur'}
    }
}

//Modification des détails du plat commandé
async function patch_detail(id_detail, quantite){
    try{
        const response = await fetch(`/details/${id_detail}`, {
            method: 'PATCH',
            headers: {
                'content-type' : 'application/json'
            },
            body: JSON.stringify({ quantite: quantite })
        })
        const result = await response.json()

        return result
    } catch(err){
        console.log(err)
        return { erreur: 'Erreur de connexion au serveur'}
    }
}