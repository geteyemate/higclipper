"client";
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
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">HIGCLIPPER STUDIO</h1>
      <p className="text-gray-400 mb-8">Transform videos into high-retention 9:16 viral shorts using AI.</p>

      <form onSubmit={handleGenerate} className="w-full max-w-md bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-300">Select Video File (.mp4)</label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={(e) => setFile(e.target.files[0])}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer text-sm text-gray-400"
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Processing AI Clips..." : "Generate Clips"}
        </button>

        {error && <div className="p-3 bg-red-950 border border-red-800 text-red-200 rounded-lg text-sm">{error}</div>}
      </form>

      {clips.length > 0 && (
        <div className="w-full max-w-md mt-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Generated Viral Clips</h2>
          {clips.map((clip, index) => (
            <div key={index} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col gap-2">
              <h3 className="font-semibold">{clip.title}</h3>
              <p className="text-xs text-gray-400">Viral Score: {clip.viral_score}/100</p>
              <video controls src={`https://higclipper.onrender.com${clip.url}`} className="w-full rounded-lg mt-2" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
