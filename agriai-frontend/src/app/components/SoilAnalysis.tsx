import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api, SoilPredictionResponse, FarmResponse } from '../api/client';
import {
  Search,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingDown,
  Target,
  Droplets,
  Flame,
  Beaker,
  Layers,
  Send,
  Download,
  RefreshCw,
  TestTube,
  Lightbulb
} from 'lucide-react';
import { SkeletonCard, SkeletonStatCard } from './ui/skeleton-card';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

const nutrientHistoryData = [
  { date: 'Jan', N: 78, P: 65, K: 72 },
  { date: 'Feb', N: 82, P: 68, K: 75 },
  { date: 'Mar', N: 85, P: 72, K: 78 },
  { date: 'Apr', N: 88, P: 75, K: 82 },
  { date: 'May', N: 86, P: 78, K: 85 },
  { date: 'Jun', N: 90, P: 82, K: 88 }
];

const soilComparisonData = [
  { parameter: 'N', current: 90, optimal: 85, industry: 80 },
  { parameter: 'P', current: 82, optimal: 85, industry: 75 },
  { parameter: 'K', current: 88, optimal: 90, industry: 85 },
  { parameter: 'pH', current: 92, optimal: 95, industry: 88 },
  { parameter: 'OM', current: 78, optimal: 85, industry: 70 }
];

