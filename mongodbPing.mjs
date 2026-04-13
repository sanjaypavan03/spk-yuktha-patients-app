/**
 * MongoDB Atlas Connectivity Check
 * File: mongodbPing.mjs
 * 
 * Instructions to run:
 * 1. Install dependencies:
 *    npm install mongodb dotenv
 * 
 * 2. Run the check:
 *    node mongodbPing.mjs
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// 1. Initialize environment variables from .env file
dotenv.config();

async function runCheck() {
  // 2. Retrieve connection string from environment
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in your environment variables.');
    console.log('💡 Tip: Ensure you have a .env file with MONGODB_URI=your_connection_string');
    process.exit(1);
  }

  // 3. Create a new MongoClient with stable API settings
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  console.log('📡 Attempting to connect to MongoDB Atlas...');

  try {
    // 4. Connect the client to the server
    await client.connect();
    console.log('🔌 Successfully established connection to the server.');

    // 5. Send a ping to confirm a successful connection
    console.log('🧠 Sending a lightweight ping command...');
    await client.db("admin").command({ ping: 1 });
    
    console.log('✅ Success! Your MongoDB Atlas connection is active and healthy.');

  } catch (error) {
    // 6. Handle any connection or authorization errors
    console.error('❌ Connectivity Check Failed!');
    console.error(`🔴 Detail: ${error.message}`);
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Tip: Please check if your database username and password are correct.');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('💡 Tip: Ensure your current IP address is added to the Atlas Network Access list.');
    }
  } finally {
    // 7. Ensure the client will close when you finish/error
    await client.close();
    console.log('🔒 Connection closed.');
  }
}

// Start the check
runCheck().catch(console.dir);
