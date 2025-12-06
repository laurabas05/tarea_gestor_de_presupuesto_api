import {
    listarGastos,
    cargarGastosDesdeAPI,
    calcularTotalGastos,
} from './gestionPresupuestoAPI.js';

import {
    obtenerGastosUsuario,
    crearGastoAPI,
    actualizarGastoAPI,
    borrarGastoAPI
} from './apiGastos.js';

// variable q va a guardar el usuario seleccionado
let usuarioActual = null;

// declaro los contenedores q vamos a modificar
const contenedorFormulario = document.getElementById("formularioGastos");
const contenedorListado = document.getElementById("listadoGastos");
const pTotalGastos = document.getElementById("total");

// bloquea el submit de TODO el documento
document.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
})

// función para recargar datos desde la api
async function recargarDatos() {
    // llama a la api para obtener los gastos del usuario
    const datos = await obtenerGastosUsuario(usuarioActual);
    // carga los datos en el store local
    cargarGastosDesdeAPI(datos);
    // actualiza la vista
    actualizarListado();
}

function actualizarListado() {
    // limpia el contenedor de los gastos y muestra los gastos actuales
    contenedorListado.innerHTML = "";
    const gastos = listarGastos();

    // para cada gasto se crea y añade un componente 'mi-gasto'
    gastos.forEach((gasto) => {
        const elemento = document.createElement("mi-gasto");
        elemento.datos = gasto;
        contenedorListado.appendChild(elemento);
    });

    // calculo del total de los gastos
    const total = calcularTotalGastos();
    pTotalGastos.textContent = total + " €";
}

function crearFormularioGasto() {
    const form = document.createElement("form");

    // ahora, para cada parametro, le declaro su contenedor,
    // y dentro su label y su input. Esto lo hago por adaptarme
    // al css que ya venía en el proyecto.
    const divDescripcion = document.createElement("div");
    divDescripcion.className = "form-control";
    const labelDescripcion = document.createElement("label");
    labelDescripcion.textContent = "Descripción:";
    const inputDescripcion = document.createElement("input");
    inputDescripcion.type = "text";
    inputDescripcion.id = "descripcion";
    inputDescripcion.required = true;
    divDescripcion.append(labelDescripcion, inputDescripcion)

    const divValor = document.createElement("div");
    divValor.className = "form-control";
    const labelValor = document.createElement("label");
    labelValor.textContent = "Valor (€):"
    const inputValor = document.createElement("input");
    inputValor.type = "number";
    inputValor.id = "valor";
    inputValor.step = "0.01" // para q acepte decimales
    inputValor.required = true;
    divValor.append(labelValor, inputValor);

    const divFecha = document.createElement("div");
    divFecha.className = "form-control";
    const labelFecha = document.createElement("label");
    labelFecha.textContent = "Fecha:";
    const inputFecha = document.createElement("input");
    inputFecha.type = "date";
    inputFecha.id = "fecha";
    divFecha.append(labelFecha, inputFecha);

    const divEtiquetas = document.createElement("div");
    divEtiquetas.className = "form-control";
    const labelEtiquetas = document.createElement("label");
    labelEtiquetas.textContent = "Etiquetas (separadas por coma):";
    const inputEtiquetas = document.createElement("input");
    inputEtiquetas.type = "text";
    inputEtiquetas.id = "etiquetas";
    inputEtiquetas.placeholder = "Etiquetas del gasto";
    divEtiquetas.append(labelEtiquetas, inputEtiquetas);

    const botonAniadirGasto = document.createElement("button");
    botonAniadirGasto.type = "submit";
    botonAniadirGasto.textContent = "Añadir gasto";

    // añadimos los contenedores que hemos creado al formulario
    form.append(
        divDescripcion,
        divValor,
        divFecha,
        divEtiquetas,
        botonAniadirGasto
    );

    // se incorpora el formulario al html
    contenedorFormulario.appendChild(form);

    // funcion para evitar q se recargue la pagina al enviar el formulario
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const descripcion = inputDescripcion.value;
        // ya q valor devuelve una cadena, lo convertimos a un float
        const valor = parseFloat(inputValor.value);
        const fecha = inputFecha.value;
        // dividimos la cadena de etiquetas en un array usando por ejemplo la coma como separador
        const etiquetas = inputEtiquetas.value.split(",");

        // no queremos q se recargue la pagina porq queremos mostrar
        // dinámicamente los objetos gasto que vayamos creando
        
        // gasto en texto plano para que la api lo procese
        const gastoPlano = {
            descripcion,
            valor,
            fecha,
            etiquetas
        };

        // creo el gasto con la api
        await crearGastoAPI(usuarioActual, gastoPlano);
        // recargamos datos para sincronizar fend con bend
        await recargarDatos();

        // se limpia el formulario después de enviarlo
        form.reset();
    });
}

