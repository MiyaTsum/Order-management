import { art_commande, plat } from "./component.js"

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
                        each.classList[each == target ? 'add' : 'remove']('selected')
                    })
    find_commande()
}

//Création d'un commande
export async function create_commande(){
    const win = modal.querySelector('article')
    let categorie = 'entrée'
    let new_com = [] //Pour stocker les plats sélectionnés et leur informations relatives
    const cancel = () => {
        win.innerHTML = ''
        win.classList.remove('catalogue')
        modal.style.display = 'none'
    }

    modal.style.display = 'flex'
    win.classList.add('catalogue')
    win.innerHTML = `
    <div class="header">
        <div class="head">
            <button class='exit'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <h3>Catalogue</h3>
            <button disabled>Voir détails</button>
        </div>
        <div class="nav">
            <button data-categorie="entrée" class="selected">Entrée</button>
            <button data-categorie="plat principal" >Plat principal</button>
            <button data-categorie="dessert" >Dessert</button>
        </div>
    </div>
    <div class="main">
        <div class="onLoading">
            <div class="loader"></div>
            <h3>Chargement du catalogue en cours...</h3>
            <p>Attendez un instant</p>
        </div>
        <div class="onFailed">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
            <h3>Echec du chargement du catalogue</h3>
            <button>Réessayer</button>
        </div>
    </div>
    <div class="footer">
        <div class="inf">
            <input type="number" min="1" placeholder="num table">
        </div>
        <div class="control">
            <button class="cancel">Annuler</button>
            <button class="confirm" disabled>Confirmer</button>
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
        btn_confirm.disabled = !value || !new_com.length
    })

    //Confirmation et envoi des détails de la commande
    btn_confirm.addEventListener('click', () => {
        post_commande({ id_table: Number(num_table.value), plats: new_com})
    })

    //Lister les plats selectionnés
    btn_details.addEventListener('click', () => {
            filterCatalogue('added')
            btn_nav.forEach(each => each.classList.remove('selected'))
        })

    const refresh = async () => {
        await get_plat(refresh)
        await filterCatalogue(categorie)

        win.querySelectorAll('.main .plat').forEach(each => {
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
            btn_confirm.disabled = !num_table.value || !new_com.length
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
        })
    }

    refresh()

    win.querySelector('.main .onFailed')
        .addEventListener('click', refresh)
}

//Récupération du catalogue de plat à partir de l'API
async function get_plat(){
    const win = modal.querySelector('article .main')

    if (win.classList.contains('failed')) win.classList.remove('failed')
    win.classList.add('loading')

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

        win.classList.remove('loading')
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

    if (!win.classList.contains('done')) win.classList.add('done')
    win.classList.add('loading')
    win.innerHTML = `
        <div class="onLoading">
            <div class="loader"></div>
            <h3>Envoi de la commande en cours...</h3>
        </div>
        <div class="onFailed">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM11.2499 7.75C11.2499 7.34 11.5899 7 11.9999 7C12.4099 7 12.7499 7.34 12.7499 7.75V13C12.7499 13.41 12.4099 13.75 11.9999 13.75C11.5899 13.75 11.2499 13.41 11.2499 13V7.75ZM12.9199 16.63C12.8699 16.75 12.7999 16.86 12.7099 16.96C12.5199 17.15 12.2699 17.25 11.9999 17.25C11.8699 17.25 11.7399 17.22 11.6199 17.17C11.4899 17.12 11.3899 17.05 11.2899 16.96C11.1999 16.86 11.1299 16.75 11.0699 16.63C11.0199 16.51 10.9999 16.38 10.9999 16.25C10.9999 15.99 11.0999 15.73 11.2899 15.54C11.3899 15.45 11.4899 15.38 11.6199 15.33C11.9899 15.17 12.4299 15.26 12.7099 15.54C12.7999 15.64 12.8699 15.74 12.9199 15.87C12.9699 15.99 12.9999 16.12 12.9999 16.25C12.9999 16.38 12.9699 16.51 12.9199 16.63Z" fill="#7672F1"/></svg>
            <h3></h3>
            <div>
                <button>Annuler</button>
                <button>Réessayer</button>
            </div>
        </div>
    `

    win.querySelector('.onFailed button:first-child')
        .addEventListener('click', () => {
            win.classList.remove('done', 'failed', 'catalogue')
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
            win.querySelector('.onFailed h3').textContent = 'Erreur lors du chargement du catalogue'
            return
        }

        win.classList.remove('done', 'catalogue')
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
    commandes_liste.classList.remove('error')

    try{
        const response = await fetch(`http://${location.host}/commande`)

        if (!response.ok){
            commandes_liste.classList.add('error')
            commandes_liste.querySelector('.onError h3').textContent = 'Erreur de chargement des commandes'
            return
        }

        const data = await response.json()
        const { length } = data
        
        if (length){
            data.forEach((each) => {
                commandes_liste.appendChild(art_commande(...Object.values(each)))
            })
        }

        find_commande()

        let en_cours = 0
        let servie = 0
        let payée = 0
        
        document.querySelector('#total span:last-child').innerHTML = `(${length})`
        data.forEach(({ statut }) => {
            if (statut == 'en cours'){
                en_cours += 1
                document.querySelector('#en_cours span:last-child').innerHTML = `(${en_cours})`
            } else if (statut == 'servie'){
                servie += 1
                document.querySelector('#servie span:last-child').innerHTML = `(${servie})`
            } else {
                payée += 1
                document.querySelector('#payée span:last-child').innerHTML = `(${payée})`
            }
        })
        document.querySelectorAll('header nav button')
                .forEach(each => {
                    each.disabled = !length
                })
        document.querySelector('#search input')
                .disabled = !length

        
    } catch (err){
        commandes_liste.classList.add('error')
        commandes_liste.querySelector('.onError h3').textContent = 'Erreur de connexion au serveur'
        console.log(err)
        return 
    }
}

export function find_commande(){
    const { value } = document.querySelector('#search input')
    const commandes = commandes_liste.querySelectorAll('.commandes')
    
    commandes.forEach(each => {
        const filtrageParStatus = (filtre == 'total') ? 'block' : ((filtre == each.dataset.status) ? 'block' : 'none')
        const filtrageParId = (!value || `${each.dataset.id}`.startsWith(value)) ? (filtrageParStatus) : 'none'
        each.style.display = filtrageParId
    })
    commandes_liste.classList[(Array.from(commandes).every(each => getComputedStyle(each).display == 'none')) ? 'add' : 'remove']('empty')
}

export async function get_details(id, node){
    try{
        const control = new AbortController()
        const observer = new MutationObserver(([mutation]) => {
            if (mutation.attributeName == 'style'){
                const isClosed = getComputedStyle(node).display == 'none'

                if (isClosed) control.abort()
            }
        })
        const response = await fetch(`http://${location.host}/commande/${id}`, { signal: control.signal })

        observer.observe(node, { attributes: true })

        if (!response.ok){
            const classeStatus = parseInt(response.status / 100)
            if (classeStatus == 4) return 'erreur client'
            else if (classeStatus == 5) return 'erreur serveur'
        }

        return (await response.json()).lignes
    } catch (err){
        console.log(err)
        return 'erreur connexion'
    }
}