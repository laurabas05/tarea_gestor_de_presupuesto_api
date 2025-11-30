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

let usuarioActual = null;

// declaro los contenedores q vamos a modificar
const contenedorFormulario = document.getElementById("formularioGastos");
const contenedorListado = document.getElementById("listadoGastos");
const pTotalGastos = document.getElementById("total");

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

        const descripcion = inputDescripcion.value;
        // ya q valor devuelve una cadena, lo convertimos a un float
        const valor = parseFloat(inputValor.value);
        const fecha = inputFecha.value;
        // dividimos la cadena de etiquetas en un array usando por ejemplo la coma como separador
        const etiquetas = inputEtiquetas.value.split(",");

        // no queremos q se recargue la pagina porq queremos mostrar
        // dinámicamente los objetos gasto que vayamos creando
        const gastoPlano = {
            descripcion,
            valor,
            fecha: fecha || Date.now(),
            etiquetas
        };
        await crearGastoAPI(usuarioActual, gastoPlano);

        const datos = await obtenerGastosUsuario(usuarioActual);
        cargarGastosDesdeAPI(datos);

        actualizarListado();

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

            * {
                box-sizing: border-box;
                font-family: 'Roboto', sans-serif;
            }

            #aplicacion {
                margin: 1em;
            }

            form, .gasto {
                margin: 1em 0;
                box-shadow: 5px 5px 5px #555555;
                border: 1px solid #555555;
                padding: 0.5em;
            }

            .form-control {
                margin: 0.5em 0;
            }

            .form-control label {
                width: 100%;
            }

            .form-control input {
                width: 100%;
            }

            button {
                border: 1px solid #555555;
                padding: 0.5em 0.7em;
                margin: 0.1em 0.1em;
                color: #555555;
                background-color: white;
                box-shadow: 2px 2px #e6e6e6;
            }

            button:hover {
                border: 1px solid #888888;
                color: #888888;
            }

            button:active:enabled {
                box-shadow: none;
                transform: translateY(2px);
            }

            button[type=submit], button.gasto-editar-formulario {
                background-color: #555555;
                color: white;
            }

            button[type=submit]:hover, button.gasto-editar-formulario:hover {
                background-color: #888888;
                color: white;
            }

            button:disabled, button:disabled:hover {
                cursor: not-allowed;
                border-color: #999999;
                background-color: #999999;
                box-shadow: none;
            }

            .gasto-etiquetas-etiqueta {
                font-size: 0.8em;
                font-variant: small-caps;
                margin: 0.2em;
                display: inline-block;
                border: 1px solid #555555;
                padding: 0.2em 0.5em;
                border-radius: 5px;
                cursor: pointer;
                position: relative;
            }

            .gasto-etiquetas-etiqueta:hover {
                color: red;
                border: 1px solid red;
                text-decoration: line-through;

            }

            .gasto-valor:after {
                content: "€";
            }

            /* Formulario filtrado */
            #formulario-filtrado {
                display: flex;
                flex-wrap: wrap;
            }

            #formulario-filtrado .form-control {
                flex: 1 1 auto;
                margin: 0.2em 1em;
            }

            #formulario-filtrado #formulario-filtrado-error {
                flex: 1 1 100%;
                color: red;
            }


            /* Pantallas grandes */
            @media screen and (min-width: 600px) {
                .form-control {
                    display: flex;
                }

                .form-control label {
                    flex: 0 0 8em;
                }

                .form-control input {
                    flex: 1;
                }

                .gasto {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .gasto > div {
                    padding: 0.5em 0.7em;
                }

                .gasto .gasto-descripcion {
                    flex: 0 0 30%;
                }

                .gasto .gasto-fecha {
                    flex: 0 0 20%;
                }

                .gasto .gasto-valor {
                    flex: 0 0 15%;
                }

                .gasto .gasto-etiquetas {
                    flex: 0 0 15%;
                }

                .gasto button {
                    flex: 0 0 9%;
                }

                .gasto form {
                    flex: 1;
                }
            }
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
        const botonBorrar = this.shadowRoot.querySelector(".borrar");
        const botonEditar = this.shadowRoot.querySelector(".editar");
        const formEdicion = this.shadowRoot.querySelector(".formulario-filtrado");
        const botonGuardarEdicion = this.shadowRoot.querySelector(".gasto-editar-formulario");

        // botonBorrar: se borra un gasto pasando el id del gasto y se actualiza la vista
        botonBorrar.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const usuario = document.getElementById("usuarioInput").value;
            await borrarGastoAPI(usuario, this._gasto.id);
            const datos = await obtenerGastosUsuario(usuario);
            cargarGastosDesdeAPI(datos);

            actualizarListado();
        };

        // botonEditar: muestra el formulario d edicion
        botonEditar.onclick = () => {
            formEdicion.style.display = "block";
            const desc = this.shadowRoot.querySelector("#nuevaDescripcion");
            const val = this.shadowRoot.querySelector("#nuevoValor");
            const fec = this.shadowRoot.querySelector("#nuevaFecha");
            // rellena los campos con los valores actuales
            desc.value = this._gasto.descripcion;
            val.value = this._gasto.valor;
            fec.value = this._gasto.fecha;
        };

        // evita la recarga cuando se envie el formulario de edicion
        botonGuardarEdicion.onclick = async (event) => {
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

            await actualizarGastoAPI(usuarioActual, this._gasto);

            const datos = await obtenerGastosUsuario(usuarioActual);
            cargarGastosDesdeAPI(datos);

            // se oculta el form de edicion y se actualiza la vista
            formEdicion.style.display = "none";
            actualizarListado();
        };

        // el boton cancelar simplemente oculta el form de edicion
        this.shadowRoot.querySelector("#cancelar").onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            formEdicion.style.display = "none";
        };
    }
}

