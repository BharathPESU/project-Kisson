import React from 'react';
import { View } from '../types';
import { DiagnosisIcon, KisanAI_Icon, MarketIcon, SchemeIcon } from '../constants';

interface DashboardProps {
  onNavigate: (view: View, prompt?: string) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className: string;
}> = ({ icon, title, description, onClick, className }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-2xl text-left text-white flex flex-col justify-between hover:scale-105 transform transition-transform duration-300 ${className}`}
  >
    <div>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="opacity-80">{description}</p>
    </div>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mb-4">
        <KisanAI_Icon className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Kisan Dost</h1>
      <p className="text-lg text-gray-600 mb-10">Your personal farming assistant. How can I help you today?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <FeatureCard
          icon={<DiagnosisIcon />}
          title="Crop Diagnosis"
          description="Upload a photo to identify crop diseases and get remedies."
          onClick={() => onNavigate('diagnose')}
          className="bg-gradient-to-br from-red-500 to-orange-500"
        />
        <FeatureCard
          icon={<MarketIcon />}
          title="Market Prices"
          description="Get the latest mandi prices for your crops."
          onClick={() => onNavigate('chat', 'What are the current tomato prices?')}
          className="bg-gradient-to-br from-blue-500 to-teal-400"
        />
        <FeatureCard
          icon={<SchemeIcon />}
          title="Government Schemes"
          description="Find and understand government subsidies and schemes."
          onClick={() => onNavigate('chat', 'Tell me about subsidies for drip irrigation.')}
          className="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
      </div>
    </div>
  );
};
