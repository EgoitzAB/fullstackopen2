const helmet = require('helmet')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const path = require('path');

app.use(express.static(path.join(__dirname, 'dist')));
app.use(helmet())
app.use(cors({
    origin: '*', // Replace with your frontend URL if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}))
app.use(express.json())

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});




morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :remote-addr :status :res[content-length] - :response-time ms :body :date[iso]'))
app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' https://fullstackopen2-r3mb.onrender.com; style-src 'self' 'unsafe-inline'; script-src 'self';"
    );
    next();
  });

app.use(express.static('public'));

let persons = [
    { id: 1, name: "Arto Hellas", number: "040-123456" },
    { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
    { id: 3, name: "Dan Abramov", number: "12-43-234345" },
    { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
];

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)  
    } else {
        response.status(404).end()  
    }})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
}
)

app.get('/info', (req, res) => {
    const numPersons = persons.length;
    const timestamp = new Date();
    res.send(
        `<p>La agenda telefónica tiene información de ${numPersons} personas.</p>
         <p>${timestamp}</p>`
    );
});

const generateId = () => {
    const finalId = Math.floor(Math.random() * 10000000000000000000)
    return finalId
  }

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    
    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
}
)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