// registra el nuevo componente 'mi-gasto' para q use su clase MiGasto
customElements.define("mi-gasto", MiGasto);

function actualizarListado() {
    // limpia el contenedor de los gastos y muestra los gastos actuales
    contenedorListado.innerHTML = "";
    const gastos = listarGastos();

    console.log("ACTUALIZAR LISTADO EJECUTADO");
    console.log("LISTADO:", listarGastos());
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

crearFormularioGasto();
// actualizarListado();

/*
// CÓDIGO DE LA VERSIÓN 3
// defino la clave en la q guardaré los datos
const GASTOS_ALMACENADOS = "gastos";

// funcion para guardar los gastos en el localStorage
function guardarEnLocalStorage() {
    // listamos todos los gastos y los guardamos en 
    // nuestra clave en formato JSON.
    const gastos = listarGastos();
    const datosJSON = JSON.stringify(gastos);
    localStorage.setItem(GASTOS_ALMACENADOS, datosJSON);
    alert("Has guardado los gastos correctamente.");
}

// funcion para recuperar los gastos del localStorage
function recuperarDeLocalStorage() {
    // recuperamos el JSON y lo convertimos en objetos simples
    const datosJSON = localStorage.getItem(GASTOS_ALMACENADOS);
    const datosParseados = JSON.parse(datosJSON);
    // reconstruimos los objetos Gasto
    const gastosRecuperados = datosParseados.map(gasto =>
        new CrearGasto(gasto.descripcion, gasto.valor, gasto.fecha, ...gasto.etiquetas)
    );
    // sustituyo los gastos actuales por los q habiamos guardado
    sobreescribirGastos(gastosRecuperados);
    actualizarListado();
    alert("Has recuperado los gastos correctamente.");
}

// funcion q elimina los gastos actuales y añade los nuevos
function sobreescribirGastos(nuevosGastos) {
    const gastosActuales = listarGastos();
    gastosActuales.forEach(gasto => borrarGasto(gasto.id));
    nuevosGastos.forEach(gasto => anyadirGasto(gasto));
}

// aquí ya proporciono a cada boton su función correspondiente
const botonGuardarGastos = document.getElementById("guardar");
const botonRecuperarGastos = document.getElementById("recuperar");

botonGuardarGastos.addEventListener("click", guardarEnLocalStorage);
botonRecuperarGastos.addEventListener("click", recuperarDeLocalStorage);
*/

document.getElementById("botonUsuario").onclick = async (e) => {
    e.preventDefault();
    usuarioActual = document.getElementById("usuarioInput").value;

    const datos = await obtenerGastosUsuario(usuarioActual);
    cargarGastosDesdeAPI(datos);
    actualizarListado();
};