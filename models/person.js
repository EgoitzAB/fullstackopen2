const mongoose = require('mongoose');

const phoneRegex = /^\d{2,3}-\d{5,}$/;

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: [3, 'The name must be at least 3 characters long']},
  number: { type: String, required: true },
  validate: {
    validator: number => phoneRegex.test(number),
    message: props => `${props.value} is not a valid phone number`
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Person = mongoose.models.Person || mongoose.model('Person', personSchema);

module.exports = Person;
