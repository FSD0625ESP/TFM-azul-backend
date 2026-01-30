import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const removeTypeIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("stores");

    // Listar todos los índices
    const indexes = await collection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Intentar eliminar el índice de 'type'
    try {
      await collection.dropIndex("type_1");
      console.log("Successfully dropped 'type_1' index");
    } catch (err) {
      console.log("Index 'type_1' does not exist or already dropped");
    }

    // Verificar índices después
    const indexesAfter = await collection.indexes();
    console.log(
      "Indexes after removal:",
      JSON.stringify(indexesAfter, null, 2),
    );

    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

removeTypeIndex();
