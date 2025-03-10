require('dotenv').config()
const mongoose = require('mongoose');

console.log('MONGODB_URI:', process.env.MONGODB_URI);
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.log('No se ha especificado la URL de la base de datos');
  process.exit(1);
}

// Obtiene los argumentos de la línea de comandos
const [,, name, number] = process.argv;


mongoose.set('strictQuery',false)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    if (!name || !number) {
      // Si no se proporciona nombre o número, mostrar todas las personas
      console.log('📖 Phonebook:');
      return Person.find({});
    } else {
      // Si se proporciona nombre y número, agregar una nueva persona
      const person = new Person({ name, number });
      return person.save();
    }
  })
  .then(result => {
    if (result && result.name && result.number) {
      console.log(`✅ Se ha añadido ${result.name} con número ${result.number} a la agenda telefónica.`);
    } else {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
    }
    mongoose.connection.close();
  })
  .catch((error) => {
    console.log('❌ Error al conectar con MongoDB:', error.message);
    mongoose.connection.close();
  });

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
});

const Person = mongoose.model('Person', personSchema);