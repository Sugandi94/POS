const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, '../data/sample.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read products from JSON file
function readProducts() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const json = JSON.parse(data);
    return json.products || [];
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
}

// Helper function to write products to JSON file
function writeProducts(products) {
  try {
    const data = { products };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing products:', err);
  }
}

// GET /products - get all products
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// POST /products - add a new product
app.post('/products', (req, res) => {
  const products = readProducts();
  const newProduct = req.body;

  // Generate new id
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  newProduct.id = maxId + 1;

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// PUT /products/:id - update a product
app.put('/products/:id', (req, res) => {
  const products = readProducts();
  const id = parseInt(req.params.id);
  const updatedProduct = req.body;

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  updatedProduct.id = id;
  products[index] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// DELETE /products/:id - delete a product
app.delete('/products/:id', (req, res) => {
  let products = readProducts();
  const id = parseInt(req.params.id);

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  writeProducts(products);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
