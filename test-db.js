
const mongoose = require('mongoose');

async function testConnection() {
  console.log("Attempting to connect to MongoDB...");
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas.");
    console.error("\nError Details:");
    console.error(error.message);
    
    if (error.message.includes("bad auth")) {
      console.log("\n💡 TIP: Your username or password in the connection string is incorrect.");
    } else if (error.message.includes("Could not connect to any servers")) {
      console.log("\n💡 TIP: This is an IP Whitelist issue. Your computer's IP address is being blocked by MongoDB's firewall. You must log in to cloud.mongodb.com and add your IP to the Network Access list.");
    }
    
    process.exit(1);
  }
}

testConnection();
