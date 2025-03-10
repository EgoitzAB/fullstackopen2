const mongoose = require('mongoose');

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
  }

// Obtiene los argumentos de la línea de comandos
const [,, password, name, number] = process.argv;

if (!password) {
  console.log('Por favor, proporciona la contraseña como argumento: node mongo.js <password>');
  process.exit(1);
}

const url = `mongodb+srv://myAtlasDBUser:${password}@cluster0.tw3ww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)
// Definir el esquema y modelo
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

// Si solo se proporciona la contraseña, listar todos los contactos
if (!name || !number) {
  console.log('📖 Phonebook:');
  Person.find({}).then(persons => {
    persons.forEach(person => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
} else {
  // Si se proporcionan nombre y número, agregar una nueva entrada
  const person = new Person({ name, number });

  person.save().then(() => {
    console.log(`✅ added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
