import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Sparkles,
  BarChart3,
  Target,
  TrendingUp as TrendIcon,
  Sun,
  Droplets,
  Leaf,
  Activity,
  CheckCircle2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api, FarmResponse, SoilReportResponse, YieldPredictionResponse } from '../api/client';
import { toast } from 'sonner';

const seasonalTrends = [
  { month: 'Jan', wheat: 3200, rice: 0, corn: 0 },
  { month: 'Feb', wheat: 3500, rice: 0, corn: 0 },
  { month: 'Mar', wheat: 3800, rice: 2800, corn: 0 },
  { month: 'Apr', wheat: 4000, rice: 3200, corn: 1800 },
  { month: 'May', wheat: 3800, rice: 3800, corn: 2400 },
  { month: 'Jun', wheat: 0, rice: 4200, corn: 2800 },
  { month: 'Jul', wheat: 0, rice: 4500, corn: 3200 },
  { month: 'Aug', wheat: 0, rice: 4200, corn: 3600 }
];

const yieldComparison = [
  { year: '2022', predicted: 3800, actual: 3650 },
  { year: '2023', predicted: 4200, actual: 4100 },
  { year: '2024', predicted: 4500, actual: 4450 },
  { year: '2025', predicted: 4800, actual: 0 },
  { year: '2026', predicted: 5200, actual: 0 }
];

export default function YieldPrediction() {
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [soilReports, setSoilReports] = useState<SoilReportResponse[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedSeason, setSelectedSeason] = useState('Rabi');
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<YieldPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const data = await api.getFarms();
      setFarms(data);
      if (data.length > 0) setSelectedFarmId(data[0].farm_id);
    } catch (err) {
      toast.error('Failed to fetch farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      fetchReports(selectedFarmId);
    } else {
      setSoilReports([]);
      setSelectedReportId('');
    }
  }, [selectedFarmId]);

  const fetchReports = async (farmId: string) => {
    try {
      const data = await api.getSoilReports(farmId);
      setSoilReports(data);
      if (data.length > 0) setSelectedReportId(data[0].report_id);
      else setSelectedReportId('');
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  const handlePredict = async () => {
    if (!selectedFarmId || !selectedReportId || !selectedCrop || !selectedSeason) {
      toast.error('Please select all fields');
      return;
    }

    try {
      setIsPredicting(true);
      setError(null);
      const res = await api.predictYield({
        farm_id: selectedFarmId,
        crop_name: selectedCrop,
        soil_report_id: selectedReportId,
        season: selectedSeason
      });
      setPrediction(res);
      toast.success('Yield prediction generated!');
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
      toast.error('Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  const currentFarm = farms.find(f => f.farm_id === selectedFarmId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Yield Forecasting</h1>
      </div>
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">AI Yield Prediction</h1>
          </div>

          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm</label>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a Farm</option>
                  {farms.map(f => (
                    <option key={f.farm_id} value={f.farm_id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soil Report</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  disabled={!selectedFarmId || soilReports.length === 0}
                  className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {soilReports.length === 0 ? (
                    <option value="">No reports found</option>
                  ) : (
                    soilReports.map(r => (
                      <option key={r.report_id} value={r.report_id}>
                        {new Date(r.reported_at).toLocaleDateString()} - Report
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handlePredict}
                disabled={isPredicting || !selectedReportId}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isPredicting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Forecast
              </button>
            </div>
            
            {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
          </div>

          {prediction && (
            <>
              <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5" />
                    <span className="text-emerald-100">Total Production</span>
                  </div>
                  <div className="text-5xl font-bold mb-2">
                    {Math.round(prediction.total_predicted_yield_kg).toLocaleString()}
                  </div>
                  <div className="text-emerald-100 mb-4">kg (Predicted Total)</div>
                  <div className="text-sm bg-white/20 p-2 rounded-lg">
                    Based on {currentFarm?.area_hectares || 1} hectares
                  </div>
                </div>

                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Yield Per Hectare</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {Math.round(prediction.predicted_yield_kg_per_hectare).toLocaleString()}
                  </div>
                  <div className="text-gray-600 mb-4">kg/hectare</div>
                  <div className="text-sm text-gray-500">
                    Range: {Math.round(prediction.yield_range.low)} - {Math.round(prediction.yield_range.high)}
                  </div>
                </div>

                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-600">AI Confidence</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {Math.round(prediction.yield_range.confidence_level * 100)}%
                  </div>
                  <div className="text-gray-600 mb-4">High Precision</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: `${prediction.yield_range.confidence_level * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Seasonal Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey={selectedCrop.toLowerCase()} stroke="#10b981" fill="#d1fae5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Historical Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yieldComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predicted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {!prediction && !loading && (
            <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-12 border border-emerald-100 text-center">
              <div className="inline-flex p-6 rounded-full bg-emerald-100 mb-6 text-emerald-600">
                <TrendIcon className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Yield Forecast Ready</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Generate an AI-powered yield prediction based on your farm's unique profile and soil composition.
              </p>
            </div>
          )}
    </div>
  );
}
