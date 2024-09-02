const urlBase = 'https://jsonplaceholder.typicode.com'

let postsList = 0

//TODO: METODO PARA TRAER TODOS LOS ITEMS
const getAllPosts = async () => {

    try {

        showLoader('loadingPosts', true)

        const response = await fetch(`${urlBase}/posts`)

        if(!response.ok) {
            throw new Error(`No se pudo obtener la lista de posts, vuelve a intentarlo mas tarde.`)
        }

        const result = await response.json()
        
        result.forEach(item => {
            renderPost(item)
        })

        //Guardo el total inicial para poder interactuar con los metodos 
        postsList = result.length

    } catch (error) {

        console.error(error)

    } finally {

        showLoader('loadingPosts', false)

    }

}

//TODO: METODO PARA AGREGAR UN NUEVO ITEM
const addPost = async () => {

    const body = document.getElementById('postDescription')
    const btn = document.getElementById('postAdd')

    try {

        showLoader('loadingAdd', true)

        body.setAttribute('disabled', 'disabled')
        btn.setAttribute('disabled', 'disabled')

        const response = await fetch(`${urlBase}/posts`, {
            method: 'POST',
            body: JSON.stringify({
                title: 'foo',
                body: body.value.trim(),
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })

        if(!response.ok){
            throw new Error(`No se pudo agregar el post, vuelve a intentarlo mas tarde.`)
        }

        const result = await response.json()

        //Incremento el contador
        postsList++
        //Modfico el id ya que la API devuelve siempre el mismo.
        result.id = postsList

        renderPost(result)

        body.value = ''

    } catch (error) {

        console.error(error)

    } finally {

        showLoader('loadingAdd', false)

        body.removeAttribute('disabled')
        btn.removeAttribute('disabled')

    }

}

//TODO: METODO PARA VALIDAR PUBLCACION
const validatePost = (element) => {
    let validate = true

    const bodyError = element.nextElementSibling
    const bodyValue = (element.type == 'textarea') ? element.value.trim() : element.textContent.trim()
    const maxChar = 140
    const minChar = 10
    
    if(bodyValue == ''){
        element.focus()
        showInputError(bodyError, 'Debe ingresar un texto válido.')
        validate = false
    } else if (bodyValue.length < minChar) {
        element.focus()
        showInputError(bodyError, `No puede ingresar menos de ${minChar} caracteres.`)
        validate = false
    } else if (bodyValue.length > maxChar) {
        element.focus()
        showInputError(bodyError, `No puede ingresar mas de ${maxChar} caracteres.`)
        validate = false
    } else {
        hideInputError(bodyError)
    }

    return validate
}

//TODO: MOSTRAR ERROR
const showInputError = (input, message) => {
    input.textContent = message
    input.style.display = 'inline-block'
}

const hideInputError = (input) => {
    input.textContent = ''
    input.style.display = 'none'
}

//TODO: METODO PARA EDITAR ITEM
const editPost = async (id) => {
    try {

        let body = ''
        document.querySelector(`.post-item[data-post-id="${id}"]`).childNodes.forEach(item => {
            if(item.className == 'post-item-text'){
                body = item
            }
        })

        const response = await fetch(`${urlBase}/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                id: id,
                title: 'foo',
                body: body.textContent.trim(),
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })

        if(!response.ok){
            throw Error(`al intentar actualizar el Post ${id}`)
        }

        const result = await response.json()

        body.textContent = result.body

        resetEditable()

    } catch (error) {
        const inputError = document.getElementById(`postDescriptionError${id}`)
        showInputError(inputError, error)
    }
}

//TODO: METODO PARA ELIMINAR ITEM
const deletePost = async (id) => {
    try {
        const result = await fetch(`${urlBase}/posts/${id}`, {
            method: 'DELETE',
        })

        if(!result.ok){
            throw Error('Error al intentar eliminar el Post')
        }

        document.querySelector(`.post-item[data-post-id="${id}"]`).remove()

    } catch (error) {
        console.error(error)
    }
}

//TODO: METODO PARA RESETEAR TODOS ULTIMO EDITABLE SI NO SE GUARDO Y SE QUIERE EDITAR OTRO ITEM
const resetEditable = () => {
    document.querySelectorAll('.post-cancel').forEach(link => {
        if(link.style.display != 'none'){
            link.click()
        }
    })
}

//TODO: METODO PARA VISUALIZAR UN ITEM
const renderPost = (post) => {
    const posts = document.getElementById('responseList')

    const item = document.createElement('div')
    item.classList.add('post-item')
    item.dataset.postId = post.id

    const itemTitle = document.createElement('div')
    itemTitle.classList.add('post-item-title')
    itemTitle.textContent = `Post #${post.id}`

    const itemActions = document.createElement('div')
    itemActions.classList.add('post-item-actions')

    const btnEdit = document.createElement('a')
    btnEdit.classList.add('post-item-actions-btn', 'post-edit')
    btnEdit.href = '#'
    btnEdit.innerHTML = `<i class="bx bxs-edit"></i>`
    btnEdit.addEventListener('click', function(e){
        e.preventDefault()
        resetEditable()
        const actions = this.parentNode.childNodes
        const textarea = this.parentNode.parentNode.nextSibling
        actions.forEach(action => {
            if(action.style.display == 'none'){
                action.style.display = 'inline-block'
            } else {
                action.style.display = 'none'
            }
        })
        textarea.setAttribute('contenteditable', true)
        textarea.focus()
    })
    itemActions.appendChild(btnEdit)

    const btnDelete = document.createElement('a')
    btnDelete.classList.add('post-item-actions-btn', 'post-delete')
    btnDelete.href = '#'
    btnDelete.innerHTML = `<i class="bx bxs-trash"></i>`
    btnDelete.addEventListener('click', function(e){
        e.preventDefault()
        deletePost(post.id)
    })
    itemActions.appendChild(btnDelete)

    const btnSave = document.createElement('a')
    btnSave.classList.add('post-item-actions-btn', 'post-update')
    btnSave.style.display = 'none'
    btnSave.href = '#'
    btnSave.innerHTML = `<i class="bx bxs-save"></i>`
    btnSave.addEventListener('click', function(e){
        e.preventDefault()
        if(!validatePost(itemText)){
            return false
        } else {
            editPost(post.id)
        }
    })
    itemActions.appendChild(btnSave)

    const btnCancel = document.createElement('a')
    btnCancel.classList.add('post-item-actions-btn', 'post-cancel')
    btnCancel.style.display = 'none'
    btnCancel.href = '#'
    btnCancel.innerHTML = `<i class="bx bx-x"></i>`
    btnCancel.addEventListener('click', function(e){
        e.preventDefault()
        const actions = this.parentNode.childNodes
        const textarea = this.parentNode.parentNode.nextSibling
        const inputError = document.getElementById(`postDescriptionError${post.id}`)
        actions.forEach(action => {
            if(action.style.display == 'none'){
                action.style.display = 'inline-block'
            } else {
                action.style.display = 'none'
            }
        })
        hideInputError(inputError)
        textarea.removeAttribute('contenteditable')
    })
    itemActions.appendChild(btnCancel)

    itemTitle.appendChild(itemActions)
    item.appendChild(itemTitle)

    const itemText = document.createElement('div')
    itemText.classList.add('post-item-text')
    itemText.textContent = `${post.body}`
    item.appendChild(itemText)

    const itemTextError = document.createElement('div')
    itemTextError.classList.add('error')
    itemTextError.id = `postDescriptionError${post.id}`
    item.appendChild(itemTextError)

    posts.prepend(item)
}

//TODO: METODO PARA MOSTRAR/OCULTAR LOADER
const showLoader = (element, status) => {
    const loading = document.getElementById(element)
    if(status){
        loading.style.display = 'flex'
    } else {
        loading.style.display = 'none'
    }
}

document.addEventListener('DOMContentLoaded', (event) => {

    document.getElementById('postAdd').addEventListener('click', function(e){
        e.preventDefault()
        const input = document.getElementById('postDescription')
        if(!validatePost(input)){
            return false
        } else {
            addPost()
        }
    })

    const currentDate = new Date()
    document.getElementById('currentDate').textContent = currentDate.toUTCString()
    getAllPosts()
})