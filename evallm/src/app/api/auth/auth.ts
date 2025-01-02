/*import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signIn, signOut, useSession } from "next-auth/react";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import { MongoClient, ServerApiVersion, UpdateFilter, Document } from 'mongodb';

const mongoDB_client = new MongoClient(process.env.MONGODB_URI as string, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {

                try {
                    if (!credentials || !credentials.email || !credentials.password) {
                        return null;
                    }
                    await mongoDB_client.connect();
    
                    // Send a ping to confirm a successful connection
                    await mongoDB_client.db("admin").command({ ping: 1 });
                    console.log("Pinged your deployment. You successfully connected to MongoDB!");
            
                    const database = mongoDB_client.db('Evallm');
                    const collection = database.collection('Users');
            
                    const dbUser = await collection.findOne({username: credentials.email});
    
    
                    // TODO: encrypt passwords in production
                    if (dbUser && dbUser.password === credentials.password) {
                        const { password, createdAt, ...dbUserWithoutPassword } = dbUser;
                        await mongoDB_client.close();
                        return { dbUserWithoutPassword, id: dbUserWithoutPassword._id.toString() } as User;
                    }
                }
                finally {
                    await mongoDB_client.close();
                }
                return null;
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ]
}*/