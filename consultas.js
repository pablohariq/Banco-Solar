const {Pool} = require('pg')

const config = {
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "bancosolar",
    idleTimeoutMillis: 10000
}

const pool = new Pool(config)

const realizarConsulta = (objConsulta) => {
    return new Promise ((resolve, reject) => {
        pool.connect(async (error_conexion, client, release) => {
            try {
                if (error_conexion) throw (error_conexion)
                const resultadoConsulta = await client.query(objConsulta)
                resolve(resultadoConsulta)
    
            } catch (error_consulta) {
                reject(error_consulta)
            }
            release()
        })
    })
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
    try {
        const {rows: obtencionClientes} = await realizarConsulta(objConsulta)
        return obtencionClientes
    } catch (error) {
        return error
    }
}

module.exports = {agregarCliente, obtenerClientes}