import { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  MapPin,
  Droplets,
  Thermometer,
  Wind,
  Calendar,
  Zap,
  CheckCircle,
  AlertCircle,
  Sprout,
  CloudRain,
  Wheat,
  TestTube,
  Lightbulb,
  TrendingUp,
  Bug,
  Activity,
  Target
} from 'lucide-react';
import { Link } from 'react-router';
import { SkeletonCard, SkeletonStatCard } from './ui/skeleton-card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api, FarmResponse, WeatherResponse, DashboardSummary, PredictionHistoryResponse } from '../api/client';
import { toast } from 'sonner';

const yieldData = [
  { month: 'Jan', yield: 65 },
  { month: 'Feb', yield: 72 },
  { month: 'Mar', yield: 78 },
  { month: 'Apr', yield: 85 },
  { month: 'May', yield: 92 },
  { month: 'Jun', yield: 88 }
];

const cropData = [
  { name: 'Wheat', value: 35, color: '#f59e0b' },
  { name: 'Corn', value: 25, color: '#10b981' },
  { name: 'Rice', value: 22, color: '#3b82f6' },
  { name: 'Soybean', value: 18, color: '#8b5cf6' }
];

export default function Dashboard() {
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [farmsData, summaryData, historyData, userData] = await Promise.all([
        api.getFarms(),
        api.getDashboardSummary(),
        api.getPredictionHistory({ limit: 5 }),
        api.me()
      ]);
      
      setFarms(farmsData);
      setSummary(summaryData);
      setRecentPredictions(historyData);
      setUser(userData);
      
      if (farmsData.length > 0) {
        fetchWeather(farmsData[0].farm_id);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (farmId: string) => {
    setWeatherLoading(true);
    try {
      const weatherData = await api.getWeather({ farm_id: farmId });
      setWeather(weatherData);
    } catch (err) {
      console.error('Failed to load weather', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonStatCard key={index} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <div className="lg:col-span-2 grid gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search farms, crops, insights..."
                className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-lg border border-emerald-100">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-800">{user?.full_name || 'Farmer'}</div>
              <div className="text-xs text-emerald-600 font-medium">Verified User</div>
            </div>
          </div>
        </div>
      </div>
          <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sprout className="w-32 h-32 rotate-12" />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div>
                <h1 className="text-3xl font-bold mb-2 capitalize">Welcome back, {user?.full_name.split(' ')[0]}! 👋</h1>
                <p className="text-emerald-100">Manage your {summary?.total_farms || 0} farms and monitor AI insights.</p>
              </div>
              <Link to="/soil-analysis" className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-bold">
                <Zap className="w-5 h-5" /> Quick Scan
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Farms',
                value: summary?.total_farms.toString() || '0',
                change: `${summary?.total_area_hectares.toFixed(1)} Total Hectares`,
                icon: Wheat,
                gradient: 'from-emerald-500 to-green-500',
              },
              {
                title: 'AI Accuracy',
                value: `${summary?.weighted_accuracy_pct || 0}%`,
                change: `Based on ${summary?.total_feedback || 0} feedback`,
                icon: Target,
                gradient: 'from-teal-500 to-cyan-500',
              },
              {
                title: 'Predictions',
                value: summary?.predictions_this_month.toString() || '0',
                change: 'This month',
                icon: TrendingUp,
                gradient: 'from-blue-500 to-indigo-500',
              },
              {
                title: 'Correct Hits',
                value: summary?.correct_count.toString() || '0',
                change: 'High confidence predictions',
                icon: CheckCircle,
                gradient: 'from-amber-500 to-orange-500',
              }
            ].map((card, index) => (
              <div key={index} className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all group shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                  <h3 className="text-3xl font-bold text-gray-800">{card.value}</h3>
                  <p className="text-xs text-gray-500">{card.change}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Local Weather</h3>
                <Link to="/weather" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1">
                  Details <CloudRain className="w-4 h-4" />
                </Link>
              </div>

              {weatherLoading ? (
                <SkeletonCard className="border-0 bg-transparent p-0" />
              ) : weather ? (
                <div className="space-y-6 flex-1">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 mb-4 shadow-lg shadow-blue-200/50">
                      <CloudRain className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-gray-800 mb-1">{Math.round(weather.current_temp || 0)}°C</div>
                    <div className="text-gray-600 font-medium capitalize">{weather.summary}</div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-2">
                      <MapPin className="w-3 h-3" /> {weather.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-100">
                    <div className="text-center">
                      <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-gray-800">{weather.forecast[0].precipitation}mm</div>
                      <div className="text-xs text-gray-500">Rain</div>
                    </div>
                    <div className="text-center">
                      <Wind className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-gray-800">Windy</div>
                      <div className="text-xs text-gray-500">Condition</div>
                    </div>
                    <div className="text-center">
                      <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-gray-800">{Math.round(weather.forecast[0].temp_max)}°</div>
                      <div className="text-xs text-gray-500">Max</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                  <CloudRain className="w-10 h-10" />
                  <p className="text-sm text-center">No weather data.<br/>Please add a farm.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Predictions</h3>
                <Link to="/history" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">View All</Link>
              </div>
              <div className="space-y-4">
                {recentPredictions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 italic">No predictions yet. Get started by running a scan!</div>
                ) : recentPredictions.map((pred) => (
                  <div key={pred.prediction_id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-emerald-100 hover:bg-white hover:shadow-md transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                        {pred.prediction_type === 'disease' ? <Bug /> : <Wheat />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 capitalize">{pred.prediction_type} Prediction</h4>
                        <p className="text-sm text-gray-600">{new Date(pred.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        {pred.prediction_type === 'disease' ? pred.result.disease_name : 
                         pred.prediction_type === 'crop' ? pred.result.recommended_crops?.[0]?.crop_name :
                         pred.prediction_type === 'soil' ? pred.result.soil_type :
                         'Completed'}
                      </div>
                      <div className="text-xs text-emerald-600 font-bold uppercase">
                        {pred.feedback_rating || 'Pending Feedback'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: TestTube, label: 'Soil Test', gradient: 'from-amber-500 to-orange-500', path: '/soil-analysis' },
                { icon: Bug, label: 'Scan Disease', gradient: 'from-red-500 to-pink-500', path: '/disease-detection' },
                { icon: Lightbulb, label: 'Get Advice', gradient: 'from-emerald-500 to-green-500', path: '/crop-recommendation' },
                { icon: TrendingUp, label: 'Predict Yield', gradient: 'from-blue-500 to-indigo-500', path: '/yield-prediction' },
                { icon: CloudRain, label: 'Weather', gradient: 'from-cyan-500 to-teal-500', path: '/weather' },
                { icon: Wheat, label: 'Add Farm', gradient: 'from-violet-500 to-purple-500', path: '/farms' }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/50 border border-emerald-100 hover:bg-white hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} group-hover:rotate-12 transition-transform shadow-md`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
    </div>
  );
}
