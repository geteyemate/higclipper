import os
import json
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yt_dlp
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("clips", exist_ok=True)
app.mount("/clips", StaticFiles(directory="clips"), name="clips")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

class VideoRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"status": "HigClipper Backend is Live!"}

@app.post("/generate-clips")
async def generate_clips(req: VideoRequest):
    try:
        video_path = "input.mp4"
        audio_path = "audio.mp3"
        
        for f in [video_path, audio_path]:
            if os.path.exists(f):
                os.remove(f)

        # 1. Direct yt-dlp download with universal options
        ydl_opts = {
            'format': 'mp4/best',
            'outtmpl': video_path,
            'overwrites': True,
            'noplaylist': True,
            'extractor_args': {'youtube': {'player-client': ['android']}},
            'socket_timeout': 30
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([req.url])
        except Exception as yt_err:
            raise HTTPException(status_code=400, detail=f"Download failed: {str(yt_err)}")

        if not os.path.exists(video_path) or os.path.getsize(video_path) == 0:
            raise HTTPException(status_code=400, detail="Downloaded video file is empty or missing.")

        # 2. Audio extract via FFmpeg
        subprocess.run([
            "ffmpeg", "-y", "-i", video_path, "-vn", 
            "-acodec", "libmp3lame", "-q:a", "4", audio_path
        ], check=True)

        # 3. Groq Whisper se Transcript
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_path, file.read()),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
            )

        segments = transcription.segments
        transcript_text = "\n".join([f"[{s['start']:.1f}s - {s['end']:.1f}s]: {s['text']}" for s in segments])

        # 4. Groq Llama-3 se Viral Moments
        prompt = f"""
        Analyze this video transcript with timestamps and find the top 3 most engaging, viral-worthy clips (each 20 to 50 seconds long).
        Return ONLY a valid JSON array or an object containing a 'clips' array with objects having: "title", "start" (number in seconds), "end" (number in seconds), and "viral_score" (1-100).
        
        Transcript:
        {transcript_text[:15000]}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )

        ai_response = json.loads(chat_completion.choices[0].message.content)
        clips_data = ai_response if isinstance(ai_response, list) else ai_response.get("clips", list(ai_response.values())[0])

        output_clips = []

        # 5. FFmpeg se 9:16 Crop & Cut
        for idx, clip_info in enumerate(clips_data[:3]):
            start = float(clip_info["start"])
            duration = float(clip_info["end"]) - start
            if duration <= 0:
                duration = 30.0
            
            out_name = f"clip_{idx+1}.mp4"
            out_path = os.path.join("clips", out_name)

            subprocess.run([
                "ffmpeg", "-y", "-ss", str(start), "-i", video_path,
                "-t", str(duration),
                "-vf", "crop=ih*(9/16):ih",
                "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac",
                out_path
            ], check=True)

            output_clips.append({
                "title": clip_info.get("title", f"Viral Clip {idx+1}"),
                "viral_score": clip_info.get("viral_score", 90),
                "url": f"/clips/{out_name}"
            })

        return {"status": "success", "clips": output_clips}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
