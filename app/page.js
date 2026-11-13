"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [clips, setClips] = useState([]);
  const [error, setError] = useState("");

  // 👇 YAHAN APNE RENDER WALA BACKEND URL DAL DENA (Bina aakhri slash '/' ke)
  const BACKEND_URL = "https://higclipper.onrender.com";

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setClips([]);
    setStatusText("Fetching video & analyzing viral moments with AI...");

    try {
      const res = await fetch(`${BACKEND_URL}/generate-clips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong!");
      }

      setClips(data.clips);
      setStatusText("Clips generated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12 selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-3">
          HigClipper ⚡
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base">
          AI-powered automated viral video clipper for Shorts & Reels.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="w-full max-w-2xl bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Paste YouTube Video URL (e.g., https://youtu.be/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/20 cursor-pointer flex items-center justify-center"
          >
            {loading ? "Processing..." : "Generate Clips"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-400 animate-pulse font-medium">{statusText}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl">
            ⚠️ Error: {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {clips.length > 0 && (
        <div className="w-full max-w-4xl mt-12">
          <h2 className="text-xl font-bold mb-6 text-neutral-200 border-b border-neutral-800 pb-2">
            🔥 Generated Viral Clips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clips.map((clip, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-950 text-purple-300 rounded-full border border-purple-800/50">
                      Score: {clip.viral_score}/100
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-100 mb-4 line-clamp-2">
                    {clip.title}
                  </h3>
                  {/* Vertical 9:16 Video Player Preview */}
                  <div className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4 border border-neutral-800">
                    <video
                      controls
                      src={`${BACKEND_URL}${clip.url}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <a
                  href={`${BACKEND_URL}${clip.url}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium py-2.5 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  ⬇️ Download MP4
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
