// este archivo se encarga de almacenar los gastos obtenidos de la
// API y hacer cálculos sobre ellos.

// array q contendrá los gastos del usuario
let gastos = [];

// coger los datos recibidos de la api y almacenarlos en el array gastos
function cargarGastosDesdeAPI(datos) {
    // se transforma cada objeto de los datos de la api
    gastos = datos.map(gasto => ({
        id: gasto.id,
        descripcion: gasto.descripcion,
        valor: gasto.valor,
        fecha: gasto.fecha,
        // en caso de q contenga etiquetas (q en el json dado no contiene)
        etiquetas: gasto.etiquetas ? [...gasto.etiquetas] : []
    }));
}

// acceder a la lista de gastos actuales
function listarGastos() {
    return gastos;
}

// suma el valor de todos los gastos
function calcularTotalGastos() {
    return gastos.reduce((total, gasto) => total + gasto.valor, 0);
}

export {
    listarGastos,
    cargarGastosDesdeAPI,
    calcularTotalGastos,
};
