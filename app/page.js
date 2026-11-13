"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [clips, setClips] = useState([]);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://higclipper.onrender.com";

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setClips([]);
    setStatusText("Analyzing video structure & extracting key moments...");

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
      setStatusText("Clips generated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#060608] text-neutral-100 flex flex-col items-center px-6 py-16 selection:bg-white selection:text-black font-sans">
      
      {/* Navigation / Brand Header */}
      <nav className="w-full max-w-4xl flex items-center justify-between mb-16 border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
          <span className="font-semibold tracking-wider text-sm uppercase text-neutral-300">HigClipper Studio</span>
        </div>
        <span className="text-xs text-neutral-500 font-mono">v1.0 Production</span>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white mb-4">
          Motion intelligence for creators.
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto font-light">
          Transform long-form YouTube videos into high-retention 9:16 vertical shorts instantly using advanced AI models.
        </p>
      </div>

      {/* Input Console */}
      <div className="w-full max-w-2xl bg-[#0c0c10] border border-neutral-800/80 p-3 rounded-2xl shadow-2xl backdrop-blur-xl mb-16">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="Paste YouTube URL (https://youtube.com/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1 bg-[#121216] border border-neutral-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-medium px-7 py-3.5 rounded-xl transition-all text-sm tracking-wide cursor-pointer flex items-center justify-center"
          >
            {loading ? "Processing..." : "Generate Clips"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 py-4 flex flex-col items-center justify-center space-y-3 border-t border-neutral-900">
            <div className="w-5 h-5 border-2 border-neutral-400 border-t-white rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-400 font-mono tracking-wide">{statusText}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 text-red-300 text-xs rounded-xl font-mono">
            Error: {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {clips.length > 0 && (
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-8 border-b border-neutral-900 pb-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-400">
              Generated Assets ({clips.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clips.map((clip, index) => (
              <div
                key={index}
                className="bg-[#0c0c10] border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-neutral-700 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-neutral-900 text-neutral-300 rounded-full border border-neutral-800">
                      Score: {clip.viral_score}
                    </span>
                  </div>
                  <h3 className="font-normal text-sm text-neutral-200 mb-5 line-clamp-2 leading-relaxed">
                    {clip.title}
                  </h3>
                  {/* Vertical 9:16 Video Player Preview */}
                  <div className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden mb-5 border border-neutral-900 relative">
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
                  className="w-full bg-[#16161c] hover:bg-neutral-800 text-neutral-200 text-xs font-medium py-3 rounded-xl text-center transition-colors flex items-center justify-center gap-2 border border-neutral-800"
                >
                  Download MP4
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
