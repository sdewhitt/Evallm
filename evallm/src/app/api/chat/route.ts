import Groq from 'groq-sdk';
// TODO: Import more LLMs

const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log('Query:', body.message);
        console.log('Expected Output:', body.expectedOutput);


        // Call function to retrieve output for each LLM
        const LLMs = ['llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
        const llmResponseList: { [key: string]: Promise<any> } = {};

        for (const model of LLMs) {
            llmResponseList[model] = llmResponse(body.message, model);
        }


        return new Response(JSON.stringify({ message: llmResponseList }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}


async function llmResponse(userPrompt: string, model: string) {
    const systemPrompt = "You are an LLM who answers questions.";


    const llmResponse = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }, // Add the new user prompt
                ],
            model: model,
        }
    );


    let response = llmResponse.choices[0].message.content;
    response = response ? response.trim() : '';

    console.log(`\n${model} Chat completion:\n`, response);

    return response;
}