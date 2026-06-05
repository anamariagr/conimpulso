import { Link } from 'react-router-dom';
import { Book, Code, ExternalLink, Zap, Shield, Users, ShoppingBag, MessageSquare, Wallet, BarChart3 } from 'lucide-react';

const modules = [
  { name: 'Authentication', icon: Shield, endpoints: 12, color: 'text-blue-500' },
  { name: 'Products', icon: ShoppingBag, endpoints: 8, color: 'text-green-500' },
  { name: 'Shops', icon: Users, endpoints: 6, color: 'text-purple-500' },
  { name: 'B2B', icon: Zap, endpoints: 15, color: 'text-yellow-500' },
  { name: 'Leads', icon: BarChart3, endpoints: 7, color: 'text-orange-500' },
  { name: 'Messages', icon: MessageSquare, endpoints: 9, color: 'text-cyan-500' },
  { name: 'Wallet', icon: Wallet, endpoints: 8, color: 'text-emerald-500' },
  { name: 'AI', icon: Code, endpoints: 6, color: 'text-pink-500' },
];

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Book className="w-8 h-8 text-[#FFD700]" />
          <h1 className="text-3xl font-bold text-[#FFD700]">API Documentation</h1>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Base URL</h2>
          <div className="bg-[#0A0A0A] rounded-lg p-4 font-mono text-sm">
            <span className="text-gray-500"># Development</span>
            <p className="text-green-400">http://localhost/api</p>
            <span className="text-gray-500 mt-2 block"># Production</span>
            <p className="text-green-400">https://api.nexuslab.com</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>
          <p className="text-gray-400 mb-4">
            All protected endpoints require a Bearer token. Get your token from <code className="bg-[#0A0A0A] px-2 py-1 rounded">/api/auth/login</code>.
          </p>
          <div className="bg-[#0A0A0A] rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-500"># Headers</p>
            <p className="text-white">Authorization: Bearer &lt;your_token&gt;</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-6">API Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {modules.map((module) => (
            <div key={module.name} className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-[#FFD700] transition cursor-pointer">
              <module.icon className={`w-8 h-8 ${module.color} mb-3`} />
              <h3 className="text-white font-semibold">{module.name}</h3>
              <p className="text-gray-500 text-sm">{module.endpoints} endpoints</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">OpenAPI Specification</h2>
          <p className="text-gray-400 mb-4">
            Full API documentation in OpenAPI 3.0 format available for download.
          </p>
          <a
            href="/docs/openapi.json"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-yellow-400 transition"
          >
            <Book className="w-5 h-5" />
            Download openapi.json
          </a>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Rate Limiting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#FFD700]">60</p>
              <p className="text-gray-500 text-sm">requests/minute</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-500">1000</p>
              <p className="text-gray-500 text-sm">requests/hour</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">10000</p>
              <p className="text-gray-500 text-sm">requests/day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}