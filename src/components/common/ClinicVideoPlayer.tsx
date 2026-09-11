import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  ExternalLink,
  Video,
  AlertCircle,
  ShieldCheck,
  Ratio,
  Smartphone,
  Tv,
  Monitor,
  Sparkles,
  Shrink,
  Expand
} from 'lucide-react';

export type VideoAspectRatioMode = 'auto' | '16:9' | '4:3' | '9:16';
export type VideoWidthConstraint = 'centered' | 'full';

interface ClinicVideoPlayerProps {
  videoUrl?: string;
  videoTitle?: string;
  poster?: string;
  autoPlayOnClick?: boolean;
  className?: string;
  defaultAspectRatio?: VideoAspectRatioMode;
  defaultWidthConstraint?: VideoWidthConstraint;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function normalizeVideoUrl(rawUrl?: string): {
  type: 'youtube' | 'direct' | 'embed';
  src: string;
  embedUrl?: string;
  isLocal: boolean;
} {
  const url = (rawUrl || '/assets/videos/clinic_video.mp4').trim();

  // 1. YouTube check
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      type: 'youtube',
      src: url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      isLocal: false
    };
  }

  // 2. Other embed check (Vimeo)
  if (url.includes('vimeo.com')) {
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        type: 'embed',
        src: url,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        isLocal: false
      };
    }
  }

  // 3. Local or direct file check
  let normalized = url;
  if (!normalized.startsWith('http') && !normalized.startsWith('blob:') && !normalized.startsWith('data:')) {
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
  }

  return {
    type: 'direct',
    src: normalized,
    isLocal: normalized.startsWith('/')
  };
}

