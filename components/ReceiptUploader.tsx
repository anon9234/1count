
import React, { useRef, useState } from 'react';
import { Button, UploadIcon, SparklesIcon, LoadingSpinner, Card } from './UIComponents';
import { analyzeReceipt } from '../services/geminiService';
import { ParsedReceipt } from '../types';

interface ReceiptUploaderProps {
  image: string | null;
  onImageUpload: (base64: string | null) => void;
  onReceiptParsed: (data: ParsedReceipt) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ 
  image, 
  onImageUpload, 
  onReceiptParsed 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit size roughly to 5MB to avoid issues
    if (file.size > 5 * 1024 * 1024) {
        setError("Image is too large. Please upload an image smaller than 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageUpload(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeReceipt(image);
      onReceiptParsed(result);
    } catch (err) {
      setError("Failed to analyze receipt. Please try again or enter items manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-slate-800 transition-all group"
          >
            <div className="p-4 bg-slate-800 rounded-full text-slate-500 group-hover:text-accent group-hover:bg-slate-700 transition-colors mb-3">
              <UploadIcon />
            </div>
            <p className="text-slate-400 font-medium">Tap to upload receipt</p>
            <p className="text-slate-600 text-xs mt-1">Supports JPEG, PNG</p>
          </div>
        ) : (
          <div className="w-full space-y-4">
             <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-950 group">
                <img 
                  src={image} 
                  alt="Receipt Preview" 
                  className="w-full h-full object-contain opacity-90"
                />
                <button 
                  onClick={() => {
                      onImageUpload(null);
                      setError(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
             </div>

             <Button 
               onClick={handleAnalyze} 
               disabled={isAnalyzing} 
               className="w-full"
               icon={isAnalyzing ? <LoadingSpinner /> : <SparklesIcon />}
             >
               {isAnalyzing ? 'Analyzing Receipt...' : 'Scan with Gemini'}
             </Button>
          </div>
        )}

        {error && (
          <div className="w-full p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};
