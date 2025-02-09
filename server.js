const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Ruta raíz para servir index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Almacenamiento temporal de tarjetas (en producción usaríamos una base de datos)
const cards = new Map();

app.post('/generate-card', (req, res) => {
    const { cardNumber, cvv, expiryDate, cardHolder } = req.body;
    console.log('Datos recibidos en POST:', req.body);  // Ver qué llega
    
    // Validar datos
    if (!cardNumber || !cvv || !expiryDate || !cardHolder) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Generar URL única
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Guardar datos
    const cardData = {
        cardNumber,
        cvv,
        expiryDate,
        cardHolder: cardHolder.toUpperCase(), // Asegurarnos que esté en mayúsculas
        createdAt: new Date()
    };
    
    console.log('Objeto cardData antes de guardar:', cardData);  // Ver qué se va a guardar
    cards.set(uniqueId, cardData);
    console.log('Datos después de guardar:', cards.get(uniqueId));  // Ver qué se guardó

    res.json({ url: `/card/${uniqueId}` });
});

app.get('/card/:id', (req, res) => {
    const cardData = cards.get(req.params.id);
    if (!cardData) {
        return res.status(404).send('Tarjeta no encontrada');
    }
    res.sendFile(__dirname + '/public/card.html');
});

app.get('/api/card/:id', (req, res) => {
    const cardData = cards.get(req.params.id);
    console.log('Datos recuperados en GET /api/card/:id:', cardData);  // Ver qué llega aquí
    if (!cardData) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }
    // Asegurarnos de que enviamos todos los campos
    const responseData = {
        cardNumber: cardData.cardNumber,
        cvv: cardData.cvv,
        expiryDate: cardData.expiryDate,
        cardHolder: cardData.cardHolder,
        createdAt: cardData.createdAt
    };
    res.json(responseData);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});