const http = require('http')
const fs = require('fs')
const {agregarCliente, obtenerClientes} = require("./consultas")

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
        const clientes = await obtenerClientes()
        res.writeHead(200, {"Content-type": "Application/json"})
        res.end(JSON.stringify(clientes))
    }

    if (req.url.startsWith("/usuario") && req.method == "PUT"){
        
    }

})
.listen(3000, () =>  console.log("Servidor iniciado en el puerto 3000..."))