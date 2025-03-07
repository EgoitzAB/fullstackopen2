const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(cors())
app.use(express.json())


morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :remote-addr :status :res[content-length] - :response-time ms :body :date[iso]'))


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
