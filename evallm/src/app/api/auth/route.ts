import { UpdateFilter, Document } from 'mongodb';
import client from '../../mongo';


export async function POST(req: Request) {

    try {
        const body = await req.json();

        console.log('\nEmail:', body.email);
        console.log('Password:', body.password);

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        const database = client.db('Evallm');
        const collection = database.collection('Users');

        const userDoc = await collection.findOne({email: body.email});
        if (userDoc) { // Email match found -> verify password -> login and fetch past data
            if (userDoc.password !== body.password) {
                console.log(`${body.email} failed to log in. Incorrect password.`);
                throw new Error('Incorrect password');
            }
            console.log(`${body.email} logged in successfully!`);

            // Log the sign in
            const update: UpdateFilter<Document> = {
                $set: {latestLogin: new Date().toISOString()},
            };

            const result = await collection.updateOne({email: body.email}, update);
            if (result.modifiedCount > 0) {
                console.log(`Data successfully added to ${body.email}'s document.`);
            } else {
                console.log(`No changes were made to ${body.email}'s document.`);
            }


            // Load past user data
            const promptCollection = database.collection('User Prompts + Evaluations');
            const userPromptDoc = await promptCollection.findOne({username: body.email});

            await client.close();
            return new Response(JSON.stringify(
                {   
                    success: true, 
                    prompts: userPromptDoc !== null ? userPromptDoc.prompts : []
                }), 
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
        else { // No matching email found -> register new user

            const newUserDoc = {
                email: body.email,
                password: body.password,
                timeRegistered: new Date().toISOString(),
                latestLogin: new Date().toISOString(),
            }
            const result = await collection.insertOne(newUserDoc);
            console.log(`New registration created for ${body.email} with ID: ${result.insertedId}`);

            await client.close();
            return new Response(JSON.stringify({ success: true, prompts: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        //console.error('Error in POST request:', error);
        await client.close();
        return new Response(JSON.stringify({ error: error as Error, success: false }), { status: 500 });
    } 
}