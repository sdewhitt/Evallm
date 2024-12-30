import mongoose, { Document, Schema } from 'mongoose';

interface IExperiment extends Document {
  userPrompt: string;
  expectedOutput: string;
  response: string;
  evaluation: {
    responseTime: number;
    exactMatch: boolean;
    similarity: number;
    bleu: number;
    rouge1: number;
    rouge2: number;
    perplexity: number;
  };
}

const ExperimentSchema: Schema = new Schema({
  userPrompt: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  response: { type: String, required: true },
  evaluation: {
    responseTime: { type: Number, required: true },
    exactMatch: { type: Boolean, required: true },
    similarity: { type: Number, required: true },
    bleu: { type: Number, required: true },
    rouge1: { type: Number, required: true },
    rouge2: { type: Number, required: true },
    perplexity: { type: Number, required: true },
  },
});

const Experiment = mongoose.model<IExperiment>('Experiment', ExperimentSchema);

export default Experiment;