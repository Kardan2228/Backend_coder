const express = require('express');
const app = express();
const Contenedor = require('./contenedor')
const contenedor = new Contenedor("productos.json", ["timestamp", "title", "price", "description", "code", "image", "stock"]);
const carrito = new Contenedor("carrito.json", ["timestamp", "products"])

const dotenv = require('dotenv');
dotenv.config();
console.log(`Port... ${process.env.TOKEN}`);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const authMiddleware = app.use((req, res, next) => {
    req.header('authorization') == process.env.TOKEN 
        ? next()
        : res.status(401).json({"error": "No autorizado"})
})

const routerProducts = express.Router();
const routerCart = express.Router();

app.use('/api/productos', routerProducts);
app.use('/api/carrito', routerCart);

routerProducts.get('/', async (req, res) => {
    const products = await contenedor.getAll();
    res.status(200).json(products);
})

routerProducts.get('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await contenedor.getById(id);
    
    product
        ? res.status(200).json(product)
        : res.status(400).json({"error": "Producto no encontrado"})
})

routerProducts.post('/',authMiddleware, async (req,res, next) => {
    const {body} = req;
    
    body.timestamp = Date.now();
    
    const newProductId = await contenedor.save(body);
    
    newProductId
        ? res.status(200).json({"Éxito" : "Producto agregado con el ID: "+newProductId})
        : res.status(400).json({"error": "Clave inválida. Por favor verifica la información"})
})

routerProducts.put('/:id', authMiddleware ,async (req, res, next) => {
    const {id} = req.params;
    const {body} = req;
    const wasUpdated = await contenedor.updateById(id,body);
    
    wasUpdated
        ? res.status(200).json({"Éxito" : "Producto actualizado"})
        : res.status(404).json({"error": "prodcuto no encontrado"})
})

routerProducts.delete('/:id', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const wasDeleted = await contenedor.deleteById(id);
    
    wasDeleted 
        ? res.status(200).json({"Éxito": "producto correctamente eliminado"})
        : res.status(404).json({"error": "Producto no encontrado"})
})

routerCart.post('/', async(req, res) => {
    const {body} = req;
    
    body.timestamp = Date.now();
    
    const newCartId = await carrito.save(body);
    
    newCartId
        ? res.status(200).json({"Éxito" : "Producto agregado con el ID: "+newCartId})
        : res.status(400).json({"error": "Clave inválida. Favor de verificar la información"})
    
})

routerCart.delete('/:id', async (req, res) => {
    const {id} = req.params;
    const wasDeleted = await carrito.deleteById(id);
    
    wasDeleted 
        ? res.status(200).json({"Éxito": "Producto removido con éxito"})
        : res.status(404).json({"error": "Producto no encontrado"})
})

routerCart.post('/:id/productos', async(req,res) => {
    const {id} = req.params;
    const { body } = req;
    
    const product = await contenedor.getById(body['id']);    
    
    if (product) {
        const cartExist = await carrito.addToArrayById(id, {"Productos": product});
        cartExist
            ? res.status(200).json({"Éxito" : "Producto agregado"})
            : res.status(404).json({"error": "Producto no encontrado"})
    } else {
        res.status(404).json({"error": "Producto no encontrado, verifica la información."})
    }
})

routerCart.get('/:id/productos', async(req, res) => {
    const { id } = req.params;
    const cart = await carrito.getById(id)
    
    cart
        ? res.status(200).json(cart.products)
        : res.status(404).json({"error": "Producto no encontrado"})
})

routerCart.delete('/:id/productos/:id_prod', async(req, res) => {
    const {id, id_prod } = req.params;
    const productExists = await contenedor.getById(id_prod);
    if (productExists) {
        const cartExists = await carrito.removeFromArrayById(id, id_prod, 'products')
        cartExists
            ? res.status(200).json({"Éxito" : "Prodcuto eliminado"})
            : res.status(404).json({"error": "Producto no encontrado"})
    } else {
        res.status(404).json({"error": "Producto no encontrado"})
    }
})

const PORT = 8020;
const server = app.listen(PORT, () => {
console.log(` Server levantado en http://localhost:${PORT}`)
})

server.on('error', (err) => console.log(err));