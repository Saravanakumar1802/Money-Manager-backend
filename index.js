import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from 'dotenv'
import cors from 'cors'
import userRouter from './routes/user.route.js'


dotenv.config()
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get("/", function (request, response) {
    response.send("Server Running Successfully!!!");
});

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);

//!Top-level await
await client.connect(); //Call
console.log("Mongo is connected! ");

//! Route
app.use('/user', userRouter)

//! Expenses

app.get("/expenses", async function (request, response) {
    // const data = request.body
    // console.log(data);
    const expenses = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .find()
        .toArray()

    // console.log(expenses);
    response.send(expenses);
});

app.get("/expenses/:id", async (request, response) => {
    const { id } = request.params;
    const expenses = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .findOne({ _id: ObjectId(id) });

    expenses ? response.send(expenses) : response.status(404).send({ message: "expenses not found" });
});


app.put('/expenses/:id', async (request, response) => {
    const { id } = request.params;
    const data = request.body;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .updateOne({ _id: ObjectId(id) }, { $set: data });
    response.send(result);
});

app.post("/expenses", async (request, response) => {
    const data = request.body;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .insertMany(data);

    response.send(result);
});


// app.post("/users", async (request, response) => {
//     const data = request.body;
//     const result = await client
//         .db('kalaidb')
//         .collection('users')
//         .insertMany(data);

//     response.send(result);
// });


app.delete("/expenses/:id", async (request, response) => {
    const { id } = request.params;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .deleteOne({ _id: ObjectId(id) });

    result.deletedCount > 0 ? response.send({ message: "expenses deleted Successfully" }) :
        response.send({ message: "expenses not found" });
})


//!Income

app.post("/income", async (request, response) => {
    const data = request.body;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .insertMany(data);

    response.send(result);
});

app.get("/income", async (request, response) => {
    const expensess = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .find({})
        .toArray();

    response.send(expensess);
});

app.get("/income/:id", async (request, response) => {
    const { id } = request.params;
    const income = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .findOne({ _id: ObjectId(id) });

    income ? response.send(income) : response.status(404).send({ message: "Income not found" });
});

app.put('/income/:id', async (request, response) => {
    const { id } = request.params;
    const data = request.body;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .updateOne({ _id: ObjectId(id) }, { $set: data });
    response.send(result);
});

app.delete("/income/:id", async (request, response) => {
    const { id } = request.params;
    const result = await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .deleteOne({ _id: ObjectId(id) });

    console.log(result);
    result.deletedCount > 0 ? response.send({ message: "income deleted" }) :
        response.send({ message: "income not found" });
})

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));



export { client };