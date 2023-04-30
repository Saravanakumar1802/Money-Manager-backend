import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
const app = express();

const PORT = 5001 || process.env.PORT;
app.use(express.json());
app.use(cors());

app.get("/", function (request, response) {
    response.send("Server Running Successfully!!!");
});

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);

//!Top-level await  
await client.connect(); //Call
console.log("Mongo is connected! ");


//! Expenses

app.get("/expenses", async function (request, response) {

    const expenses = await client
        .db('moneyManagement')
        .collection('expenses')
        .find({})
        .toArray();

    response.send(expenses);
});

app.get("/expenses/:id", async (request, response) => {
    const { id } = request.params;
    const expenses = await client
        .db('moneyManagement')
        .collection('expenses')
        .findOne({ _id: ObjectId(id) });

    expenses ? response.send(expenses) : response.status(404).send({ message: "expenses not found" });
});

app.put('/expenses/:id', async (request, response) => {
    const { id } = request.params;
    const data = request.body;
    const result = await client
        .db('moneyManagement')
        .collection('expenses')
        .updateOne({ _id: ObjectId(id) }, { $set: data });
    response.send(result);
});

app.post("/expenses", async (request, response) => {
    const data = request.body;
    const result = await client
        .db('moneyManagement')
        .collection('expenses')
        .insertMany(data);

    response.send(result);
});

app.delete("/expenses/:id", async (request, response) => {
    const { id } = request.params;
    const result = await client
        .db('moneyManagement')
        .collection('expenses')
        .deleteOne({ _id: ObjectId(id) });

    result.deletedCount > 0 ? response.send({ message: "expenses deleted Successfully" }) :
        response.send({ message: "expenses not found" });
})


//!Income

app.post("/income", async (request, response) => {
    const data = request.body;
    const result = await client
        .db('moneyManagement')
        .collection('income')
        .insertMany(data);

    response.send(result);
});

app.get("/income", async (request, response) => {
    const expensess = await client
        .db('moneyManagement')
        .collection('income')
        .find({})
        .toArray();

    response.send(expensess);
});

app.get("/income/:id", async (request, response) => {
    const { id } = request.params;
    const income = await client
        .db('moneyManagement')
        .collection('income')
        .findOne({ _id: ObjectId(id) });

    income ? response.send(income) : response.status(404).send({ message: "Income not found" });
});

app.put('/income/:id', async (request, response) => {
    const { id } = request.params;
    const data = request.body;
    const result = await client
        .db('moneyManagement')
        .collection('income')
        .updateOne({ _id: ObjectId(id) }, { $set: data });
    response.send(result);
});

app.delete("/income/:id", async (request, response) => {
    const { id } = request.params;
    const result = await client
        .db('moneyManagement')
        .collection('income')
        .deleteOne({ _id: ObjectId(id) });

    console.log(result);
    result.deletedCount > 0 ? response.send({ message: "income deleted" }) :
        response.send({ message: "income not found" });
})

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
