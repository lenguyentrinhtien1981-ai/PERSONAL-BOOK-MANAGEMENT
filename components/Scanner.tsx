import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, ZapOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { analyzeBookCover } from '../services/geminiService';

export const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  const startCamera = async () => {
    setCameraError('');
    try {
      // Mobile fix: Remove specific width/height constraints to prevent OverconstrainedError on some devices
      const constraints = {
        video: { 
          facingMode: 'environment'
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Required for some iOS versions to ensure playback starts
        try {
            await videoRef.current.play();
        } catch (e) {
            console.log("Auto-play failed, waiting for interaction", e);
        }
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setCameraError("Không thể truy cập camera. Vui lòng cấp quyền hoặc tải ảnh lên.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const getResizedImage = (source: HTMLVideoElement | HTMLImageElement): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const MAX_DIMENSION = 800; // Safe limit for API payload
    
    let width = 0;
    let height = 0;

    if (source instanceof HTMLVideoElement) {
       width = source.videoWidth;
       height = source.videoHeight;
    } else {
       width = source.width;
       height = source.height;
    }

    // If dimensions are missing, return empty to trigger retry/error
    if (width === 0 || height === 0) return '';

    // Calculate aspect ratio
    if (width > height) {
      if (width > MAX_DIMENSION) {
        height = Math.round(height * (MAX_DIMENSION / width));
        width = MAX_DIMENSION;
      }
    } else {
      if (height > MAX_DIMENSION) {
        width = Math.round(width * (MAX_DIMENSION / height));
        height = MAX_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw white background first (for transparent PNGs converted to JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(source, 0, 0, width, height);
      // 0.7 quality is optimal for text recognition while keeping payload small
      return canvas.toDataURL('image/jpeg', 0.7);
    }
    return '';
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Mobile fix: Check videoWidth specifically instead of just readyState
    // readyState 2 (HAVE_CURRENT_DATA) is enough for a single frame capture
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
        console.warn("Camera not ready yet");
        return;
    }

    setIsProcessing(true);

    try {
        const imageDataUrl = getResizedImage(videoRef.current);
        if (imageDataUrl && imageDataUrl.length > 100) { // Basic length check
            await processImage(imageDataUrl);
        } else {
            throw new Error("Captured frame was empty");
        }
    } catch (e) {
        console.error(e);
        setIsProcessing(false);
        alert("Không thể chụp ảnh. Vui lòng thử lại hoặc tải ảnh lên.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
             try {
                const resizedBase64 = getResizedImage(img);
                if (resizedBase64) {
                    await processImage(resizedBase64);
                } else {
                    throw new Error("Image resize failed");
                }
             } catch (err) {
                console.error(err);
                setIsProcessing(false);
                alert("Không thể xử lý ảnh này.");
             }
        };
        img.onerror = () => {
            setIsProcessing(false);
            alert("File ảnh lỗi.");
        };
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64Image: string) => {
    try {
      const analysis = await analyzeBookCover(base64Image);
      navigate('/review', { 
        state: { 
          image: base64Image, 
          analysis 
        } 
      });
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Không thể phân tích sách. Hãy đảm bảo ảnh rõ nét và thử lại.");
    }
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if ((capabilities as any).torch) {
        track.applyConstraints({
          advanced: [{ torch: !isFlashOn }] as any
        }).catch(e => console.log(e));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pt-safe">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X size={24} />
        </button>
        {!cameraError && (
          <button 
            onClick={toggleFlash}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            {isFlashOn ? <Zap size={24} className="text-yellow-400 fill-current" /> : <ZapOff size={24} />}
          </button>
        )}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-zinc-900 overflow-hidden flex items-center justify-center">
        {cameraError ? (
          <div className="text-center p-6 max-w-xs">
             <p className="text-white mb-4">{cameraError}</p>
             <button 
               onClick={startCamera}
               className="px-4 py-2 bg-emerald-600 rounded-lg text-white text-sm font-bold"
             >
               Thử lại
             </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
        )}
        
        {/* Scanner Overlay */}
        {!cameraError && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-black/50 mask-box"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-[2/3] border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-sm"></div>
              
              {isProcessing && (
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan"></div>
              )}
            </div>
            <p className="absolute top-[15%] w-full text-center text-white/80 font-medium text-sm drop-shadow-md">
              Căn bìa sách vào khung hình
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-32 bg-black flex items-center justify-center gap-10 pb-safe relative z-20">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          <ImageIcon size={24} />
        </button>

        <button 
          onClick={handleCapture}
          disabled={isProcessing || !!cameraError}
          className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center relative group ${cameraError ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`w-12 h-12 bg-white rounded-full transition-transform ${isProcessing ? 'scale-90 opacity-50' : 'group-active:scale-90'}`}></div>
          {isProcessing && <Loader2 className="absolute text-emerald-600 animate-spin" size={32} />}
        </button>

        <div className="w-12"></div> {/* Spacer for balance */}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};