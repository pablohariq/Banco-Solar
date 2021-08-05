const {Pool, Client} = require('pg')
const moment = require("moment")

const config = {
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "bancosolar",
    idleTimeoutMillis: 10000
}

const pool = new Pool(config)

const realizarConsulta = async (objConsulta) => {
    const client = await pool.connect()
    const respuesta = await client.query(objConsulta)
    client.release()

    if (respuesta.rows){
        return respuesta
    }
    else{
        throw("Error de conexion")
    }
}

const agregarCliente = async (datosCliente) => {
    const objConsulta = {
        name: "agregar-cliente",
        text: `INSERT INTO usuarios(nombre, balance) VALUES ($1, $2) RETURNING *`,
        values: Object.values(datosCliente)
    }
    try {
        const insercionCliente = await realizarConsulta(objConsulta)
        return insercionCliente
    } catch (error) {
        return error
    }
}

const obtenerClientes = async () => {
    const objConsulta = {
        name: "obtener-clientes",
        text: `SELECT * FROM usuarios`,
    }
    const {rows: obtencionClientes} = await realizarConsulta(objConsulta)
    return obtencionClientes
}

const editarCliente = async (datosCliente) => {
    const objConsulta = {
        name: "editar-cliente",
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *`,
        values: Object.values(datosCliente)
    }
    try {
        const edicionCliente = await realizarConsulta(objConsulta)
        return edicionCliente
    } catch (error) {
        return error
    }
}

const eliminarCliente = async (id) => { //metodo: eliminacion en cascada 
    console.log(id)
    const objConsulta = {
        text: `DELETE FROM transferencias WHERE emisor = $1 OR receptor = $1;`,
        values: [id]
    }
    const eliminacionTransferencias = await realizarConsulta(objConsulta)
    objConsulta.text= `DELETE FROM usuarios WHERE id = $1;`
    console.log(objConsulta)
    const eliminacionUsuario = await realizarConsulta(objConsulta)
    return eliminacionUsuario
}

const hacerTransferencia = async (datosTransferencia) => {
    datosTransferencia.monto = parseInt(datosTransferencia.monto)
    const client = await pool.connect()
    const valoresDescuento = [datosTransferencia.monto, datosTransferencia.emisor]
    const valoresAbono = [datosTransferencia.monto, datosTransferencia.receptor]
    const valoresTransferencia = [...Object.values(datosTransferencia), moment().toISOString()]
    console.log(valoresTransferencia)
    try{ //emisor, receptor, monto
        await client.query("BEGIN;")
        const descuento = await client.query("UPDATE usuarios SET balance = balance - $1 WHERE id = (SELECT id FROM usuarios WHERE nombre = $2) RETURNING *;", valoresDescuento)
        const abono = await client.query("UPDATE usuarios SET balance = balance + $1 WHERE id = (SELECT id FROM usuarios WHERE nombre = $2) RETURNING *;", valoresAbono)
        const transferencia = await client.query(`INSERT INTO transferencias(emisor, receptor, monto, fecha) 
                            VALUES ((SELECT id FROM usuarios WHERE nombre = $1),
                                    (SELECT id FROM usuarios WHERE nombre = $2), 
                                    $3, 
                                    $4) RETURNING *;`, valoresTransferencia)
        await client.query("COMMIT;")
        client.release()
        return transferencia
    }
    catch(e){
        console.log(e)
        client.query("ROLLBACK;")
        client.release()
        throw("Error en la transacción")
    }
}

const obtenerTransferencias = async () => {
    const objConsulta = {
        name: "consultar-transferencias",
        text: `SELECT transferencias.id,
             (SELECT nombre FROM usuarios WHERE usuarios.id = transferencias.emisor) AS emisor, 
            (SELECT nombre FROM usuarios WHERE usuarios.id = transferencias.receptor) AS receptor, 
            monto,
            fecha 
            FROM transferencias INNER JOIN usuarios ON transferencias.emisor = usuarios.id;`,
        rowMode: 'array'
    }
    const {rows: transferencias} = await realizarConsulta(objConsulta)
    console.log(transferencias)
    return transferencias
}

module.exports = {agregarCliente, obtenerClientes, editarCliente, eliminarCliente, hacerTransferencia, obtenerTransferencias}