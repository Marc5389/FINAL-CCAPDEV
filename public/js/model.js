const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://127.0.0.1:3000"; // mongoDB connection string
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("mco1"); // database
        const collection = database.collection("restaurants"); // collection

        // query for at least 5 documents in the collection
        const query = {};
        const options = {
            limit: 5 // 5 documents
        };

        const cursor = collection.find(query, options);

        // output documents
        await cursor.forEach(doc => console.log(doc));

    } finally {
        // close the client
        await client.close();
    }
}

main().catch(console.error);
