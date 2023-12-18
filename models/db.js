const mongoose = require("mongoose");
const { MONGOURI } = require('../config/keys');

async function main() {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    
    // Additional logic or actions after successful connection can be added here

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    
    // Handle the error as needed
    // For example, you might want to exit the application or perform some cleanup
  }
}

module.exports = main;
