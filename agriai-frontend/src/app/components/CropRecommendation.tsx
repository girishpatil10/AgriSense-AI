import { useState } from 'react';
import { Link } from 'react-router';
import {
  Search,
  ArrowLeft,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  BarChart3,
  Cloud,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Sprout,
  Wheat,
  TestTube,
  Lightbulb
} from 'lucide-react';
import { api, FarmResponse, SoilReportResponse, CropRecommendationResponse } from '../api/client';
import { useEffect } from 'react';

const recommendedCrops = [
  {
    name: 'Rice',
    suitability: 95,
    expectedYield: '4.2 tons/acre',
    seasonMatch: 'Excellent',
    waterReq: 'High',
    profitMargin: 'High',
    growthPeriod: '120-150 days',
    weatherCompatibility: 95,
    soilMatch: 92,
    marketDemand: 88,
    rotationScore: 90,
    image: '🌾',
    bgGradient: 'from-amber-500 to-orange-500',
    pros: ['High market demand', 'Excellent soil match', 'Good rotation crop'],
    cons: ['High water requirement', 'Labor intensive']
  },
  {
    name: 'Wheat',
    suitability: 88,
    expectedYield: '3.8 tons/acre',
    seasonMatch: 'Good',
    waterReq: 'Moderate',
    profitMargin: 'Moderate',
    growthPeriod: '110-130 days',
    weatherCompatibility: 90,
    soilMatch: 88,
    marketDemand: 85,
    rotationScore: 87,
    image: '🌾',
    bgGradient: 'from-yellow-500 to-amber-500',
    pros: ['Lower water needs', 'Stable market price', 'Good for rotation'],
    cons: ['Moderate profit margin', 'Pest susceptible']
  },
  {
    name: 'Sugarcane',
    suitability: 82,
    expectedYield: '45 tons/acre',
    seasonMatch: 'Good',
    waterReq: 'High',
    profitMargin: 'Very High',
    growthPeriod: '12-18 months',
    weatherCompatibility: 85,
    soilMatch: 80,
    marketDemand: 90,
    rotationScore: 75,
    image: '🎋',
    bgGradient: 'from-green-500 to-emerald-500',
    pros: ['Very high profit', 'Long shelf life', 'Strong market'],
    cons: ['Long growth period', 'High water needs', 'Soil depletion']
  },
  {
    name: 'Cotton',
    suitability: 78,
    expectedYield: '2.5 tons/acre',
    seasonMatch: 'Moderate',
    waterReq: 'Moderate',
    profitMargin: 'High',
    growthPeriod: '150-180 days',
    weatherCompatibility: 75,
    soilMatch: 82,
    marketDemand: 80,
    rotationScore: 70,
    image: '🌼',
    bgGradient: 'from-blue-500 to-indigo-500',
    pros: ['Good profit margin', 'Export potential', 'Moderate water'],
    cons: ['Weather sensitive', 'Requires pesticides', 'Market fluctuation']
  }
];

export default function CropRecommendation() {
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [reports, setReports] = useState<SoilReportResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    farmId: '',
    reportId: '',
    season: '',
    previousCrop: ''
  });
  const [results, setResults] = useState<CropRecommendationResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await api.getFarms();
        setFarms(data);
      } catch (err) {
        console.error("Failed to fetch farms", err);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (formData.farmId) {
        try {
          const data = await api.getSoilReports(formData.farmId);
          setReports(data);
        } catch (err) {
          console.error("Failed to fetch reports", err);
        }
      } else {
        setReports([]);
      }
    };
    fetchReports();
  }, [formData.farmId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.predictCrop({
        farm_id: formData.farmId,
        soil_report_id: formData.reportId,
        season: formData.season,
        previous_crop: formData.previousCrop
      });
      setResults(data);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search farms, crops, insights..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-emerald-600" />
                AI Crop Recommendation
              </h1>
              <p className="text-gray-600 mt-1">Get smart crop suggestions based on soil and environmental data</p>
            </div>
          </div>

          {/* Input Form */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-2 mb-6">
              <TestTube className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Enter Farm Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Farm and Report Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Farm</label>
                  <select
                    value={formData.farmId}
                    onChange={(e) => setFormData({ ...formData, farmId: e.target.value, reportId: '' })}
                    className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Farm</option>
                    {farms.map(f => (
                      <option key={f.farm_id} value={f.farm_id}>{f.name} ({f.region || 'No region'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Soil Report</label>
                  <select
                    value={formData.reportId}
                    onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={!formData.farmId}
                  >
                    <option value="">Select Soil Report</option>
                    {reports.map(r => (
                      <option key={r.report_id} value={r.report_id}>
                        Report from {new Date(r.reported_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Other Details */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Context</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Season</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Season</option>
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                      <option value="Zaid">Zaid (Summer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Previous Crop</label>
                    <input
                      type="text"
                      value={formData.previousCrop}
                      onChange={(e) => setFormData({ ...formData, previousCrop: e.target.value })}
                      placeholder="e.g., Wheat"
                      className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {loading ? 'Analyzing...' : 'Get AI Recommendations'}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {showResults && (
            <>
              {/* Analytics Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Best Match', 
                    value: results.recommended_crops[0]?.crop_name || 'N/A', 
                    icon: Sprout, 
                    color: 'from-green-500 to-emerald-500' 
                  },
                  { 
                    label: 'Avg Suitability', 
                    value: results.recommended_crops.length > 0 
                      ? `${(results.recommended_crops.reduce((acc, curr) => acc + curr.suitability_score, 0) / results.recommended_crops.length * 100).toFixed(0)}%`
                      : '0%', 
                    icon: BarChart3, 
                    color: 'from-blue-500 to-indigo-500' 
                  },
                  { 
                    label: 'Season', 
                    value: formData.season || 'N/A', 
                    icon: Calendar, 
                    color: 'from-purple-500 to-violet-500' 
                  },
                  { 
                    label: 'Region', 
                    value: farms.find(f => f.farm_id === formData.farmId)?.region || 'N/A', 
                    icon: MapPin, 
                    color: 'from-orange-500 to-amber-500' 
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recommended Crops */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-800">Recommended Crops (Ranked)</h2>
                  </div>
                  <button 
                    onClick={(e) => handleSubmit(e as any)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {results?.recommended_crops.map((crop, index) => (
                    <div
                      key={index}
                      className="backdrop-blur-lg bg-white/70 rounded-2xl border-2 border-emerald-100 overflow-hidden hover:shadow-xl transition-all"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-5xl">🌾</div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-bold">{crop.crop_name}</h3>
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-lg rounded-lg text-xs">
                                  #{index + 1}
                                </span>
                              </div>
                              <p className="text-white/90">Suitability Score: {(crop.suitability_score * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-gray-800">Reasoning</span>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{crop.reason}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation Advice */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-2 mb-6">
                  <RefreshCw className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-800">Crop Rotation Advice</h2>
                </div>

                <div className="p-6 bg-white/80 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    <span className="font-bold text-gray-800">AI Advice</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {results?.rotation_advice}
                  </p>
                  <div className="mt-4 text-xs font-mono text-gray-500">
                    Inference Mode: {results?.inference_mode} | Prediction ID: {results?.prediction_id}
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Rotation Best Practices</h4>
                      <p className="text-sm text-blue-700">
                        Rotate crops with different root depths and nutrient requirements. Include legumes every 2-3 cycles to restore nitrogen.
                        Avoid planting the same crop family consecutively to prevent soil depletion and pest buildup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
    </div>
  );
}
