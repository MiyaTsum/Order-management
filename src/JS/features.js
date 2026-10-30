import { art_commande, plat, plat_commandé } from "./component.js"

let filtre = 'total'

const commandes_liste = document.querySelector('#liste')
const modal = document.querySelector('#modal')

//Application du filtre
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

//Création d'un commande
export async function create_commande(){
    const win = modal.querySelector('article')
    const cancel = () => {
        win.innerHTML = ''
        win.classList.remove('catalogue', 'd-f', 'fd-cl')
        modal.style.display = 'none'
    }
    const table = await get_table()
    const max = table.length ? table.reduce((num_max, { num_table }) => num_max < num_table ? num_table : num_max, 0) : null
    let previous_value = ''
    let categorie = 'entrée'
    let new_com = [] //Pour stocker les plats sélectionnés et leur informations relatives

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
            <input type="number" min="1" ${!max ? 'disabled' : `max=${max}`} placeholder="num table">
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

    //Annulation de la création de la commande
    win.querySelectorAll('.header .head .exit, .footer .control .cancel')
        .forEach(each => {
            each.addEventListener('click', cancel)
        })

    //Gestion et filtrage des plats par catégorie
    btn_nav.forEach(each => {
            each.addEventListener('click', () => {
                for (let btn of btn_nav){
                    btn.classList[btn == each ? 'add' : 'remove']('selected')
                }
                categorie = each.dataset.categorie
                filterCatalogue(categorie)
            })
    })

    //Selection du numéro de table
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
            filterCatalogue('added')
            btn_nav.forEach(each => each.classList.remove('selected'))
        })

    const refresh = async () => {
        await get_plat(refresh)
        await filterCatalogue(categorie)

        win.querySelectorAll('.main .plat')
            .forEach(each => {
                const quantite = each.querySelector('.control .quantite input')
                const id = parseInt(each.dataset.id)

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
                const handleAdd = () => {
                    each.classList.add('added')

                    quantite.value = 1
                    quantite.addEventListener('input', change_value)
                    quantite.addEventListener('blur', handleBlur)

                    new_com.push({ id_plat: id, quantite: 1 })
                    btn_confirm.disabled = !num_table.value || Number(num_table.value) <= 0|| !new_com.length
                    btn_details.disabled = !new_com.length
                }
                const handleRemove = () => {
                    each.classList.remove('added')
                        
                    quantite.removeEventListener('input', change_value)
                    quantite.removeEventListener('blur', handleBlur)
                        
                    new_com = new_com.filter(({ id_plat: ID }) => ID != id)
                    btn_confirm.disabled = !num_table.value || !new_com.length
                    btn_details.disabled = !new_com.length
                        
                    for (let btn of btn_nav) if (btn.classList.contains('selected')) return
                        
                    filterCatalogue('added')
                        
                    if (!new_com.length){
                        btn_nav[0].classList.add('selected')
                        filterCatalogue('entrée')
                    }
                }

                each.querySelector('.control .add').addEventListener('click', handleAdd)
                each.querySelector('.control .remove').addEventListener('click', handleRemove)
                }
            )
    }

    refresh()

    win.querySelector('.main .onFailed')
        .addEventListener('click', refresh)
}

//Récupération du catalogue de plat à partir de l'API
async function get_plat(){
    const win = modal.querySelector('article .main')

    if (win.classList.contains('failed')) win.classList.remove('failed')
    win.classList.add('loading', 'ai-c', 'jc-c')

    try{
        const control = new AbortController() //Pour annuler la requête en cas de fermeture du module
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
            win.classList.replace('loading', 'failed')
            win.querySelector('.onFailed h3').textContent = 'Erreur de chargement du catalogue'
            return
        }

        const data = await response.json()

        win.classList.remove('loading', 'ai-c', 'jc-c')
        data.forEach(each => {
            win.appendChild(plat(...Object.values(each)))
        })
        
        return

    } catch (err){
        //En cas d'échec d'envoi de la requête
        win.classList.replace('loading', 'failed')
        win.querySelector('.onFailed h3').textContent = 'Erreur de chargement du catalogue'
        return
    }
}

async function filterCatalogue(categorie){
    const win = modal.querySelector('article .main')
    const plats = win.querySelectorAll('.plat')

    plats.forEach(each => {
        each.style.display = (categorie != 'added' ? each.dataset.categorie == categorie : each.classList.contains('added')) ? 'flex' : 'none'
    })

    return
}

async function post_commande(commande){
    const win = modal.querySelector('article')

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

    win.querySelector('.onFailed button:first-child')
        .addEventListener('click', () => {
            win.classList.remove('done', 'failed', 'catalogue', 'ai-c', 'jc-c')
            win.innerHTML = ''
            modal.style.display = 'none'
        })
    win.querySelector('.onFailed button:last-child')
        .addEventListener('click', () => {
            win.classList.remove('failed')
            post_commande(commande)
        })
    
    try{
        const response = await fetch(`http://${location.host}/commande`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(commande)
        })

        if (!response.ok){
            win.classList.replace('loading', 'failed')
            win.querySelector('.onFailed h3').textContent = "Erreur lors de l'envoi de la commande"
            return
        }

        win.classList.remove('done', 'catalogue', 'ai-c', 'jc-c')
        win.innerHTML = ''
        modal.style.display = 'none'
        get_commandes()
        return

    } catch (err){
        win.classList.replace('loading', 'failed')
        win.querySelector('.onFailed h3').textContent = 'Erreur de connexion au serveur'
        console.log(err)
        return
    }
}

