/*import Groq from 'groq-sdk';
// TODO: Import more LLMs

const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})*/

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log('Query:', body.message);


        // Call function to retrieve output for each LLM


        const placeholder = "placeholder for \'response\'";


        return new Response(JSON.stringify({ message: placeholder }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}