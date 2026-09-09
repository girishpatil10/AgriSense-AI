import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  ArrowLeft,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { api, PredictionHistoryResponse } from '../api/client';
import { toast } from 'sonner';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState<PredictionHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getPredictionHistory({ 
        prediction_type: filterType || undefined,
        limit: 50 
      });
      setPredictions(data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = 
      pred.prediction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(pred.result).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (rating: string | null) => {
    if (!rating) return <span className="text-gray-400 italic text-xs">No feedback</span>;
    
    switch (rating) {
      case 'correct':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Correct
          </span>
        );
      case 'partially_correct':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" /> Partial
          </span>
        );
      case 'incorrect':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Incorrect
          </span>
        );
      default:
        return rating;
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
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
          <div className="flex items-center justify-between">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <History className="w-8 h-8 text-emerald-600" /> Prediction History
              </h1>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                <option value="soil">Soil Analysis</option>
                <option value="crop">Crop Recommendation</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="disease">Disease Detection</option>
                <option value="yield">Yield Prediction</option>
              </select>
            </div>
            <button className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
          ) : (
            <div className="backdrop-blur-lg bg-white/60 rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Prediction</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Confidence</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {filteredPredictions.map((pred) => (
                      <tr key={pred.prediction_id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {new Date(pred.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800 capitalize">
                          {pred.prediction_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {pred.prediction_type === 'disease' ? pred.result.disease_name : 
                           pred.prediction_type === 'crop' ? pred.result.recommended_crops?.[0]?.crop_name :
                           pred.prediction_type === 'soil' ? pred.result.soil_type :
                           pred.prediction_type === 'yield' ? `${pred.result.predicted_yield_kg_per_hectare} kg/ha` :
                           'View Details'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold text-emerald-600">
                            {pred.result.confidence ? `${(pred.result.confidence * 100).toFixed(1)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(pred.feedback_rating)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-1">
                            Details <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
    </div>
  );
}
