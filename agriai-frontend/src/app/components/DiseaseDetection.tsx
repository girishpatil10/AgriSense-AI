import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Scan,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  FileImage,
  Zap,
  Shield,
  Droplets,
  Sparkles,
  Bug,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { toast } from 'sonner';

interface ScanResult {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Healthy' | 'Infected';
  description: string;
  treatments: string[];
  prevention: string[];
}

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setScanComplete(false);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(s);
      setIsCameraOpen(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured_plant.jpg", { type: "image/jpeg" });
            handleImageUpload(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const startScan = async () => {
    if (!imageFile) return;

    setIsScanning(true);
    setScanComplete(false);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.predictDisease(formData);

      setScanResult({
        disease: response.disease_name,
        confidence: response.confidence * 100,
        severity: response.severity as any,
        status: response.is_healthy ? 'Healthy' : 'Infected',
        description: `Scientific Name: ${response.scientific_name}. This assessment is based on the visual characteristics detected by our AI model.`,
        treatments: [
          `Chemical: ${response.treatment.chemical}`,
          `Biological: ${response.treatment.biological}`,
          `Cultural: ${response.treatment.cultural}`
        ],
        prevention: [
          'Maintain regular monitoring',
          'Practice good crop rotation',
          'Ensure proper sanitation of tools'
        ]
      });
      setScanComplete(true);
      toast.success('Analysis complete!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze image');
      toast.error('Analysis failed');
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'from-red-500 to-rose-600';
      case 'High': return 'from-orange-500 to-amber-600';
      case 'Medium': return 'from-yellow-500 to-orange-500';
      case 'Low': return 'from-emerald-500 to-green-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Disease Detection</h1>
      </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {!selectedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`backdrop-blur-lg bg-white/60 rounded-3xl p-8 border-2 border-dashed transition-all ${
                    isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-300'
                  }`}
                >
                  <div className="text-center space-y-6">
                    <div className="inline-flex p-6 rounded-full bg-emerald-100 text-emerald-600">
                      <FileImage className="w-16 h-16" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Plant Image</h3>
                      <p className="text-gray-600">Drag and drop your image here, or click to browse</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" /> Choose File
                      </button>
                      <button
                        onClick={startCamera}
                        className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" /> Use Camera
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-6 border border-emerald-100 shadow-sm overflow-hidden">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 group">
                      <img src={selectedImage} alt="Plant preview" className="w-full h-auto" />
                      {isScanning && (
                        <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px]">
                          <div className="scanning-line" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-6">
                      {!isScanning && !scanComplete && (
                        <button
                          onClick={startScan}
                          className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold"
                        >
                          <Scan className="w-5 h-5" /> Start AI Scan
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setScanComplete(false);
                          setScanResult(null);
                          setIsScanning(false);
                        }}
                        className="px-6 py-4 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Sparkles, label: 'AI Powered', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                  { icon: Zap, label: 'Instant', color: 'text-blue-600', bg: 'bg-blue-100' },
                  { icon: Shield, label: 'Secure', color: 'text-violet-600', bg: 'bg-violet-100' }
                ].map((item, i) => (
                  <div key={i} className="backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-emerald-100 text-center">
                    <div className={`p-2 rounded-lg ${item.bg} inline-block mb-2`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="text-xs font-bold text-gray-700">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {scanComplete && scanResult ? (
                <>
                  <div className={`backdrop-blur-lg bg-gradient-to-br ${
                    scanResult.status === 'Healthy' ? 'from-emerald-600 to-green-600' : 'from-red-600 to-rose-600'
                  } rounded-3xl p-8 text-white shadow-xl`}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-8 h-8" />
                          <h2 className="text-3xl font-bold">{scanResult.status}</h2>
                        </div>
                        <p className="text-lg opacity-90">{scanResult.disease}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Confidence Score</span>
                        <span className="font-bold">{Math.round(scanResult.confidence)}%</span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${scanResult.confidence}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Severity Level</h3>
                    <div className={`w-full h-12 rounded-xl bg-gradient-to-r ${getSeverityColor(scanResult.severity)} flex items-center justify-center text-white font-bold`}>
                      {scanResult.severity}
                    </div>
                  </div>

                  <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{scanResult.description}</p>
                  </div>

                  <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-emerald-600" /> Treatment Guide
                    </h3>
                    <div className="space-y-4">
                      {scanResult.treatments.map((t, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">{i+1}</div>
                          <p className="text-gray-700">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-12 border border-emerald-100 text-center shadow-sm h-full flex flex-col justify-center">
                  <div className="inline-flex p-6 rounded-full bg-emerald-100 text-emerald-600 mb-6 mx-auto">
                    <Bug className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Instant Diagnosis</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Upload or snap a photo of a plant leaf to detect diseases and get treatment advice instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
      
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            <video 
              ref={(el) => {
                if (el && stream) el.srcObject = stream;
                videoRef.current = el;
              }}
              autoPlay playsInline className="w-full h-auto" 
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <button onClick={stopCamera} className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X /></button>
              <button onClick={capturePhoto} className="p-6 bg-white rounded-full text-emerald-600 shadow-xl hover:scale-110 transition-all"><Camera className="w-8 h-8" /></button>
            </div>
            <div className="absolute top-4 left-4 text-white text-xs font-bold bg-red-500/80 px-3 py-1 rounded-full animate-pulse">LIVE</div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        .scanning-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
      `}</style>
    </div>
  );
}
