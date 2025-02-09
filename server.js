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
    const { cardNumber, cvv, expiryDate } = req.body;
    
    // Validar datos
    if (!cardNumber || !cvv || !expiryDate) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Generar URL única
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Guardar datos
    cards.set(uniqueId, {
        cardNumber,
        cvv,
        expiryDate,
        createdAt: new Date()
    });

    // Devolver URL
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
    if (!cardData) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }
    res.json(cardData);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
}); 