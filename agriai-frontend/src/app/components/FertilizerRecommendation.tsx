import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api, SoilReportResponse, FarmResponse } from '../api/client';
import {
  Zap,
  Calendar,
  Package,
  Droplets,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingDown,
  Beaker,
  FileText,
  Download,
  Send,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const npkRatioData = [
  { name: 'Nitrogen', value: 40, color: '#10b981' },
  { name: 'Phosphorus', value: 30, color: '#3b82f6' },
  { name: 'Potassium', value: 30, color: '#8b5cf6' }
];

const costAnalysisData = [
  { fertilizer: 'Urea', cost: 450, percentage: 35 },
  { fertilizer: 'DAP', cost: 380, percentage: 30 },
  { fertilizer: 'Potash', cost: 320, percentage: 25 },
  { fertilizer: 'Micronutrients', cost: 130, percentage: 10 }
];

const crops = [
  'Wheat', 'Corn', 'Rice', 'Soybean', 'Cotton', 'Barley',
  'Sugarcane', 'Potato', 'Tomato', 'Vegetables'
];

export default function FertilizerRecommendation() {
  const [generating, setGenerating] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  
  const [realSoilReports, setRealSoilReports] = useState<(SoilReportResponse & { farm_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const farms = await api.getFarms();
        let allReports: (SoilReportResponse & { farm_name: string })[] = [];
        for (const farm of farms) {
          const reports = await api.getSoilReports(farm.farm_id);
          allReports = allReports.concat(reports.map(r => ({ ...r, farm_name: farm.name })));
        }
        setRealSoilReports(allReports);
      } catch (err) {
        console.error("Failed to load reports", err);
      }
    }
    loadReports();
  }, []);

  const [formData, setFormData] = useState({
    soilReport: '',
    crop: '',
    area: '',
    growthStage: 'vegetative'
  });

  const handleGenerateRecommendation = async () => {
    try {
      setError(null);
      setGenerating(true);
      const res = await api.predictFertilizer({
        soil_report_id: formData.soilReport,
        crop_name: formData.crop,
        area_hectares: Number(formData.area),
      });
      setPrediction(res);
      setShowRecommendations(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate recommendation");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
          {/* Header Section */}
          <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-8 h-8" />
                  Smart Fertilizer Recommendation
                </h1>
                <p className="text-emerald-100">AI-powered fertilizer planning for optimal crop nutrition</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition-all flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  History
                </button>
                <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Plan
                </button>
              </div>
            </div>
          </div>

          {/* Input Form Section */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-emerald-600" />
              Farm & Crop Details
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Soil Report Selector */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Select Soil Report</label>
                <select
                  value={formData.soilReport}
                  onChange={(e) => setFormData({ ...formData, soilReport: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose a report...</option>
                  {realSoilReports.map((report) => (
                    <option key={report.report_id} value={report.report_id}>
                      {report.farm_name} - {new Date(report.reported_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {formData.soilReport && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Report loaded successfully</span>
                  </div>
                )}
              </div>

              {/* Crop Selector */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Crop Type</label>
                <select
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select crop...</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Input */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Area (hectares)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-white/70 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  step="0.1"
                  min="0"
                />
              </div>

              {/* Growth Stage */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Growth Stage</label>
                <select
                  value={formData.growthStage}
                  onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting/Maturity</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGenerateRecommendation}
                disabled={!formData.soilReport || !formData.crop || !formData.area || generating}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Generating AI Recommendations...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Smart Recommendation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recommendations Section */}
          {showRecommendations && (
            <div className="space-y-6">
              {/* AI Summary Card */}
              <div className="backdrop-blur-lg bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">AI Analysis Complete</h3>
                    <p className="text-blue-100 mb-4">
                      Based on your soil analysis for {formData.crop} cultivation on {formData.area} hectares,
                      our AI has generated a customized fertilizer plan optimized for maximum yield and soil health.
                      {prediction?.cached && (
                        <span className="block mt-2 text-blue-200 text-sm">
                          (Served from cache)
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="backdrop-blur-lg bg-white/10 rounded-xl p-3">
                        <div className="text-2xl font-bold">{prediction?.fertilizer_type || 'Custom'}</div>
                        <div className="text-xs text-blue-100">Recommended Type</div>
                      </div>
                      <div className="backdrop-blur-lg bg-white/10 rounded-xl p-3">
                        <div className="text-2xl font-bold">{prediction?.total_dosage_kg || 0} kg</div>
                        <div className="text-xs text-blue-100">Total Dosage</div>
                      </div>
                      <div className="backdrop-blur-lg bg-white/10 rounded-xl p-3">
                        <div className="text-2xl font-bold">{prediction?.dosage_kg_per_hectare || 0} kg/ha</div>
                        <div className="text-xs text-blue-100">Dosage per Hectare</div>
                      </div>
                      <div className="backdrop-blur-lg bg-white/10 rounded-xl p-3">
                        <div className="text-2xl font-bold">{((prediction?.confidence || 0) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-blue-100">AI Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fertilizer Recommendations Grid */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Recommended Fertilizer Application</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: prediction?.fertilizer_type || 'Fertilizer',
                      type: 'Primary Source',
                      dosage: `${prediction?.dosage_kg_per_hectare} kg/ha`,
                      method: prediction?.application_method,
                      timing: 'As per crop stage',
                      icon: Package,
                      gradient: 'from-emerald-500 to-green-500'
                    }
                  ].map((fertilizer, idx) => (
                    <div
                      key={idx}
                      className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all"
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${fertilizer.gradient} mb-4`}>
                        <fertilizer.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{fertilizer.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{fertilizer.type}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                          <span className="text-sm text-gray-600">Dosage</span>
                          <span className="font-bold text-gray-800">{fertilizer.dosage}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                          <span className="text-sm text-gray-600">Method</span>
                          <span className="text-sm text-gray-800">{fertilizer.method}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">Timing</span>
                          <span className="text-sm font-medium text-emerald-600">{fertilizer.timing}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* NPK Ratio */}
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">NPK Ratio Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={npkRatioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {npkRatioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #d1fae5',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Application Schedule */}
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Application Schedule</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationScheduleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #d1fae5',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="dosage" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Application Methods */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Application Methods & Best Practices
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      method: 'Broadcast Application',
                      description: 'Spread fertilizer evenly across the field surface',
                      icon: Target,
                      steps: ['Calibrate spreader', 'Apply uniformly', 'Incorporate within 24 hours']
                    },
                    {
                      method: 'Drill Application',
                      description: 'Place fertilizer in bands below the soil surface',
                      icon: TrendingDown,
                      steps: ['Adjust drill depth 5-8cm', 'Space rows evenly', 'Cover immediately']
                    },
                    {
                      method: 'Fertigation',
                      description: 'Apply through irrigation system',
                      icon: Droplets,
                      steps: ['Dissolve completely', 'Monitor EC levels', 'Flush system after']
                    }
                  ].map((method, idx) => (
                    <div key={idx} className="backdrop-blur-lg bg-white/50 rounded-xl p-5 border border-emerald-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <method.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">{method.method}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                      <div className="space-y-2">
                        {method.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-center gap-2 text-xs text-gray-700">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Cost Analysis & Budget
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costAnalysisData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="fertilizer" type="category" stroke="#6b7280" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #d1fae5',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="cost" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="backdrop-blur-lg bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="text-xs text-emerald-600 mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-emerald-700">$1,280</div>
                  </div>
                  <div className="backdrop-blur-lg bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">Cost per Hectare</div>
                    <div className="text-2xl font-bold text-blue-700">$256</div>
                  </div>
                  <div className="backdrop-blur-lg bg-violet-50 rounded-xl p-4 border border-violet-200">
                    <div className="text-xs text-violet-600 mb-1">Expected ROI</div>
                    <div className="text-2xl font-bold text-violet-700">340%</div>
                  </div>
                  <div className="backdrop-blur-lg bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="text-xs text-amber-600 mb-1">Savings</div>
                    <div className="text-2xl font-bold text-amber-700">$420</div>
                  </div>
                </div>
              </div>

              {/* AI Notes & Recommendations */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  AI Notes & Expert Recommendations
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      type: 'success',
                      title: 'Prediction Result',
                      note: prediction?.additional_notes || 'Follow standard practices for the recommended fertilizer.',
                      priority: 'High'
                    }
                  ].map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-l-4 ${
                        rec.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : rec.type === 'warning'
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          {rec.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                          {rec.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                          {rec.title}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'High'
                              ? 'bg-red-100 text-red-700'
                              : rec.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{rec.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Save Fertilizer Plan
                </button>
                <button className="flex-1 min-w-[200px] px-6 py-4 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF Report
                </button>
                <button className="flex-1 min-w-[200px] px-6 py-4 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Application
                </button>
              </div>
            </div>
          )}
    </div>
  );
}
