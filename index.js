require('dotenv').config()
const helmet = require('helmet')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const Person = require('./models/person')

const app = express();

// Middleware para servir archivos estáticos desde 'dist' (Frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://fullstackopen2-r3mb.onrender.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));

// CORS: Permitir el frontend en Render
app.use(cors({
    origin: 'https://fullstackopen2-r3mb.onrender.com', // Ajusta con tu frontend si es otra URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Logger con Morgan
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// Datos iniciales (esto debería venir de una base de datos en producción)
let persons = [
    { id: 1, name: "Arto Hellas", number: "040-123456" },
    { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
    { id: 3, name: "Dan Abramov", number: "12-43-234345" },
    { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
];

// Rutas API
app.get('/api/persons', (req, res) => {
    Person.find({})
        .then(persons => res.json(persons))
        .catch(error => {
            console.error('Error fetching persons:', error);
            res.status(500).json({ error: 'Error fetching persons' });
        });
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) res.json(person);
            else res.status(404).json({ error: 'Person not found' });
        })
        .catch(error => res.status(400).json({ error: 'Malformatted ID' }));
});

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(error => res.status(400).json({ error: 'Malformatted ID' }));
});

app.get('/info', (req, res) => {
    Person.countDocuments()
        .then(count => {
            res.send(`<p>La agenda telefónica tiene información de ${count} personas.</p><p>${new Date()}</p>`);
        })
        .catch(error => {
            console.error('Error fetching info:', error);
            res.status(500).json({ error: 'Error fetching info' });
        });
});


const generateId = () => Math.floor(Math.random() * 10000000000000000000);

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'name or number missing' });
    }

    Person.findOne({ name })
        .then(existingPerson => {
            if (existingPerson) {
                return res.status(400).json({ error: 'name must be unique' });
            }

            const newPerson = new Person({ name, number });
            return newPerson.save();
        })
        .then(savedPerson => res.json(savedPerson))
        .catch(error => {
            console.error('Error saving person:', error);
            res.status(500).json({ error: 'Error saving person' });
        });
});

// Servir frontend (React) para todas las rutas desconocidas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
