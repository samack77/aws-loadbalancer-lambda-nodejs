import { MongoClient, ObjectId } from "mongodb";


const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
const db = client.db("mydb");
const User = db.collection("users");

export const handler = async (event) => {
    const body = JSON.parse(event.body);
    const { userId, validate } = body;

    const response = {
        error: false,
        status: 200,
        data: {}
    };

    try {
        const user = await User.findOne({ _id: new ObjectId(userId) });
        console.log('====== user ======', user);

        if (user) {
            const d = new Date();
            if (validate) {
                await User.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { validated: true, validationDate: d } }
                );
            }
            response.data = {
                user: user,
                validated: validate ? true : user.validated,
                validationDate: validate ? d : (user.validationDate ? user.validationDate : '')
            };
        } else {
            response.error = true;
            response.status = 404;
        }
    } catch (error) {
        console.log('======= error ========', error)
        response.error = true;
        response.status = 500;
    }

    return {
        statusCode: 200,
        statusDescription: "200 OK",
        isBase64Encoded: False,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(response)
    }
};