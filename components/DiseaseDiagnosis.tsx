import React, { useState } from 'react';
import { diagnoseCropDisease } from '../services/geminiService';
import { DiagnosisResult } from '../types';
import { SpinnerIcon } from '../constants';

const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);
  return (
    <div className="prose prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const codeBlock = part.replace(/```[a-z]*\n/, '').replace(/```/, '');
          return (
            <pre key={index} className="bg-gray-200 p-3 rounded-md my-2 overflow-x-auto text-sm">
              <code>{codeBlock.trim()}</code>
            </pre>
          );
        }
        return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
};

export const DiseaseDiagnosis: React.FC = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setResult(null);
            setError(null);
        }
    };

    const handleDiagnose = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await diagnoseCropDisease(imageFile);
            const jsonStr = response.text.trim();
            const parsedResult: DiagnosisResult = JSON.parse(jsonStr);
            setResult(parsedResult);
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to analyze image. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Crop Disease Diagnosis</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 h-full">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Crop preview" className="max-h-64 rounded-lg object-contain" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" /></svg>
                                <p className="mt-2">Image preview will appear here</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-4">
                        <p className="text-gray-600">Upload a clear photo of the affected plant part (e.g., leaf, stem) for an AI-powered diagnosis.</p>
                        <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} className="hidden"/>
                        <label htmlFor="file-upload" className="w-full text-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors">
                            Upload Photo
                        </label>
                        <button 
                            onClick={handleDiagnose} 
                            disabled={!imageFile || isLoading} 
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center">
                            {isLoading ? <><SpinnerIcon /> <span className="ml-2">Analyzing...</span></> : 'Diagnose Plant'}
                        </button>
                    </div>
                </div>

                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                
                {result && (
                    <div className="mt-6 p-5 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="text-xl font-bold text-green-800 mb-2">{result.disease}</h3>
                        <p className="text-gray-700 mb-4">{result.description}</p>
                        <h4 className="font-semibold text-gray-800 mb-2">Suggested Remedies:</h4>
                        <div className="text-gray-600 space-y-2">
                            <ChatMessageContent content={result.remedy} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
