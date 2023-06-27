const { MongoClient } = require('mongodb');
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGO_URL);

async function handleMongo(req, res) {

    const { collection: collectionString, limit } = req.query;

    if(!collectionString) return res.send('No collectionString provided').status(400);

    let limitNumber;
    if(limit){
        limitNumber = parseInt(limit);
        if(isNaN(limitNumber)) return res.send('Limit is not a number').status(400);
    }
    
    const filters = req?.body?.filters ? req.body.filters : null;

    try {
        const conn = await client.connect();

        const db = conn.db('medicaldata_poc');
    
        const collection = db.collection(collectionString);
    
        const results = collection.find(filters ?? {});
    
        const resultsArray = limitNumber ? await results.limit(limitNumber).toArray() : await results.toArray();
    
        res.send(resultsArray).status(200)
    }
    catch(e) {
        console.log(e);
        res.send(e).status(500);
    }
}

// Define a route
app.get('/', handleMongo );

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});