export async function get_commandes(){
    const commandes_chargées = {}
    commandes_liste.querySelectorAll('.commandes')
                    .forEach(each => {
                        commandes_chargées[each.dataset.id] = true
                    })
    
    commandes_liste.classList.remove('error', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
    try{
        const response = await fetch(`http://${location.host}/commande`)

        if (!response.ok){
            commandes_liste.classList.add('error', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
            commandes_liste.querySelector('.onError h3').textContent = 'Erreur de chargement des commandes'
            return
        }

        const data = await response.json()
        const { length } = data
        
        if (length){
            data.forEach((each) => {
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
    document.querySelectorAll('header nav button')
            .forEach(each => {
                each.disabled = !length
            })
    document.querySelector('#search input')
            .disabled = !length

    return
}

export async function find_commande(){
    const { value } = document.querySelector('#search input')
    const commandes = commandes_liste.querySelectorAll('.commandes')
    
    commandes.forEach(each => {
        const filtrageParStatus = (filtre == 'total') ? 'block' : ((filtre == each.dataset.status) ? 'block' : 'none')
        const filtrageParId = (!value || `${each.dataset.id}`.startsWith(value)) ? (filtrageParStatus) : 'none'
        each.style.display = filtrageParId
    })
    commandes_liste.classList[(Array.from(commandes).every(each => getComputedStyle(each).display == 'none')) ? 'add' : 'remove']('empty', 'd-f', 'fd-cl', 'jc-c', 'ai-c')
}

async function delete_commande(id){
    let com_node = null
    let com_status = null
    const notif = document.createElement('div')
    const observer = new MutationObserver(([ mutation ]) => {
        if (mutation.attributeName == 'style'){
            const isShowed = getComputedStyle(com_node).display == 'block'

            if (isShowed) com_node.style.display = 'none'
        }
    })
    const undo = () => {
        clearTimeout(delay)
        notif.remove()
        observer.disconnect()
        com_node.dataset.status = com_status
        update_nav()
        find_commande()
    }
    const permDel = () => {
        notif.remove()
        com_node.remove()
        observer.disconnect()
    }
    const delay = setTimeout(async () => {
        try{
            const response =  await fetch(`/commande/${id}`, { method: 'DELETE' })

            if (!response.ok){
                undo()
                console.log((await response.json()).erreur)
                return
            }

            permDel()
        } catch(err){
            undo()
            console.log(err)
        }
    }, 10000)

    notif.classList.add('popup')
    notif.innerHTML = `
            <p>Commande supprimée</p>
            <button id="undo" class="main_button">
                <span>Annuler</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M7.12988 18.3101H15.1299C17.8899 18.3101 20.1299 16.0701 20.1299 13.3101C20.1299 10.5501 17.8899 8.31006 15.1299 8.31006H4.12988" stroke="#f1f0ff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.43012 10.8099L3.87012 8.24994L6.43012 5.68994" stroke="#f1f0ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
    `
    popup.appendChild(notif)
    
    for (const com of (commandes_liste.querySelectorAll('.commandes'))){
        if (com.dataset.id == id){
            com_node = com
            com_status = com.dataset.status
            break
        }
    }
    com_node.style.display = 'none'
    com_node.dataset.status = null
    observer.observe(com_node, { attributes: true })
    update_nav()

    notif.querySelector('button').addEventListener('click', undo)
}

export async function show_details(id, table, datetime, ds, total){
    const win = modal.querySelector('article')
    
    modal.style.display = 'flex'
    win.classList.add('details_commande', 'd-f', 'fd-cl')
    win.innerHTML = `
        <div class="head d-f ai-c">
            <button class='exit'>
                <svg class="d-f ai-c jc-c" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="#000000" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <h3>Details</h3>
            <select name="status">
                <option value="en cours" ${ds.status == 'en_cours' ? 'selected' : ''}>En cours</option>
                <option value="servie" ${ds.status == 'servie' ? 'selected' : ''}>Servie</option>
                <option value="payée" ${ds.status == 'payée' ? 'selected' : ''}>Payée</option>
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
            <h3 class="d-f jc-e ai-c"><span>Total: </span><span>$${total}</span></h3>
            <button class="main_button">Supprimer</button>
        </div>
    `
    win.querySelector('.exit')
        .addEventListener('click', () => {
                modal.style.display = 'none'
                win.classList.remove('details_commande', 'd-f', 'fd-cl')
                win.innerHTML = ''
        })

    win.querySelector('.head select')
        .addEventListener('change', async (e) => {
            const { currentTarget: target } = e
            const { value } = target
            const result = await patch_commande(id, value)
            let current_com = null

            for (const com of Array.from(commandes_liste.querySelectorAll('.commandes'))){
                if (Number(com.dataset.id) === id){
                    current_com = com
                    break
                }
            }
            const label = current_com.querySelector('.status')
            
            if (!result.success){
                target.value = ds.status
                return
            }

            label.classList.replace(ds.status, value === "en cours" ? 'en_cours' : value)
            label.textContent = value
            current_com.dataset.status = value === 'en cours' ? 'en_cours' : value

            await update_nav()
            await find_commande()
        })
    //Lors de la suppression de la commande
    win.querySelector('.footer button:last-child').addEventListener('click', () => {
        delete_commande(id)
        modal.style.display = 'none'
        win.innerHTML = ''
        win.classList.remove('details_commande', 'd-f', 'fd-cl')
    })
    get_details(id)
}

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
        const response = await fetch(`http://${location.host}/commande/${id}`, { signal: control.signal })

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

        const {lignes} = await response.json()
        for (const { id_detail, nom_plat, quantite, sous_total } of lignes){
            plat_liste.appendChild(plat_commandé(id_detail, nom_plat, quantite, sous_total))
        }

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

async function get_table(){
    try{
        const response = await fetch('/table')

        return response.ok ? await response.json() : []
    } catch(err){
        console.log(err)
        return []
    }
}
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