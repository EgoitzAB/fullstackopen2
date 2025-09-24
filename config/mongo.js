require('dotenv').config()
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.log('No se ha especificado la URL de la base de datos')
  process.exit(1)
}

mongoose.set('strictQuery', false)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB')
  })
  .catch((error) => {
    console.log('❌ Error al conectar con MongoDB:', error.message)
    process.exit(1) // Salir si no se puede conectar a la base de datos
  })