export default function SoilAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [soilData, setSoilData] = useState({
    nitrogen: 90,
    phosphorus: 82,
    potassium: 88,
    pH: 6.8,
    moisture: 65,
    organicCarbon: 2.4
  });

  const [prediction, setPrediction] = useState<SoilPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await api.getFarms();
        setFarms(data);
        if (data.length > 0) setSelectedFarmId(data[0].farm_id);
      } catch (err) {
        console.error("Failed to fetch farms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.predictSoil({
        inline_values: {
          nitrogen: soilData.nitrogen,
          phosphorus: soilData.phosphorus,
          potassium: soilData.potassium,
          ph: soilData.pH,
          moisture: soilData.moisture
        }
      });
      setPrediction(res);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "Failed to analyze soil. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFarmId) {
      setError("Please select a farm to save the data.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      await api.createSoilReport(selectedFarmId, {
        nitrogen_ppm: soilData.nitrogen,
        phosphorus_ppm: soilData.phosphorus,
        potassium_ppm: soilData.potassium,
        ph_level: soilData.pH,
        moisture_percent: soilData.moisture,
        organic_matter_percent: soilData.organicCarbon,
        notes: "Saved from AI Analysis page"
      });
      alert("Soil data saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save soil data.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSync = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      // Simulate sync with sensors
      await new Promise(r => setTimeout(r, 1500));
      alert("Data synced with sensors successfully!");
    } catch (err: any) {
      setError("Sync failed. Check sensor connections.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({
      soilData,
      prediction,
      timestamp: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soil-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFertilityScore = () => {
    const scores = [
      soilData.nitrogen,
      soilData.phosphorus,
      soilData.potassium,
      (soilData.pH / 7) * 100,
      soilData.moisture,
      (soilData.organicCarbon / 3) * 100
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const fertilityScore = getFertilityScore();

  const gaugeData = [
    { name: 'Score', value: fertilityScore, fill: '#10b981' }
  ];

  const getNutrientStatus = (value: number) => {
    if (value >= 80) return { status: 'Excellent', color: 'green', icon: CheckCircle };
    if (value >= 60) return { status: 'Good', color: 'blue', icon: Info };
    if (value >= 40) return { status: 'Low', color: 'yellow', icon: AlertCircle };
    return { status: 'Deficient', color: 'red', icon: TrendingDown };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonStatCard key={index} />
            ))}
          </div>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search analysis..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
          {/* Header Section */}
          <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <TestTube className="w-8 h-8" />
                  Soil Analysis Lab
                </h1>
                <p className="text-emerald-100">AI-powered soil health monitoring and nutrient analysis</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-emerald-100 px-1">Select Farm</label>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                  >
                    {farms.map(f => (
                      <option key={f.farm_id} value={f.farm_id} className="text-gray-800">{f.name}</option>
                    ))}
                    {farms.length === 0 && <option className="text-gray-800">No farms found</option>}
                  </select>
                </div>
                <button 
                  onClick={handleSync}
                  disabled={analyzing}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
                  Auto-Sync
                </button>
                <button 
                  onClick={handleExport}
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Fertility Score Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Fertility Gauge */}
            <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Overall Fertility Score
              </h3>
              <div className="relative">
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={10}
                      fill="#10b981"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {fertilityScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Fertility Index</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold text-emerald-600">
                    {fertilityScore >= 80 ? 'Excellent' : fertilityScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-800">2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'NPK Balance', value: '88%', icon: Layers, color: 'emerald' },
                { label: 'pH Level', value: soilData.pH.toFixed(1), icon: Beaker, color: 'blue' },
                { label: 'Moisture', value: soilData.moisture + '%', icon: Droplets, color: 'cyan' },
                { label: 'Nitrogen', value: soilData.nitrogen + '%', icon: Flame, color: 'green' },
                { label: 'Phosphorus', value: soilData.phosphorus + '%', icon: Activity, color: 'indigo' },
                { label: 'Potassium', value: soilData.potassium + '%', icon: Zap, color: 'violet' }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-emerald-100 hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-${stat.color}-100 mb-3`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Input Section */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Soil Parameters Input
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nitrogen */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Nitrogen (N) %</span>
                  <span className="text-sm text-emerald-600">NPK-N</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.nitrogen}
                    onChange={(e) => setSoilData({ ...soilData, nitrogen: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-lg"
                    step="0.1"
                    max="100"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Flame className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${soilData.nitrogen}%` }}
                    />
                  </div>
                  <span className="text-gray-600">{soilData.nitrogen}%</span>
                </div>
              </div>

              {/* Phosphorus */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Phosphorus (P) %</span>
                  <span className="text-sm text-indigo-600">NPK-P</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.phosphorus}
                    onChange={(e) => setSoilData({ ...soilData, phosphorus: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                    step="0.1"
                    max="100"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${soilData.phosphorus}%` }}
                    />
                  </div>
                  <span className="text-gray-600">{soilData.phosphorus}%</span>
                </div>
              </div>

              {/* Potassium */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Potassium (K) %</span>
                  <span className="text-sm text-violet-600">NPK-K</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.potassium}
                    onChange={(e) => setSoilData({ ...soilData, potassium: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-lg"
                    step="0.1"
                    max="100"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${soilData.potassium}%` }}
                    />
                  </div>
                  <span className="text-gray-600">{soilData.potassium}%</span>
                </div>
              </div>

              {/* pH Level */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">pH Level</span>
                  <span className="text-sm text-blue-600">Acidity</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.pH}
                    onChange={(e) => setSoilData({ ...soilData, pH: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                    step="0.1"
                    max="14"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Beaker className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Acidic</span>
                  <span className="font-medium text-gray-800">{soilData.pH}</span>
                  <span>Alkaline</span>
                </div>
              </div>

              {/* Moisture */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Moisture %</span>
                  <span className="text-sm text-cyan-600">Water Content</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.moisture}
                    onChange={(e) => setSoilData({ ...soilData, moisture: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-lg"
                    step="0.1"
                    max="100"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Droplets className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${soilData.moisture}%` }}
                    />
                  </div>
                  <span className="text-gray-600">{soilData.moisture}%</span>
                </div>
              </div>

              {/* Organic Carbon */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Organic Carbon %</span>
                  <span className="text-sm text-amber-600">OM Content</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={soilData.organicCarbon}
                    onChange={(e) => setSoilData({ ...soilData, organicCarbon: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-lg"
                    step="0.1"
                    max="10"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Layers className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Low</span>
                  <span className="font-medium text-gray-800">{soilData.organicCarbon}%</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Run AI Analysis
                  </>
                )}
              </button>
              <button 
                onClick={handleSave}
                disabled={analyzing || !selectedFarmId}
                className="px-6 py-4 backdrop-blur-lg bg-white/60 border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Save Data
              </button>
            </div>
          </div>

          {/* Nutrient Gauges Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nutrient Status Indicators</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Nitrogen', value: soilData.nitrogen, unit: '%', icon: Flame, gradient: 'from-emerald-500 to-green-500' },
                { name: 'Phosphorus', value: soilData.phosphorus, unit: '%', icon: Activity, gradient: 'from-indigo-500 to-blue-500' },
                { name: 'Potassium', value: soilData.potassium, unit: '%', icon: Zap, gradient: 'from-violet-500 to-purple-500' },
                { name: 'pH Level', value: (soilData.pH / 7) * 100, unit: '', icon: Beaker, gradient: 'from-blue-500 to-cyan-500' },
                { name: 'Moisture', value: soilData.moisture, unit: '%', icon: Droplets, gradient: 'from-cyan-500 to-teal-500' },
                { name: 'Organic Matter', value: (soilData.organicCarbon / 3) * 100, unit: '%', icon: Layers, gradient: 'from-amber-500 to-orange-500' }
              ].map((nutrient, idx) => {
                const status = getNutrientStatus(nutrient.value);
                return (
                  <div
                    key={idx}
                    className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${nutrient.gradient}`}>
                        <nutrient.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-${status.color}-100`}>
                        <status.icon className={`w-4 h-4 text-${status.color}-600`} />
                        <span className={`text-xs font-medium text-${status.color}-700`}>{status.status}</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{nutrient.name}</h4>
                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                      {nutrient.unit ? Math.round(nutrient.value) + nutrient.unit : soilData.pH.toFixed(1)}
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${nutrient.gradient} rounded-full transition-all`}
                        style={{ width: `${nutrient.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Nutrient History */}
            <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">NPK Trend Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutrientHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="N" stroke="#10b981" strokeWidth={3} name="Nitrogen" />
                  <Line type="monotone" dataKey="P" stroke="#3b82f6" strokeWidth={3} name="Phosphorus" />
                  <Line type="monotone" dataKey="K" stroke="#8b5cf6" strokeWidth={3} name="Potassium" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Radar */}
            <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Soil Health Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={soilComparisonData}>
                  <PolarGrid stroke="#d1fae5" />
                  <PolarAngleAxis dataKey="parameter" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar name="Current" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Radar name="Optimal" dataKey="optimal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Industry Avg" dataKey="industry" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              AI-Generated Recommendations
              {prediction && (
                <div className="ml-2 flex gap-2">
                  <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">{prediction.soil_type} ({(prediction.confidence * 100).toFixed(1)}% match)</span>
                  {prediction.cached && <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3"/> Cached</span>}
                </div>
              )}
            </h3>
            {error && (
              <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            <div className="space-y-4">
              {prediction ? (
                prediction.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border-l-4 bg-green-50 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        AI Recommendation
                      </h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-xl border-2 border-dashed border-emerald-200 text-center bg-emerald-50/50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Zap className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Ready for Analysis</h4>
                  <p className="text-gray-500">Run AI Analysis to see personalized recommendations based on your soil data.</p>
                </div>
              )}
            </div>
          </div>
    </div>
  );
}
