import { useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!videoUrl) {
    return (
      <div className="w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center text-gray-400">
        無影片
      </div>
    );
  }

  // 判斷是否為 YouTube 連結
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  let youtubeId = "";

  if (isYoutube) {
    if (videoUrl.includes("youtube.com/watch?v=")) {
      youtubeId = videoUrl.split("v=")[1].split("&")[0];
    } else if (videoUrl.includes("youtu.be/")) {
      youtubeId = videoUrl.split("youtu.be/")[1].split("?")[0];
    }
  }

  return (
    <div className="w-full space-y-2">
      {isYoutube && youtubeId ? (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      ) : (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden group">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            controls
            muted={isMuted}
          />
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/50 hover:bg-black/75 text-white p-2 rounded-full"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      {title && <p className="text-gray-300 text-sm">{title}</p>}
    </div>
  );
}
