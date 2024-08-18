const result = document.querySelector('#resultado')
const form = document.querySelector('#formulario')
const pager = document.querySelector('#paginacion')

const regsPerPage = 24
let totalPages
let iterator //iterará en funcion del total de paginas. Si son 3 paginas el iterador será 1, 2, 3
let currentPage = 1 //es la pagina actual, por defecto le ponemos uno para cuando hagamos la primera consulta siempre sea uno, pero pueda ser modificado

//con window.onload, lo que hacemos es registrar el submit para el formulario
window.onload = () => {
    form.addEventListener('submit', validateForm)
}

//validamos el formularoop
function validateForm(e) {
    e.preventDefault()

    const search = document.querySelector('#termino').value

    if (search === '') {
        showAlert("Agrega un término de búsqueda")
        return
    }
    searchImages()
}

function showAlert(message) {

    const alertExist = document.querySelector('.bg-red-100') // para que no se ejecute varias veces
    if (!alertExist) {
        const alert = document.createElement('P')
        alert.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center')
        alert.innerHTML = `
        <strong class="font-bold"> Error! </strong>
        <span class="block sm:inline">${message}</span>
    `
        form.appendChild(alert)

        setTimeout(() => {
            alert.remove()
        }, 3000)
        return
    }

}

function searchImages() {

    const search = document.querySelector('#termino').value // esto es el valor de lo que el usuario ha escrito
    const APIkey = '39576854-1b83847dfe1c6757ab3e0aa54'
    const url = `https://pixabay.com/api/?key=${APIkey}&q=${search}&per_page=${regsPerPage}&page=${currentPage}`
    fetch(url)
        .then(res => res.json())
        .then(data => {
            totalPages = calculatePages(data.totalHits) //en función del totalHits que nos es otra cosa que el total de registros de vuelta de la consulta
            showImages(data.hits)
        })
        .catch(error => console.log(error))
}

// Generador nos permite iterar sobre todos los registros y saber cuándo ha llegado al final. x ejemplo le pasamos que hay un total de 17 pags, pues recorrera de la 1 a la 17
function* createPager(total) {
    for (let i = 1; i <= total; i++) {
        yield i
    }
}

function calculatePages(total) {
    return parseInt(Math.ceil(total / regsPerPage))
}

function showImages(images) {

    // En primer lugar borramos los resultados previos de resultado
    while (result.firstChild) {
        result.removeChild(result.firstChild)
    }

    //Iterar array de images y construir HTML
    images.forEach(image => {
        const { previewURL, likes, views, largeImageURL } = image

        result.innerHTML += `
            <div class="w-1/2 md_w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white">
                    <img class="w-full" src="${previewURL}">
                    <div class="p-4">
                        <p class="font-bold"> ${likes} <span class="font-light"> Me gusta </span> </p>
                        <p class="font-bold"> ${views} <span class="font-light"> Visualizaciones </span> </p>
                        <a 
                            class="block w-full bg-blue-800 hover:bg-blue-500 text-white uppercase font-bold text-center rounded mt-5 p-1" 
                            href="${largeImageURL}" target="_blank" rel="noopener noreferrer"
                        > 
                            Ver imagen HQ
                        </a>
                    </div>
                </div>
            </div>
        `
    })

    //Limpiar paginador anterior
    while (pager.firstChild) {
        pager.removeChild(pager.firstChild)
    }

    // Generar e imprimir HTML con el paginador
    printPager()
}

function printPager() {
    //con el iterador vamos a iterar en función del total de paginas
    iterator = createPager(totalPages)

    while (true) {
        const { value, done } = iterator.next()
        if (done) return //iterator.next().done no es otra cosa que es true o false si ha acabado de iterar. cuando llegue al total de paginas pasa a true
        // iterador.next().value es el valor de cada pagina en cada momento de la iteración

        //Caso contrario, es decir que no esté done iterator.next(), si hay 10 paginas que no haya llegado al 10 x ejemplo
        const btn = document.createElement('A')
        btn.href = '#'
        btn.dataset.page = value
        btn.textContent = value
        btn.classList.add('siguiente', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'font-bold', 'mb-4', 'uppercase', 'rounded')

        btn.onclick = () => {
            currentPage = value; // el valor en función del click que le hagamos, nos actualiza la pagina actual
            searchImages() //volvemos a consultar la api con una nueva imagen
        }

        pager.appendChild(btn)
    }
}