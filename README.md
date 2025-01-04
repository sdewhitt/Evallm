# Evallm - LLM Evaluation platform
A platform to evaluate Large Language Models (LLMs) for specific tasks.

Link: https://evallm.vercel.app

### Features
- User queries generate relevant responses from models by Meta, Google, and Mistral
- Users can view past experiments in a side panel, allowing them to pull up the respective analytics on click
- Cumulative statistics for each LLM are available on the "LLM Statistics" page
- LLM Statistics page also includes insights on each LLM's performance, generated using Meta's llama-3.1-8b-instant model

### Implementation Details
- All data, from prompts/evaluations to user authentication is stored in a MongoDB document
- Next.js / Tailwind css frontend
- Current list of models used for responses:
   - llama3-8b-8192
   - mixtral-8x7b-32768
   - gemma2-9b-it
- User authentication manually implemented
- LLM Responses evaluated based on:
   - Response time (ms)
   - % cosine similarity
   - % BLEU score
   - % ROUGE score

### Future Goals
- Proper encryption during authentication
- Statistical visualizations such as line graphs for the cumulative analytics
- More analysis metrics
   - Adjusted method for finding BLEU score so that its outputs are more unique
- External authentication methods like Google and GitHub
