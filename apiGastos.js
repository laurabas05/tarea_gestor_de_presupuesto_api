const apiUrl = "http://localhost:3000";

async function obtenerGastosUsuario(usuario) {
    const respuesta = await fetch(`${apiUrl}/${usuario}`);

    if (!respuesta.ok) throw new Error("Error al obtener los gastos");

    return respuesta.json();
}

async function crearGastoAPI(usuario, gasto) {
    const respuesta = await fetch(`${apiUrl}/${usuario}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(gasto)
    });

    if (!respuesta.ok) throw new Error("Error al crear gasto");

    return respuesta.json();
}

async function borrarGastoAPI(usuario, id) {
    const respuesta = await fetch(`${apiUrl}/${usuario}/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("Error al borrar gasto");
}

async function actualizarGastoAPI(usuario, gasto) {
    const respuesta = await fetch(`${apiUrl}/${usuario}/${gasto.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(gasto)
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