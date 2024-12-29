import Groq from 'groq-sdk';
import stringSimilarity from 'string-similarity';
import { nGram } from 'n-gram';
import { Rouge } from 'rouge';


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
            LLMs.map(model => llmResponseEvaluation(model, body.message, body.expectedOutput))
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


async function llmResponseEvaluation(model: string, userPrompt: string, expectedOutput: string) {
    const systemPrompt = "You are an LLM who answers questions CONCISELY. Your response WILL be compared to an expected output that you do not have access to, so do not add fluff.";

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
    // 2. Exact match/Accuracy
    // 3. Similarity, measured by cosine similarity
    // 4. BLEU score
    // 5. ROUGE score
    // 6. Perplexity

    // Calculate cosine similarity
    const cosineSimilarity = stringSimilarity.compareTwoStrings(expectedOutput, response);
    console.log(`Cosine similarity: ${cosineSimilarity}\n`);



    const evaluation = {
        "responseTime": responseTime,
        "exactMatch": expectedOutput === response,
        "similarity": cosineSimilarity,
        "bleu": calculateBleu(expectedOutput, response),
        "rouge": 0,
        "perplexity": 0,
    };
    return {"response": response, "evaluation": evaluation};
}






// Function to calculate BLEU score
function calculateBleu(reference: string, candidate: string): number {
    const referenceTokens = reference.split(' ');
    const candidateTokens = candidate.split(' ');

    const n = 4; // bigram -> 4-gram
    let precision = 0;
    for (let i = 2; i <= n; i++) {
        const referenceNGram = nGram(i)(referenceTokens).map(ngram => [ngram]);
        const candidateNGram = nGram(i)(candidateTokens).map(ngram => [ngram]);

        const nGramPrecision = calculatePrecision(referenceNGram, candidateNGram);
        precision += nGramPrecision;
    }

    precision /= n;

    const brevityPenalty = Math.min(1, Math.exp(1 - referenceTokens.length / candidateTokens.length));

    return brevityPenalty * precision;
}

function calculatePrecision(referenceNgrams: string[][], candidateNgrams: string[][]): number {
    const referenceNgramSet = new Set(referenceNgrams.map(ngram => ngram.join(' ')));
    const candidateNgramSet = new Set(candidateNgrams.map(ngram => ngram.join(' ')));

    const matchingNgrams = [...candidateNgramSet].filter(ngram => referenceNgramSet.has(ngram)).length;

    return matchingNgrams / candidateNgrams.length;
}

function calculateRouge(reference: string, candidate: string) {
    const rouge = new Rouge();
    const scores = rouge.score(candidate, reference);
    return scores;
}