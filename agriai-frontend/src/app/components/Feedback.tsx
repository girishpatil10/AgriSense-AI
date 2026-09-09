import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Loader2
} from 'lucide-react';
import { api, PredictionHistoryResponse } from '../api/client';
import { toast } from 'sonner';

export default function Feedback() {
  const [predictions, setPredictions] = useState<PredictionHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      // Fetch recent predictions that don't have feedback yet
      const data = await api.getPredictionHistory({ limit: 20 });
      setPredictions(data.filter(p => !p.feedback_rating));
    } catch (err) {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (predictionId: string, rating: 'correct' | 'partially_correct' | 'incorrect') => {
    try {
      setSubmitting(predictionId);
      await api.submitFeedback({
        prediction_id: predictionId,
        rating,
        comment: feedbackText[predictionId] || ''
      });
      toast.success('Feedback submitted!');
      setPredictions(prev => prev.filter(p => p.prediction_id !== predictionId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Submit Feedback</h1>
      </div>
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold text-gray-800">Improve AgriSense AI</h2>
            <p className="text-gray-600">Your feedback helps us make better predictions for everyone.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-2xl border border-emerald-100">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
              <p className="text-gray-600">You've provided feedback for all recent predictions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div key={pred.prediction_id} className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 capitalize">{pred.prediction_type} Prediction</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(pred.created_at).toLocaleDateString()} at {new Date(pred.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <div className="text-xs text-emerald-600 font-semibold uppercase mb-1">Result Provided</div>
                      <div className="text-gray-800 font-medium">
                        {pred.prediction_type === 'disease' ? pred.result.disease_name : 
                         pred.prediction_type === 'crop' ? pred.result.recommended_crops?.[0]?.crop_name :
                         pred.prediction_type === 'soil' ? pred.result.soil_type :
                         pred.prediction_type === 'yield' ? `${pred.result.predicted_yield_kg_per_hectare} kg/ha` :
                         'View Result Details'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 font-semibold uppercase mb-1">Input Summary</div>
                      <div className="text-gray-800 text-sm truncate">
                        {JSON.stringify(pred.input_data).substring(0, 100)}...
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">How accurate was this prediction?</label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleSubmitFeedback(pred.prediction_id, 'correct')}
                        disabled={!!submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" /> Correct
                      </button>
                      <button
                        onClick={() => handleSubmitFeedback(pred.prediction_id, 'partially_correct')}
                        disabled={!!submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" /> Partially Correct
                      </button>
                      <button
                        onClick={() => handleSubmitFeedback(pred.prediction_id, 'incorrect')}
                        disabled={!!submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" /> Incorrect
                      </button>
                    </div>

                    <div className="mt-4">
                      <textarea
                        value={feedbackText[pred.prediction_id] || ''}
                        onChange={(e) => setFeedbackText({ ...feedbackText, [pred.prediction_id]: e.target.value })}
                        placeholder="Add comments or actual results (optional)..."
                        className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
