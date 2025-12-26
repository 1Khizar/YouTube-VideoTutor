import os
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from youtube_transcript_api import TranscriptsDisabled
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import YoutubeLoader
from langchain_cohere import CohereEmbeddings
from langchain_groq import ChatGroq
from langchain_core.runnables import (
    RunnableParallel,
    RunnablePassthrough,
    RunnableLambda,
)
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# GLOBAL OBJECTS (simple MVP)
vector_store = None
main_chain = None


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/load-video")
async def load_video(video_url: str = Form(...)):
    global vector_store, main_chain

    # ------------------------
    # Load YouTube transcript
    # ------------------------
    try:
        loader = YoutubeLoader.from_youtube_url(
            video_url,
            add_video_info=False
        )
        transcript = loader.load()

    except TranscriptsDisabled:
        return JSONResponse(
            {"error": "No captions available for this video."},
            status_code=400
        )

    # -----------------
    # Split transcript
    # -----------------
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(transcript)

    # -------------------------
    # Embeddings & Vector Store
    # -------------------------
    embeddings = CohereEmbeddings(
        cohere_api_key=os.getenv("COHERE_API_KEY"),
        model="embed-v4.0"
    )

    vector_store = FAISS.from_documents(chunks, embeddings)

    # ----------
    # Retriever
    # ----------
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}
    )

    # ----
    # LLM
    # ----
    llm = ChatGroq(model="llama-3.3-70b-versatile")

    # -------
    # Prompt
    # -------
    prompt = PromptTemplate(
        template="""
You are a helpful assistant.
Answer ONLY from the provided transcript context.
If the context is insufficient, just say you don't know.

{context}
Question: {question}
""",
        input_variables=["context", "question"]
    )

    # --------------------------------------
    # Parallel chain for context + question
    # --------------------------------------
    def format_docs(retrieved_docs):
        return "\n\n".join(doc.page_content for doc in retrieved_docs)

    parallel_chain = RunnableParallel({
        "context": retriever | RunnableLambda(format_docs),
        "question": RunnablePassthrough(),
    })

    # -------
    # Parser
    # -------
    parser = StrOutputParser()

    # -----------
    # Main chain
    # -----------
    main_chain = parallel_chain | prompt | llm | parser

    return {"status": "Video loaded successfully"}


@app.post("/ask")
async def ask_question(question: str = Form(...)):
    if main_chain is None:
        return JSONResponse(
            {"error": "No video loaded yet."},
            status_code=400
        )

    answer = main_chain.invoke(question)
    return {"answer": answer}
