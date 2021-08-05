const http = require('http')
const fs = require('fs')
const {agregarCliente, obtenerClientes, editarCliente, eliminarCliente, hacerTransferencia, obtenerTransferencias} = require("./consultas")
const url = require('url')

http
.createServer(async (req, res) => {
    if (req.url == "/"){
        const html = fs.readFileSync("index.html", 'utf-8')
        res.writeHead(200, {"Content-type": "text/html; encoding=utf8"})
        res.end(html)
    }

    if (req.url.startsWith("/usuario") && req.method == 'POST'){
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })
        res.end("end", async () => {
            const datosCliente = JSON.parse(body)
            const insercion = await agregarCliente(datosCliente)
            res.statusCode = 201
            res.end()
        })
    }

    if (req.url.startsWith("/usuarios") && req.method == 'GET'){
        try {
            const clientes = await obtenerClientes()
            console.log(clientes)
            res.writeHead(200, {"Content-type": "Application/json"})
            res.end(JSON.stringify(clientes))
        } catch (error) {
            console.log("ruta", error)
            res.statusCode = 500
            res.end()
        }
    }

    if (req.url.startsWith("/usuario") && req.method == "PUT"){
        const id = url.parse(req.url, true).query.id
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })
        req.on("end", async () => {
            const datosCliente = JSON.parse(body)
            datosCliente.id = parseInt(id)
            console.log(datosCliente)
            try {
                await editarCliente(datosCliente)
                res.statusCode = 200
            } catch (error) {
                console.log(error)
                res.statusCode = 400
            }
            res.end()
        })
    }

    if (req.url.startsWith("/usuario") && req.method == 'DELETE'){
        const id = url.parse(req.url, true).query.id
        try {
            await eliminarCliente(id)
            res.statusCode = 204
            res.end()
        } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify(error))
        }
    }

    if (req.url.startsWith("/transferencia") && req.method == 'POST'){
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })

        req.on("end", async () => {
            try {
                const transferencia = await hacerTransferencia(JSON.parse(body))
                res.statusCode = 201
                res.end(JSON.stringify(transferencia))
            } catch (error) {
                res.statusCode = 500
                console.log(error)
                res.end()
                throw("error en la transaccion")
            }
        })
    }

    if (req.url.startsWith("/transferencias") && req.method == 'GET'){
        const transferencias = await obtenerTransferencias()
        console.log(transferencias)
        res.writeHead(200, {"Content-type": "Application/json"})
        res.end(JSON.stringify(transferencias))
    }

})
.listen(3000, () =>  console.log("Servidor iniciado en el puerto 3000..."))