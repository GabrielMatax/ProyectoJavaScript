let lista = [];
let carrito = [];

const carritobtn = document.querySelector(".carrito__btn");
const btnVaciarCarrito = document.querySelector(".btn--vaciar");
const btnCarritoCompra = document.querySelector(".btn--comprar");
const contenedorProductos = document.querySelector("table tbody");
const contenedorTotal = document.querySelector("table tfoot");
let avisoCantidad = document.querySelector(".carrito__btn");

const cards = () => {
    for (const card of lista) {
        let contenedor = document.querySelector(".producto");
        let cards = document.createElement("div");
        cards.className = "producto__card"
        cards.innerHTML = 
        `
            <img class="producto__img" src=${card.imagen} alt="">
            <div class="producto__datos">
                <h3>${card.nombre}</h3>
                <h4>$${card.precio}</h4>
                <div id="${card.id}" class="producto__comprar">
                    <input class="acumulador" type="number">
                    <button class="btn-cantidad btn-cantidad--sumar">
                        <i class="fi fi-br-plus"></i>
                            </button>
                    <button class="btn-cantidad btn-cantidad--restar">
                        <i class="fi fi-br-minus"></i>
                    </button>
                    <button class="btn--agregar"><i class="fi fi-br-shopping-cart-add"></i></button>
                </div>
            </div>
                
        `
        contenedor.append(cards);
    }
};

/*  Sumar y restar productos */
const eventosCards = () => {
    for (const producto of lista) {
        let ids = `#${producto.id} .btn-cantidad--sumar`;
        let botonSuma = document.querySelector(ids);
        let acumular = 0;
        botonSuma.addEventListener("click", function() {
            ids = `#${producto.id} .acumulador`;
            let id = document.querySelector(ids);
            id.value = ++acumular;
        })
        ids = `#${producto.id} .btn-cantidad--restar`;
        let botonRestar = document.querySelector(ids);
            botonRestar.addEventListener("click", function() {
            ids = `#${producto.id} .acumulador`;
            let id = document.querySelector(ids);
            (parseInt(id.value) > 0 && parseInt(id.value) != 1) ? id.value = --acumular : id.value = "";
            }
        )
    };
}

const ListaDeCompra = () => {
    contenedorProductos.innerHTML = "";
    contenedorTotal.innerHTML = "";
    totalProductos = [];
    for (const producto of carrito) {
    //Crear filas en el carrito
    let fila = document.createElement("tr");
    fila.innerHTML =
        `
        <td>${producto.nombre}</td>
        <td>${producto.unidad}</td>
        <td>$${producto.precio*producto.unidad}</td>
        `
    contenedorProductos.append(fila);
    //Precio Total
    totalProductos.push(producto.precio*producto.unidad)
    }
    let total = document.createElement("tr");
    if (totalProductos != 0){
    const sumar = totalProductos.reduce(function(valorAnterior, valorActual){
        return valorAnterior + valorActual;
        });
    total.innerHTML = 
        `
        <td>Total</td>
        <td colspan="2">$${sumar}</td>
        `
    contenedorTotal.append(total);
}
}

const pedirDatosLocalStorage = () => {
    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        JSON.parse(localStorage.getItem(clave));
        carrito.push(JSON.parse(localStorage.getItem(clave)));
    }
}

/* Producto al carrito y localstorage */
const AgregarAlCarrito = () => {
    for (const producto of lista) {
        let cantidad = document.querySelector(`#${producto.id} .acumulador`)
        let btnAgregar = document.querySelector(`#${producto.id} .btn--agregar`);
        
        btnAgregar.addEventListener("click", function(){
        producto.unidad = parseInt(cantidad.value);
        localStorage.setItem(`${producto.nombre}`, JSON.stringify(producto));
        carrito = [];
        pedirDatosLocalStorage();
        ListaDeCompra();
        avisoCantidad.innerHTML =
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span>${localStorage.length}</span>                        
            `
        });
    }
}

const pedirProductos = async () => {
    let pedir = await fetch("../productos.JSON");
    lista = await pedir.json();

    cards();
    eventosCards();
    AgregarAlCarrito();
}

const pagar = async () => {
    const productosToMap = carrito.map(Element => {
            let nuevoElemento = 
            {
                title: Element.nombre,
                description: "...",
                picture_url: Element.imagen,
                category_id: Element.id,
                quantity: Element.unidad,
                currency_id: "ARS",
                unit_price: Element.precio
            }
            return nuevoElemento
    })
    let response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            Authorization: "Bearer TEST-7218211084979263-062019-d7692cc9419a26d01b5855c5003f0c18-222191317"
        },
        body: JSON.stringify({
            items: productosToMap
        })
    })
    console.log(productosToMap);
    let data = await response.json()
    console.log(data)
    window.open(data.init_point, "_blank")
}

if (localStorage.length != 0) {
    pedirDatosLocalStorage();
    avisoCantidad.innerHTML = 
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span>${localStorage.length}</span>
                                    
            `
}
ListaDeCompra();
pedirProductos();

/* Menu Carrito */
carritobtn.addEventListener("click", function(){
    let activar = document.querySelector("#carrito")
    activar.classList.toggle("carrito__contenedor--ocultar")
    }
);

/* Comprar o Cancelar */
btnCarritoCompra.addEventListener("click", function (){
    pagar(); 
});

btnVaciarCarrito.addEventListener("click", function(){
    swal({
        title: "Vaciar carrito",
        text: "¿Estas seguro?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
        swal("Carrito de compras vaciado", {
            icon: "success",   
        });
        contenedorProductos.innerHTML = "";
        contenedorTotal.innerHTML = "";
        localStorage.clear();
        avisoCantidad.innerHTML = 
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span></span>
                                    
            `
        }
    });
});