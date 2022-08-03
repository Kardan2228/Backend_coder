const Contenedor = require("./Contenedor");
const express = require('express');
const app = express();
const PORT = 8080;
const contenedor = new Contenedor("productos.txt");

app.get('/', (req, res) => {
    res.send('Servidor con express')
});

app.get('/productos', async (req, res) => {
    const allProducts = await contenedor.getAll();
    res.json(allProducts);
});

app.get('/productoRandom', async (req, res) => {
    const allProducts = await contenedor.getAll();
    const maxId = allProducts.length;
    
    const randomNumber = generateRandomNumber(1, maxId);
    const randomProduct = await contenedor.getById(randomNumber);

    res.json(randomProduct);

})

const generateRandomNumber = (min, max) => {
    return Math.floor((Math.random() * (max+1 -min)) +min);
}

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})

server.on('error', (error) => console.log(error));