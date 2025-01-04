import Groq from 'groq-sdk';
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})


export async function POST(req: Request) {

    try {

        const body = await req.json();

        //console.log('\nLLM Stats:', body.llmStatistics);
        //console.log('\nExperiments:', body.experimentArray);

        const statsAndExperiments = {
            llmCumulativeStats: body.llmStatistics,
            experiments: body.experimentArray,
        };


        // Splitting sentences for easier readability
        const personality = "You are a tool that generates helpful insights for users regarding their data, searching for patterns that the user may not notice at first sight while being concise and clear. "
        const dataDescription = "The data you will be fed is for an LLM evaluation platform where users input both a prompt and an expected output to assess which model best fits their needs. "
        const bleuRougeInfo = "The BLEU and ROUGE scores will be from 0 to 100 in this context compared to 0 to 1 to represent percentages. ";
        const accuracyInsurance = "The accuracy of your response is crucial. Please double check any insights you make before you present them.";



        const systemPrompt = personality + dataDescription + bleuRougeInfo;
        const llmResponse = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(statsAndExperiments) }, // Add the new user prompt
                    ],
                model: "llama-3.1-8b-instant", //response_format: {"type" : "json_object"}
            },
        );
        let response = llmResponse.choices[0].message.content;
        response = response ? response.trim() : '';


        return new Response(JSON.stringify({ Analysis: response }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }

}