import Groq from 'groq-sdk';
// TODO: Import more LLMs

const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
    try {
        const body = await req.json();
    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}