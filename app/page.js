"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState([]);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file first!");
      return;
    }

    setLoading(true);
    setError("");
    setClips([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://higclipper.onrender.com/generate-clips", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong!");
      }

      setClips(data.clips);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="z-10 text-center max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-purple-400 mb-4 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          AI-Powered Motion Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-3">
          HIGCLIPPER STUDIO
        </h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Transform long-form videos into high-retention 9:16 vertical shorts instantly using advanced AI models.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="z-10 w-full max-w-xl bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
          
          {/* Custom File Upload Box */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Source Video File
            </label>
            <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
              file ? "border-purple-500/50 bg-purple-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-950"
            }`}>
              <div className="flex flex-col items-center text-center">
                <svg className="w-10 h-10 text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {file ? (
                  <>
                    <span className="text-sm font-medium text-white mb-1">{file.name}</span>
                    <span className="text-xs text-purple-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-zinc-200 mb-1">Click to upload video or drag and drop</span>
                    <span className="text-xs text-zinc-500">MP4, MOV, WEBM up to 500MB</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="video/*" 
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="relative group overflow-hidden rounded-xl p-px font-semibold text-white transition-all disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 group-hover:opacity-90 transition-opacity"></span>
            <span className="relative block px-6 py-3.5 bg-zinc-950/20 rounded-xl backdrop-blur-sm text-center font-medium">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing AI Clips...
                </span>
              ) : (
                "Generate Viral Clips"
              )}
            </span>
          </button>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Generated Clips Grid */}
      {clips.length > 0 && (
        <div className="z-10 w-full max-w-xl mt-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white">Generated Viral Clips</h2>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">{clips.length} Clips Ready</span>
          </div>
          
          <div className="grid gap-4">
            {clips.map((clip, index) => (
              <div key={index} className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-white">{clip.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">High-retention 9:16 vertical crop</p>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                    <span className="text-xs font-semibold text-purple-300 font-mono">Score: {clip.viral_score}</span>
                  </div>
                </div>
                <video controls src={`https://higclipper.onrender.com${clip.url}`} className="w-full rounded-xl border border-zinc-800 bg-black aspect-[9/16] object-cover max-h-[400px]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
