import { useState } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Menu,
  ArrowLeft,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  BarChart3,
  Target,
  Activity,
  History,
  MessageSquare
} from 'lucide-react';
import Sidebar from './Sidebar';

const predictionHistory = [
  {
    id: 1,
    date: '2026-05-10',
    type: 'Yield Prediction',
    farm: 'Green Valley',
    predicted: '4,500 tons',
    actual: '4,450 tons',
    accuracy: 98.9,
    status: 'correct',
    feedback: 'Excellent prediction'
  },
  {
    id: 2,
    date: '2026-05-08',
    type: 'Disease Detection',
    farm: 'Sunny Acres',
    predicted: 'Leaf Rust',
    actual: 'Confirmed',
    accuracy: 100,
    status: 'correct',
    feedback: 'Early detection saved crop'
  },
  {
    id: 3,
    date: '2026-05-05',
    type: 'Crop Recommendation',
    farm: 'River Bend',
    predicted: 'Rice',
    actual: 'Rice',
    accuracy: 100,
    status: 'correct',
    feedback: 'Good match for soil'
  },
  {
    id: 4,
    date: '2026-04-28',
    type: 'Yield Prediction',
    farm: 'Mountain View',
    predicted: '3,200 tons',
    actual: '2,900 tons',
    accuracy: 90.6,
    status: 'partial',
    feedback: 'Unexpected drought affected yield'
  },
  {
    id: 5,
    date: '2026-04-25',
    type: 'Weather Forecast',
    farm: 'Green Valley',
    predicted: 'Heavy Rain',
    actual: 'Moderate Rain',
    accuracy: 85,
    status: 'partial',
    feedback: 'Rainfall was less than predicted'
  },
  {
    id: 6,
    date: '2026-04-20',
    type: 'Soil Analysis',
    farm: 'Sunny Acres',
    predicted: 'N:45, P:30',
    actual: 'N:42, P:28',
    accuracy: 94,
    status: 'correct',
    feedback: 'Very accurate nutrient analysis'
  }
];

export default function HistoryAndFeedback() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'history' | 'feedback'>('history');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  const filteredPredictions = predictionHistory.filter(pred => {
    const matchesType = filterType === 'all' || pred.type.toLowerCase().includes(filterType);
    const matchesSearch = pred.farm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pred.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="History & Feedback"
        colorScheme="emerald"
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-emerald-100">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search predictions, farms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Bell className="w-6 h-6 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 px-4 py-2 backdrop-blur-lg bg-white/60 rounded-lg border border-emerald-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-800">John Farmer</div>
                    <div className="text-xs text-gray-600">Premium Plan</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
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
                <History className="w-8 h-8 text-emerald-600" />
                Prediction History & Feedback
              </h1>
              <p className="text-gray-600 mt-1">Track AI performance and provide feedback</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-2 border border-emerald-100 inline-flex gap-2">
            <button
              onClick={() => setActiveView('history')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeView === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <History className="w-5 h-5 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveView('feedback')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeView === 'feedback'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Feedback
            </button>
          </div>

          {/* Performance Analytics */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Total Predictions', value: '247', icon: Activity, color: 'from-blue-500 to-indigo-500' },
              { label: 'Accuracy Rate', value: '94.2%', icon: Target, color: 'from-green-500 to-emerald-500' },
              { label: 'Correct', value: '232', icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
              { label: 'Feedback Given', value: '189', icon: MessageSquare, color: 'from-purple-500 to-violet-500' }
            ].map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {activeView === 'history' && (
            <>
              {/* Filters & Export */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Types</option>
                      <option value="yield">Yield Prediction</option>
                      <option value="disease">Disease Detection</option>
                      <option value="crop">Crop Recommendation</option>
                      <option value="weather">Weather Forecast</option>
                      <option value="soil">Soil Analysis</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <input
                      type="date"
                      className="px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>

              {/* Prediction Table */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl border border-emerald-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Farm</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Predicted</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actual</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Accuracy</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {filteredPredictions.map((pred) => (
                        <tr key={pred.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800">{pred.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{pred.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{pred.farm}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{pred.predicted}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{pred.actual}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="font-medium text-emerald-600">{pred.accuracy}%</span>
                          </td>
                          <td className="px-6 py-4">
                            {pred.status === 'correct' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Correct
                              </span>
                            ) : pred.status === 'partial' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Partial
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <XCircle className="w-3 h-3" />
                                Incorrect
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === 'feedback' && (
            <>
              {/* Feedback Cards */}
              <div className="space-y-4">
                {predictionHistory.slice(0, 4).map((pred) => (
                  <div
                    key={pred.id}
                    className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          {pred.status === 'correct' ? (
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">{pred.type}</h3>
                          <p className="text-sm text-gray-600">
                            {pred.farm} • {pred.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rate this prediction:</span>
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                          <ThumbsUp className="w-5 h-5 text-gray-400 hover:text-green-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <ThumbsDown className="w-5 h-5 text-gray-400 hover:text-red-600" />
                        </button>
                        <div className="flex gap-1 ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} className="p-1 hover:scale-110 transition-transform">
                              <Star className="w-4 h-4 text-gray-300 hover:text-yellow-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-emerald-50 rounded-xl">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Predicted</div>
                        <div className="font-medium text-gray-800">{pred.predicted}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Actual Result</div>
                        <div className="font-medium text-gray-800">{pred.actual}</div>
                      </div>
                    </div>

                    {pred.feedback && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-1">Your Feedback</h4>
                            <p className="text-sm text-blue-700">{pred.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!pred.feedback && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add your feedback (optional)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Share your observations about this prediction..."
                          className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                        <button className="mt-3 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">
                          Submit Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Performance */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">AI Performance by Category</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { category: 'Yield Prediction', accuracy: 95, total: 68, correct: 65 },
                    { category: 'Disease Detection', accuracy: 98, total: 52, correct: 51 },
                    { category: 'Crop Recommendation', accuracy: 92, total: 45, correct: 41 },
                    { category: 'Weather Forecast', accuracy: 88, total: 82, correct: 72 }
                  ].map((cat, index) => (
                    <div key={index} className="p-5 bg-white/50 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-800">{cat.category}</h4>
                        <span className="text-2xl font-bold text-emerald-600">{cat.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full"
                          style={{ width: `${cat.accuracy}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{cat.correct} correct</span>
                        <span>{cat.total} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
