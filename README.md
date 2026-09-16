<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GEMOS - AI Studio App

Your AI-powered studio application powered by Google Gemini API.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- A Google Gemini API key

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API key:**
   - Create or edit the `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to `http://localhost:3000` to access the app

## How to Use

### Main Features

1. **Create a New Project**
   - Click "New Project" to start a fresh AI Studio workspace
   - Give your project a descriptive name

2. **Interact with AI Assistant**
   - Type your prompts or questions in the input field
   - The Gemini AI will process your request and provide responses
   - Use the chat history to reference previous interactions

3. **Configure Settings**
   - Access settings to adjust AI parameters and preferences
   - Customize the application behavior to your needs

4. **Export & Save**
   - Save your work locally or export to your AI Studio account
   - Access your saved projects from the dashboard

### Workflow Example

```
1. Start the app (npm run dev)
2. Create a new project or open an existing one
3. Enter your prompt or question
4. Review the AI's response
5. Refine or ask follow-up questions
6. Save your work when complete
```

## Troubleshooting

**API Key Issues:**
- Ensure your `GEMINI_API_KEY` is correctly set in `.env.local`
- Verify your API key is valid and has not expired

**Port Already in Use:**
- Change the development port by running: `npm run dev -- --port 3001`

## Additional Resources

- View your projects in AI Studio: https://ai.studio/apps/b1fb7ab5-dae6-40d4-a02c-e4d9c75d962e
- [Google Gemini API Documentation](https://ai.google.dev/)

## License

[Add your license information here]
