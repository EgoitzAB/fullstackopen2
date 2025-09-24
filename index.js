require('dotenv').config()
const helmet = require('helmet')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
require('./config/mongo')
const Person = require('./models/person')

const app = express()

// Middleware para servir archivos estáticos desde 'dist' (Frontend)
app.use(express.static(path.join(__dirname, 'dist')))

// Seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'https://fullstackopen2-r3mb.onrender.com'],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
    },
  },
}))

// CORS: Permitir el frontend en Render
app.use(cors({
  origin: 'https://fullstackopen2-r3mb.onrender.com', // Ajusta con tu frontend si es otra URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}))

app.use(express.json())

// Logger con Morgan
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Rutas API
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      }
      else {
        res.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        res.status(204).end()
      }
      else {
        res.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.countDocuments()
    .then((count) => {
      res.send(`<p>La agenda telefónica tiene información de ${count} personas.</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  Person.findOne({ name })
    .then((existingPerson) => {
      if (existingPerson) {
        // Si la persona ya existe, actualizar su número en lugar de crear una nueva
        return Person.findByIdAndUpdate(
          existingPerson._id,
          { number },
          { new: true, runValidators: true, context: 'query' },
        )
      }

      // Si no existe, crear una nueva entrada
      const newPerson = new Person({ name, number })
      return newPerson.save()
    })
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  if (!number) {
    return res.status(400).json({ error: 'number missing' })
  }

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson)
      }
      else {
        res.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

// Middleware para manejar errores
const errorHandler = (error, req, res) => {
  console.error(error.message)

  // Manejo de errores específicos
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted ID' })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  // Si no es ninguno de esos, manejamos el error genérico
  return res.status(500).json({ error: 'Internal Server Error' })
}

// Middleware para manejar rutas no definidas
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// Rutas no definidas (debe ir después de todas las rutas anteriores)
app.use(unknownEndpoint)

// Middleware de manejo de errores (debe ir después de las rutas)
app.use(errorHandler)

// Servir frontend (React) para todas las rutas desconocidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Iniciar servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
