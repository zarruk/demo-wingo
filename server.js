const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.post('/generate-card', (req, res) => {
    const { cardNumber, cvv, expiryDate } = req.body;
    
    // Validar datos
    if (!cardNumber || !cvv || !expiryDate) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Generar URL única
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const cardUrl = `/card/${uniqueId}`;

    // Guardar datos temporalmente (en producción usaríamos una base de datos)
    app.locals.cards = app.locals.cards || {};
    app.locals.cards[uniqueId] = {
        cardNumber,
        cvv,
        expiryDate,
        createdAt: new Date()
    };

    res.json({ url: cardUrl });
});

app.get('/card/:id', (req, res) => {
    const cardData = app.locals.cards[req.params.id];
    if (!cardData) {
        return res.status(404).send('Tarjeta no encontrada');
    }
    
    // Renderizar HTML con los datos de la tarjeta
    res.sendFile(__dirname + '/public/card.html');
});

app.get('/api/card/:id', (req, res) => {
    const cardData = app.locals.cards[req.params.id];
    if (!cardData) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }
    res.json(cardData);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 