// clase para crear el componente 'mi-gasto'
class MiGasto extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // se clona el contenido de la template 'plantilla-gasto' en el html
        const plantilla = document.getElementById("plantilla-gasto");
        const contenido = plantilla.content.cloneNode(true);

        // ya que el css q tenemos no afecta al componente, 
        // copio los estilos para añadirlos al shadow
        const estilo = document.createElement("style");
        estilo.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
            * { box-sizing: border-box; font-family: 'Roboto', sans-serif; }
            .gasto { margin: 1em 0; box-shadow: 5px 5px 5px #555555; border: 1px solid #555555; padding: 0.5em; }
            .form-control { margin: 0.5em 0; }
            .form-control label { width: 100%; }
            .form-control input { width: 100%; }
            button { border: 1px solid #555555; padding: 0.5em 0.7em; margin: 0.1em 0.1em; color: #555555; background-color: white; box-shadow: 2px 2px #e6e6e6; }
            .gasto-etiquetas-etiqueta { font-size: 0.8em; font-variant: small-caps; margin: 0.2em; display: inline-block; border: 1px solid #555555; padding: 0.2em 0.5em; border-radius: 5px; cursor: pointer; position: relative; }
            .gasto-etiquetas-etiqueta:hover { color: red; border: 1px solid red; text-decoration: line-through; }
            .gasto-valor:after { content: " €"; }
        `;

        // se añade al shadow root del componente
        this.shadowRoot.append(estilo, contenido);
    }

    // cuando se asigna un gasto al componente, se guarda y se llama a render
    set datos(gasto) {
        this._gasto = gasto;
        this.render();
    }

    render() {
        // se busca dentro del SDom los elementos para asignarles su valor correspondiente
        this.shadowRoot.querySelector(".gasto-descripcion").textContent = this._gasto.descripcion;
        this.shadowRoot.querySelector(".gasto-valor").textContent = this._gasto.valor;
        /*this.shadowRoot.querySelector(".gasto-fecha").textContent = this._gasto.fecha;*/

        // si no pongo fecha, me pone el tiempo en ms. Para solucionar eso he hecho q,
        // si no se pone fecha, almacene la fecha de hoy, y si hay fecha, simplemente se formatea.
        const fechaElemento = this.shadowRoot.querySelector(".gasto-fecha");
        if (!this._gasto.fecha) {
            const fechaHoy = new Date();
            fechaElemento.textContent = fechaHoy.toLocaleDateString();
        } else {
            const fecha = new Date(this._gasto.fecha);
            fechaElemento.textContent = fecha.toLocaleDateString();
        }

        // se limpian las etiquetas (pa que no se repitan) 
        const etiquetasDiv = this.shadowRoot.querySelector(".gasto-etiquetas");
        etiquetasDiv.innerHTML = "";
        // por tema de css, creo un span para cada una con su clase correspondiente
        this._gasto.etiquetas.forEach((etiqueta) => {
            const span = document.createElement("span");
            span.classList.add("gasto-etiquetas-etiqueta");
            span.textContent = etiqueta;
            etiquetasDiv.appendChild(span);
        });

        // obtenemos los botones d la template
        const botonBorrar = this.shadowRoot.querySelector("#borrar");
        const botonEditar = this.shadowRoot.querySelector("#editar");
        const formEdicion = this.shadowRoot.querySelector("#formulario-filtrado");
        const botonGuardarEdicion = this.shadowRoot.querySelector("#gasto-editar-formulario");
        const botonCancelar = this.shadowRoot.querySelector("#cancelar");

        formEdicion.addEventListener("submit", (event) => {
            // evitar q el form (q esta en el shadow dom) haga
            // submit y recargue la página
            event.preventDefault();
            event.stopPropagation();
        })

        // botonBorrar: se borra un gasto pasando el id del gasto y se actualiza la vista
        botonBorrar.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // llamo a la api para borrar
            await borrarGastoAPI(usuarioActual, this._gasto.id);
            await recargarDatos();
        });

        // botonEditar: muestra el formulario d edicion
        botonEditar.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            formEdicion.style.display = "block";
            const desc = this.shadowRoot.querySelector("#nuevaDescripcion");
            const val = this.shadowRoot.querySelector("#nuevoValor");
            const fec = this.shadowRoot.querySelector("#nuevaFecha");
            // rellena los campos con los valores actuales
            desc.value = this._gasto.descripcion;
            val.value = this._gasto.valor;
            fec.value = this._gasto.fecha;
        });

        // evita la recarga cuando se envie el formulario de edicion
        botonGuardarEdicion.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            // lee los nuevos valores q hemos editado
            const desc = this.shadowRoot.querySelector("#nuevaDescripcion").value;
            const val = parseFloat(
                this.shadowRoot.querySelector("#nuevoValor").value
            );
            const fec = this.shadowRoot.querySelector("#nuevaFecha").value;
            // se almacenan los nuevos valores
            this._gasto.descripcion = desc;
            this._gasto.valor = val;
            this._gasto.fecha = fec;

            // despues de actualizar el objeto local, lo envía a la API
            await actualizarGastoAPI(usuarioActual, this._gasto);
            await recargarDatos();

            // se oculta el form de edicion y se actualiza la vista
            formEdicion.style.display = "none";
        });

        // el boton cancelar simplemente oculta el form de edicion
        botonCancelar.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            formEdicion.style.display = "none";
        };
    }
}

// registra el nuevo componente 'mi-gasto' para q use su clase MiGasto
customElements.define("mi-gasto", MiGasto);

// formulario inicial para añadir gastos
crearFormularioGasto();

// elementos a los q les incorporaré un listener
const usuarioInput = document.getElementById("usuarioInput");
const botonUsuario = document.getElementById("botonUsuario");

botonUsuario.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    usuarioActual = usuarioInput.value;
    await recargarDatos();
})