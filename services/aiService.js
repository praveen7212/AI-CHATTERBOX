const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const aiService = async (message) => {
    try {
        const response = await client.responses.create({
            model: "gpt-5",
            input: message
        });

        return response.output_text;

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw new Error("AI response failed");
    }
};

module.exports = aiService;