export const ClinicVideoPlayer: React.FC<ClinicVideoPlayerProps> = ({
  videoUrl,
  videoTitle = 'جولة داخل مركز د. محمد فوزي الماسة',
  poster = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
  autoPlayOnClick = true,
  className = '',
  defaultAspectRatio = 'auto',
  defaultWidthConstraint = 'centered'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string>(() => normalizeVideoUrl(videoUrl).src);
  const [aspectRatioMode, setAspectRatioMode] = useState<VideoAspectRatioMode>(() => {
    const saved = localStorage.getItem('almasa_video_aspect_mode');
    return (saved as VideoAspectRatioMode) || defaultAspectRatio;
  });
  const [widthConstraint, setWidthConstraint] = useState<VideoWidthConstraint>(() => {
    const saved = localStorage.getItem('almasa_video_width_constraint');
    return (saved as VideoWidthConstraint) || defaultWidthConstraint;
  });
  const [detectedRatio, setDetectedRatio] = useState<number | null>(null);
  const [showRatioSelector, setShowRatioSelector] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoMeta = normalizeVideoUrl(videoUrl);

  // Sync source if prop updates
  useEffect(() => {
    setActiveSource(normalizeVideoUrl(videoUrl).src);
  }, [videoUrl]);

  const handleStartPlay = () => {
    setVideoError(null);
    setIsPlaying(true);
    if (videoMeta.type === 'direct' && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn('Direct play fallback:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  };

  const handleVideoError = () => {
    if (activeSource !== '/assets/videos/clinic_video.mp4') {
      setActiveSource('/assets/videos/clinic_video.mp4');
      setVideoError('تم التحويل للفيديو المعتمد للمركز');
    } else {
      setVideoError('يمكنك فتح الفيديو بنافذة جديدة إذا لم يدعمه متصفحك');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = videoMeta.embedUrl || activeSource;
    window.open(target, '_blank');
  };

  const changeAspectRatio = (mode: VideoAspectRatioMode) => {
    setAspectRatioMode(mode);
    localStorage.setItem('almasa_video_aspect_mode', mode);
  };

  const toggleWidthConstraint = () => {
    const next = widthConstraint === 'centered' ? 'full' : 'centered';
    setWidthConstraint(next);
    localStorage.setItem('almasa_video_width_constraint', next);
  };

  // Determine computed aspect ratio style
  let computedAspectRatio: string;
  if (aspectRatioMode === 'auto') {
    if (detectedRatio) {
      computedAspectRatio = `${detectedRatio}`;
    } else {
      // Default to natural 16:9 or 4:3
      computedAspectRatio = '16 / 9';
    }
  } else if (aspectRatioMode === '16:9') {
    computedAspectRatio = '16 / 9';
  } else if (aspectRatioMode === '4:3') {
    computedAspectRatio = '4 / 3';
  } else if (aspectRatioMode === '9:16') {
    computedAspectRatio = '9 / 16';
  } else {
    computedAspectRatio = '16 / 9';
  }

  // Wrapper max-width classes: centered prevents wide stretching on large displays
  const widthClasses = widthConstraint === 'centered'
    ? aspectRatioMode === '9:16'
      ? 'max-w-xs mx-auto'
      : 'max-w-xl sm:max-w-2xl mx-auto'
    : 'w-full';

  return (
    <div
      className={`w-full min-w-0 flex flex-col items-center box-border ${className}`}
      dir="rtl"
    >
      <div 
        className={`w-full ${widthClasses} overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col transition-all duration-300`}
      >
        {/* Sleek Compact Header */}
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-900 gap-2 box-border">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h4 className="text-white text-xs font-bold truncate block w-full">
                {videoTitle}
              </h4>
              <span className="text-[10px] text-amber-400 font-medium truncate block">
                مركز د. محمد فوزي الماسة • المحلة
              </span>
            </div>
          </div>

          {/* Ratio & Constraint Quick Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Aspect Ratio Menu Toggle */}
            <button
              type="button"
              onClick={() => setShowRatioSelector(!showRatioSelector)}
              title="تعديل نسبة أبعاد الفيديو (لضبط العرض ومنع التمطيط)"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                showRatioSelector
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Ratio className="w-3 h-3 text-amber-400" />
              <span>
                {aspectRatioMode === 'auto'
                  ? 'تناسب تلقائي'
                  : aspectRatioMode === '16:9'
                  ? '16:9 عريض'
                  : aspectRatioMode === '4:3'
                  ? '4:3 متناسق'
                  : '9:16 طولي'}
              </span>
            </button>

            {/* Width Constraint toggle */}
            <button
              type="button"
              onClick={toggleWidthConstraint}
              title={widthConstraint === 'centered' ? 'توسيع العرض للحد الأقصى' : 'تحجيم متناسق ومريح في المنتصف'}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] transition cursor-pointer flex items-center gap-1 border border-slate-800"
            >
              {widthConstraint === 'centered' ? (
                <Expand className="w-3 h-3 text-slate-300" />
              ) : (
                <Shrink className="w-3 h-3 text-amber-400" />
              )}
            </button>

            <button
              type="button"
              onClick={openInNewTab}
              title="فتح في نافذة مستقلة"
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] transition cursor-pointer flex items-center gap-1 border border-slate-800"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Aspect Ratio Toolbar (when opened) */}
        {showRatioSelector && (
          <div className="w-full bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-1 text-[11px] flex-wrap animate-in fade-in duration-150">
            <span className="text-slate-400 text-[10px] font-bold">
              اختر نسبة أبعاد العرض لتفادي أي عرض زائد:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeAspectRatio('auto')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                  aspectRatioMode === 'auto'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                تلقائي (الأصلي)
              </button>
              <button
                type="button"
                onClick={() => changeAspectRatio('4:3')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition flex items-center gap-0.5 ${
                  aspectRatioMode === '4:3'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Tv className="w-2.5 h-2.5" />
                <span>4:3 متناسق</span>
              </button>
              <button
                type="button"
                onClick={() => changeAspectRatio('16:9')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition flex items-center gap-0.5 ${
                  aspectRatioMode === '16:9'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Monitor className="w-2.5 h-2.5" />
                <span>16:9 عريض</span>
              </button>
              <button
                type="button"
                onClick={() => changeAspectRatio('9:16')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition flex items-center gap-0.5 ${
                  aspectRatioMode === '9:16'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Smartphone className="w-2.5 h-2.5" />
                <span>9:16 طولي (ريلز)</span>
              </button>
            </div>
          </div>
        )}

        {/* Video Canvas Container (Strictly preserves aspect ratio and prevents any horizontal warping) */}
        <div 
          className="relative w-full bg-black flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: computedAspectRatio,
            maxHeight: '65vh'
          }}
        >
          {isPlaying ? (
            videoMeta.type === 'youtube' || videoMeta.type === 'embed' ? (
              <iframe
                src={videoMeta.embedUrl}
                title={videoTitle}
                className="w-full h-full max-w-full border-0 block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full max-w-full overflow-hidden flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeSource}
                  controls
                  autoPlay={autoPlayOnClick}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const el = e.currentTarget;
                    if (el.videoWidth && el.videoHeight) {
                      const ratio = el.videoWidth / el.videoHeight;
                      setDetectedRatio(ratio);
                    }
                  }}
                  className="w-full h-full max-w-full max-h-full object-contain bg-black block"
                  poster={poster}
                  onError={handleVideoError}
                >
                  <source src={activeSource} type="video/mp4" />
                  <source src="/assets/videos/clinic_video.mp4" type="video/mp4" />
                  <source src="/uploads/clinic_video.mp4" type="video/mp4" />
                </video>

                {/* Floating overlay buttons */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-xs transition cursor-pointer"
                    title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleFullScreen}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-xs transition cursor-pointer"
                    title="تكبير الشاشة"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-200" />
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Cover & Centered Play Trigger with object-contain to avoid horizontal stretching */
            <div 
              className="relative w-full h-full max-w-full cursor-pointer group flex items-center justify-center overflow-hidden bg-slate-950" 
              onClick={handleStartPlay}
            >
              {/* Proportional background & poster */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={poster}
                  alt={videoTitle}
                  className="w-full h-full object-contain opacity-75 group-hover:scale-102 transition duration-300"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30 flex flex-col items-center justify-center p-3 text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-500 group-hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transform group-hover:scale-110 active:scale-95 transition duration-200">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>

                <div className="min-w-0 max-w-full px-2 overflow-hidden">
                  <h4 className="text-white font-bold text-xs truncate">
                    {videoTitle}
                  </h4>
                  <p className="text-amber-300 text-[10px] font-medium mt-0.5">
                    اضغط هنا للمشاهدة بأبعاد متناسقة 🎬
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-[9px] text-white font-medium">
                    HD متناسق
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    معتمد رسمياً
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Bar if any */}
        {videoError && (
          <div className="w-full max-w-full min-w-0 px-3 py-1.5 bg-rose-500/10 text-rose-300 text-[10px] flex items-center justify-between gap-1 border-t border-rose-500/20 box-border">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">{videoError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSource('/assets/videos/clinic_video.mp4');
                setVideoError(null);
                setIsPlaying(true);
              }}
              className="text-[9px] text-amber-400 font-bold hover:underline shrink-0"
            >
              إعادة
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-950 text-slate-400 text-[10px] border-t border-slate-900 box-border">
          <span className="truncate min-w-0 flex-1">
            أحدث تقنيات زراعة وتجميل الأسنان • المحلة الكبرى
          </span>
          <span className="text-emerald-400 text-[9px] font-bold shrink-0 mr-2">
            مركز د. محمد فوزي ✓
          </span>
        </div>
      </div>
    </div>
  );
};
