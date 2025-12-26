## 🎓 VideoTutor - Interactive Video Learning Assistant

A powerful, production ready web application that transforms YouTube videos into interactive learning experiences. Students can ask questions about video content and get instant, accurate answers powered by AI.

![VideoTutor Banner](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **🎥 Smart Video Processing**: Automatically extracts and processes YouTube video transcripts
- **💬 Interactive Chat**: Ask unlimited questions about video content
- **🎯 Context-Aware Responses**: Only answers questions related to video content
- **🚀 Fast & Efficient**: Built with FastAPI for high performance
- **🎨 Beautiful UI**: Modern, responsive design with smooth animations
- **🔒 Secure**: Environment-based configuration for API keys

## 🏗️ Architecture

```
VideoTutor Chatbot/
├── app/
│   └──main.py                 # FastAPI application & routes
├── static/
│   ├── css/style.css           # Beautiful styling
│   └── js/app.js               # Frontend JavaScript
├── templates/
│   └── index.html              # Main HTML template
└── requirements.txt            # Python dependencies
```

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd educhat
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

## 📖 Usage

1. **Enter a YouTube URL**: Paste any YouTube video link that has captions/subtitles
2. **Wait for Processing**: The app will extract and process the video transcript
3. **Start Chatting**: Ask questions about the video content
4. **Get Instant Answers**: Receive accurate, context-aware responses

### Example Questions

- "Can you summarize the main points of this video?"
- "What examples were given about [topic]?"
- "Explain the concept of [specific topic] mentioned in the video"
- "What are the key takeaways?"

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required API Keys
COHERE_API_KEY=your_cohere_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Optional Settings
APP_NAME=EduChat
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

## 📊 Tech Stack

- **Backend**: FastAPI, Python 3.11
- **AI**: LangChain, Cohere, Groq, FAISS
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Docker, Docker Compose
- **APIs**: YouTube Transcript API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 👨‍💻 Author

**Khizar Ishtiaq**  
AI Engineer

- 💼 [LinkedIn](https://www.linkedin.com/in/khizar-ishtiaq-)
- 🐱 [GitHub](https://https://github.com/1Khizar)
- 📧 Email: <khizarishtiaq59@example.com>

- Built with ❤️ for students who want to learn smarter, not harder.

<!-- --- -->
