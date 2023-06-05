const mongoose = require("mongoose");

async function connect() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(
      `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@music-app.2mvruk2.mongodb.net/music-app?retryWrites=true&w=majority`
    );
    console.log("MongoDb Connected...");
  } catch (error) {
    console.log("MongoDb Connected Fail...");
  }
}

module.exports = { connect };
