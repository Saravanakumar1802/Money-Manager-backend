import { ObjectId } from 'mongodb';
import { client } from '../index.js';

export async function userSignup(username, email, finalHash) {
    return await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .insertOne({ username, email, password: finalHash });
}

export async function getUserByEmail(email) {
    return await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .findOne({ email: email });
}

export async function tokenVerify(decode) {
    return await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .findOne({ _id: new ObjectId(`${decode.id}`) });
    // return await client
    //     .db('moneyManagerDup')
    //     .collection('income/expenses')
    //     .findOne({ _id: decode.id });
}

export async function isTokenVerified(token) {
    return await client
        .db("moneyManagerDup")
        .collection("income/expenses")
        .findOne(
            {
                resetPasswordToken: token,
                expiresIn: { $gt: Date.now() },
            });
}