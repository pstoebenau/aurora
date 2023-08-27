import { OpenAI } from 'langchain/llms/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BufferMemory } from 'langchain/memory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import 'dotenv/config';
import path from 'path';

export const run = async () => {
	/* Initialize the LLM to use to answer the question */
	const model = new OpenAI({ openAIApiKey: process.env.OPEN_API_KEY, modelName: 'gpt-4' });
	/* Load in the files we want to do question answering over */
	const loader = new DirectoryLoader(path.join(__dirname, '..', '..', 'documents'), {
		'.md': (path) => new TextLoader(path)
	});
	const docs = await loader.load();
	/* Create the vectorstore */
	const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
	/* Create the chain */
	const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
		memory: new BufferMemory({
			memoryKey: 'chat_history' // Must be set to "chat_history"
		})
	});
	/* Ask it a question */
	const question =
		'How do I make a 3d snake game in bevy? Generate a list of steps to accomplish this task.';
	const res = await chain.call({ question });
	console.log(res);
	/* Ask it a follow up question */
	const followUpRes = await chain.call({
		question: 'Do step 1'
	});
	console.log(followUpRes);
};

run();
