import Groq from 'groq-sdk';
import OpenAI from 'openai';
import stringSimilarity from 'string-similarity';


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
        const llmResponseList: { [key: string]: any } = {};

        const responses = await Promise.all(
            LLMs.map(model => llmResponse(model, body.message, body.expectedOutput))
        );

        LLMs.forEach((model, index) => {
            llmResponseList[model] = responses[index];
        });


        //console.log('\n\n\n\nLLM Response List:', llmResponseList);



        return new Response(JSON.stringify({ results: llmResponseList }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}


async function llmResponse(model: string, userPrompt: string, expectedOutput: string) {
    const systemPrompt = "You are an LLM who answers questions CONCISELY. Your response WILL be compared to an expected output.";

    const start = performance.now();

    const llmResponse = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }, // Add the new user prompt
                ],
            model: model,
        }
    );


    // Track response time
    const responseTime = performance.now() - start;
    console.log(`Response time for ${model}: ${responseTime} ms`);

    let response = llmResponse.choices[0].message.content;
    response = response ? response.trim() : '';

    console.log(`${model} Chat completion:`, response);

    //return response;

    // List of evaluation metrics: (inspired by G-Eval)
    // 1. Response time
    // 2. Exact match
    // 3. Similarity, measured by cosine similarity
    // 4. Relevance, measured by cosine similarity
    // 5. BLEU score
    // 6. ROUGE score
    // 7. Perplexity

    // Calculate cosine similarity
    const cosineSimilarity = stringSimilarity.compareTwoStrings(expectedOutput, response);
    console.log(`Cosine similarity: ${cosineSimilarity}\n`);


    let evaluation = {
        responseTime: responseTime,
        exactMatch: expectedOutput === response,
        similarity: cosineSimilarity,
        relevance: 0,
        bleu: 0,
        rouge: 0,
        perplexity: 0,
    };
    return [response, evaluation];
}
