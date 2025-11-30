// url base de la API
const apiUrl = "http://localhost:3000";

// metodo get
async function obtenerGastosUsuario(usuario) {
    // se realiza una solicitud GET a la api con fetch
    const respuesta = await fetch(`${apiUrl}/${usuario}`);

    if (!respuesta.ok) throw new Error("Error al obtener los gastos");

    // la respuesta es exitosa, parsea el JSON a objeto js
    return respuesta.json();
}

// metodo post
async function crearGastoAPI(usuario, gasto) {
    const respuesta = await fetch(`${apiUrl}/${usuario}`, {
        method: "POST", // metodo POST
        headers: {"Content-Type": "application/json"}, // indica q el contenido de la solicitud es JSON
        body: JSON.stringify(gasto) // convierte el objeto gasto a JSON
    });

    if (!respuesta.ok) throw new Error("Error al crear gasto");

    return respuesta.json();
}

// metodo delete
async function borrarGastoAPI(usuario, id) {
    const respuesta = await fetch(`${apiUrl}/${usuario}/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("Error al borrar gasto");
    // no se devuelve nada, solo se confirma el borrado
}

// metodo put
async function actualizarGastoAPI(usuario, gasto) {
    const respuesta = await fetch(`${apiUrl}/${usuario}/${gasto.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(gasto) // envia el objeto gasto actualizado
    });

    if (!respuesta.ok) throw new Error("Error al actualizar gasto");

    return respuesta.json();
}

export {
    obtenerGastosUsuario,
    crearGastoAPI,
    borrarGastoAPI,
    actualizarGastoAPI
}