// Librería de acceso a datos

// Acceso a las funciones de lectura/escritura de ficheros en NodeJS en forma de promesas
// Las funciones a utilizar son:
// fs.readFile(RUTA_FICHERO) - Para leer el contenido de un fichero. Devuelve una promesa.
// fs.writeFile(RUTA_FICHERO, DATOS_EN_FORMATO_TEXTO) - Para escribir el contenido de un fichero. Devuelve una promesa.
import { promises as fs } from 'fs';

// Ruta del fichero de almacenamiento de datos
let ficheroDatos = "./datos.json";

// Para actualizar el fichero de datos en los tests
function cambiarFicheroDatos(nombre) {
    ficheroDatos = nombre;
}

// funcion creada x mi para leer el fichero.
function leerDatos() {
    // se lee el fichero como texto y devuelve una promesa
    return fs.readFile(ficheroDatos, 'utf8')
        // cuando se recibe el texto, se convierte el json en un objeto
        .then(texto => JSON.parse(texto));
}

// funcion creada x mi para guardar el objeto en el fichero.
function guardarDatos(datos) {
    // convierte el objeto a json y devuelve una promesa
    // q se resuelve cuando la escritura termina correctamente
    return fs.writeFile(ficheroDatos, JSON.stringify(datos));
}

// Debe devolver una promesa que cuando se resuelva devuelva el array de gastos del usuario
function obtenerGastosUsuario(usuario) {

    // se lee el contenido del fichero
    return leerDatos().then(datos => {
        // si el usuario no existe en datos, se devuelve un array vacío
        if (!datos[usuario]) {
            return [];
        }
        // si el usuario existe, devuelve el array de gastos del usuario
        return datos[usuario];
    });

}

// Debe devolver una promesa. Cuando se resuelva se debe haber añadido un nuevo gasto al usuario
// y actualizado el fichero de datos
function anyadirGastoUsuario(usuario, gasto) {

    return leerDatos().then(datos => {
        // si el usuario no existe en datos, se crea
        if (!datos[usuario]) {
            datos[usuario] = [];
        }
        
        // si el gasto no tiene id, se genera uno usando la hora actual
        if (!gasto.id) {
            gasto.id = Date.now().toString();
        }

        // añade el objeto gasto al array del usuario
        datos[usuario].push(gasto);

        // escribe el objeto completo datos en el fichero y
        // resuelve con el propio gasto insertado.
        return guardarDatos(datos).then(() => gasto);
    });

}

// Debe devolver una promesa. Cuando se resuelva se debe haber modificado el gasto del usuario
// y actualizado el fichero de datos
function actualizarGastoUsuario(usuario, gastoId, nuevosDatos) {

    return leerDatos().then(datos => {

        // lista = array de gastos del usuario
        const lista = datos[usuario];
        // si no existe el usuario, lanza error
        if (!lista) {
            throw new Error('El usuario no existe');
        }

        // indiceGasto = posicion en la que está el gasto que se quiere actualizar
        const indiceGasto = lista.findIndex(g => g.id === gastoId);
        // si no se encuentra, lanza error
        if (indiceGasto == -1) {
            throw new Error('El gasto no existe');
        }

        // copia las propiedades de nuevosDatos y asegura la id con gastoId
        const actualizado = Object.assign({}, nuevosDatos, { id: gastoId });

        // reemplazo el gasto antiguo por el objeto nuevo
        lista[indiceGasto] = actualizado;

        // escribe los datos modificados en el fichero
        // resuelve la promesa con el objeto actualizado
        return guardarDatos(datos).then(() => actualizado);
    });

}

// Debe devolver una promesa. Cuando se resuelva se debe haber eliminado el gasto del usuario
// y actualizado el fichero de datos
function borrarGastoUsuario(usuario, gastoId) {

    return leerDatos().then(datos => {
        
        const lista = datos[usuario];
        if (!lista) {
            throw new Error('El usuario no existe');
        }

        const indiceGasto = lista.findIndex(g => g.id === gastoId);
        if (indiceGasto === -1) {
            throw new Error('El gasto no existe');
        }

        // elimina el elemento en la posicion indice.
        // [0] toma el primer (el eliminado).
        const eliminado = lista.splice(indiceGasto, 1)[0];

        // escribe el fichero actualizado y resuelve con el gasto eliminado
        return guardarDatos(datos).then(() => eliminado);
    });

}

// Exportación de funciones
// Normalmente en NodeJS se utiliza el sistema CommonJS,
// pero se ha configurado el proyecto para que utilice módulos indicando
// 'type = module' en el archivo 'package.json'
export {
    obtenerGastosUsuario,
    anyadirGastoUsuario,
    actualizarGastoUsuario,
    borrarGastoUsuario,
    // Para poder utilizar uno distinto en los tests y no interferir con los datos reales
    cambiarFicheroDatos
}
