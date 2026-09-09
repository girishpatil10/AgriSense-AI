import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, MapPin, Calendar,
  Droplets, ThermometerSun, Activity, ArrowUp, MoreVertical,
  CheckCircle, Sprout, Wheat, TestTube, Trash2, X, Loader2
} from 'lucide-react';
import { SkeletonCard, SkeletonStatCard } from './ui/skeleton-card';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  api,
  type FarmResponse,
  type FarmCreate,
  type SoilReportResponse,
  type SoilReportCreate,
} from '../api/client';

const seasonalData = [
  { season: 'Spring', yield: 75, quality: 85, efficiency: 78 },
  { season: 'Summer', yield: 92, quality: 88, efficiency: 85 },
  { season: 'Fall', yield: 88, quality: 90, efficiency: 87 },
  { season: 'Winter', yield: 65, quality: 82, efficiency: 72 },
];

const productionData = [
  { month: 'Jan', production: 45 }, { month: 'Feb', production: 52 },
  { month: 'Mar', production: 68 }, { month: 'Apr', production: 78 },
  { month: 'May', production: 85 }, { month: 'Jun', production: 92 },
];

// ── Add Farm Modal ────────────────────────────────────────────────────────────

function AddFarmModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (farm: FarmResponse) => void;
}) {
  const [form, setForm] = useState<FarmCreate>({
    name: '', area_hectares: 0, region: '', current_crop: '',
    latitude: undefined, longitude: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: FarmCreate = {
        name: form.name,
        area_hectares: Number(form.area_hectares),
        ...(form.region ? { region: form.region } : {}),
        ...(form.current_crop ? { current_crop: form.current_crop } : {}),
        ...(form.latitude != null ? { latitude: Number(form.latitude) } : {}),
        ...(form.longitude != null ? { longitude: Number(form.longitude) } : {}),
      };
      const farm = await api.createFarm(payload);
      onCreated(farm);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-lg bg-white/90 rounded-3xl p-8 max-w-2xl w-full border border-emerald-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Farm</h2>
          <button onClick={onClose} className="p-2 hover:bg-emerald-50 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Farm Name *</label>
              <input required type="text" placeholder="Enter farm name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Area (hectares) *</label>
              <input required type="number" step="0.01" min="0.01" max="10000" placeholder="0.0"
                value={form.area_hectares || ''} onChange={e => setForm(f => ({ ...f, area_hectares: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Region</label>
            <input type="text" placeholder="e.g. Northern Province"
              value={form.region ?? ''} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
              className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Latitude</label>
              <input type="number" step="any" placeholder="-90 to 90"
                value={form.latitude ?? ''} onChange={e => setForm(f => ({ ...f, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Longitude</label>
              <input type="number" step="any" placeholder="-180 to 180"
                value={form.longitude ?? ''} onChange={e => setForm(f => ({ ...f, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Current Crop</label>
            <select value={form.current_crop ?? ''} onChange={e => setForm(f => ({ ...f, current_crop: e.target.value }))}
              className="w-full px-4 py-3 bg-white/70 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Select crop type</option>
              {['Wheat', 'Corn', 'Rice', 'Soybean', 'Barley'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-emerald-200 text-gray-700 rounded-xl hover:bg-emerald-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Farm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Soil Report Form ──────────────────────────────────────────────────────────

function SoilReportForm({
  farmId,
  onCreated,
}: {
  farmId: string;
  onCreated: (r: SoilReportResponse) => void;
}) {
  const [form, setForm] = useState<SoilReportCreate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const report = await api.createSoilReport(farmId, form);
      onCreated(report);
      setForm({});
    } catch (err: any) {
      setError(err.message ?? 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof SoilReportCreate, placeholder: string) => (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" step="any" placeholder={placeholder}
        value={(form[key] as number | undefined) ?? ''}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value ? parseFloat(e.target.value) : undefined }))}
        className="w-full px-3 py-2 bg-white/70 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {field('pH Level (0-14)', 'ph_level', '6.5')}
        {field('Moisture %', 'moisture_percent', '65')}
        {field('Nitrogen (ppm)', 'nitrogen_ppm', '40')}
        {field('Phosphorus (ppm)', 'phosphorus_ppm', '20')}
        {field('Potassium (ppm)', 'potassium_ppm', '150')}
        {field('Organic Matter %', 'organic_matter_percent', '3.5')}
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Notes</label>
        <textarea rows={2} placeholder="Optional notes..."
          value={form.notes ?? ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
          className="w-full px-3 py-2 bg-white/70 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <button type="submit" disabled={loading}
        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm hover:shadow-lg transition-all flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Soil Report
      </button>
    </form>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Farm</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">{name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FarmManagement() {
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FarmResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Soil reports for selected farm
  const [soilReports, setSoilReports] = useState<SoilReportResponse[]>([]);
  const [soilLoading, setSoilLoading] = useState(false);

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFarms();
      setFarms(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  const fetchSoilReports = useCallback(async (farmId: string) => {
    setSoilLoading(true);
    try {
      const data = await api.getSoilReports(farmId);
      setSoilReports(data);
    } catch {
      setSoilReports([]);
    } finally {
      setSoilLoading(false);
    }
  }, []);

  const handleSelectFarm = (farmId: string) => {
    if (farmId === selectedFarmId) {
      setSelectedFarmId(null);
      setSoilReports([]);
    } else {
      setSelectedFarmId(farmId);
      fetchSoilReports(farmId);
    }
  };

  const handleFarmCreated = (farm: FarmResponse) => {
    setFarms(prev => [farm, ...prev]);
    setShowAddFarm(false);
  };

  const handleDeleteFarm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteFarm(deleteTarget.farm_id);
      setFarms(prev => prev.filter(f => f.farm_id !== deleteTarget.farm_id));
      if (selectedFarmId === deleteTarget.farm_id) setSelectedFarmId(null);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete farm');
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeFarm = farms.find(f => f.farm_id === selectedFarmId) ?? null;

  const totalArea = farms.reduce((s, f) => s + f.area_hectares, 0).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search farms..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Farm Management</h1>
              <p className="text-gray-600">Manage and monitor all your farms in one place</p>
            </div>
            <button onClick={() => setShowAddFarm(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Farm
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonStatCard key={index} />
              ))
            ) : (
              [
                { title: 'Total Farms', value: String(farms.length), icon: Wheat, gradient: 'from-emerald-500 to-green-500' },
                { title: 'Total Area', value: totalArea, unit: 'ha', icon: MapPin, gradient: 'from-teal-500 to-cyan-500' },
                { title: 'Active Crops', value: String(farms.filter(f => f.current_crop).length), icon: Sprout, gradient: 'from-violet-500 to-purple-500' },
                { title: 'Soil Reports', value: String(soilReports.length), icon: TestTube, gradient: 'from-blue-500 to-indigo-500' },
              ].map((card, i) => (
                <div key={i} className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {card.value}
                    {card.unit && <span className="text-lg text-gray-500 ml-1">{card.unit}</span>}
                  </h3>
                </div>
              ))
            )}
          </div>

          {/* Farm List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Farms</h2>
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            )}
            {error && <p className="text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
            {!loading && !error && farms.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Wheat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No farms yet. Add your first farm to get started.</p>
              </div>
            )}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {farms.map(farm => (
                  <div key={farm.farm_id}
                    className={`backdrop-blur-lg bg-white/60 rounded-2xl p-6 border transition-all cursor-pointer ${selectedFarmId === farm.farm_id ? 'border-emerald-400 shadow-xl' : 'border-emerald-100 hover:shadow-xl'}`}
                    onClick={() => handleSelectFarm(farm.farm_id)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                        <Wheat className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{farm.name}</h3>
                        {farm.region && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" /> {farm.region}
                          </div>
                        )}
                        {farm.latitude != null && farm.longitude != null && (
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {farm.latitude.toFixed(4)}°, {farm.longitude.toFixed(4)}°
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                      onClick={e => { e.stopPropagation(); setDeleteTarget(farm); }}
                      title="Delete farm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="backdrop-blur-lg bg-white/50 rounded-xl p-4 border border-emerald-100">
                      <div className="text-xs text-gray-600 mb-1">Area</div>
                      <div className="text-lg font-bold text-gray-800">{farm.area_hectares} ha</div>
                    </div>
                    <div className="backdrop-blur-lg bg-white/50 rounded-xl p-4 border border-emerald-100">
                      <div className="text-xs text-gray-600 mb-1">Current Crop</div>
                      <div className="text-lg font-bold text-gray-800">{farm.current_crop ?? '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        Updated {new Date(farm.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-700">active</span>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Farm Detail */}
          {activeFarm && (
            <div className="space-y-6">
              <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{activeFarm.name} — Detailed View</h2>
                    <p className="text-emerald-100">Soil reports and analytics</p>
                  </div>
                  <button onClick={() => setSelectedFarmId(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Location card */}
              {activeFarm.latitude != null && activeFarm.longitude != null && (
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" /> GPS Location
                  </h3>
                  <p className="font-mono text-gray-700">{activeFarm.latitude}°, {activeFarm.longitude}°</p>
                </div>
              )}

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Seasonal Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={seasonalData}>
                      <PolarGrid stroke="#d1fae5" />
                      <PolarAngleAxis dataKey="season" stroke="#6b7280" />
                      <PolarRadiusAxis stroke="#6b7280" />
                      <Radar name="Yield" dataKey="yield" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Radar name="Quality" dataKey="quality" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d1fae5', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Production Trend (Tons)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={productionData}>
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d1fae5', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="production" stroke="#14b8a6" strokeWidth={3} fill="url(#pg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Soil Reports */}
              <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-emerald-600" /> Soil Reports
                </h3>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Submit New Report</h4>
                  <SoilReportForm farmId={activeFarm.farm_id} onCreated={r => setSoilReports(prev => [r, ...prev])} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Report History</h4>
                  {soilLoading && <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>}
                  {!soilLoading && soilReports.length === 0 && <p className="text-sm text-gray-500">No soil reports yet.</p>}
                  <div className="space-y-3">
                    {soilReports.map(r => (
                      <div key={r.report_id} className="bg-white/50 rounded-xl p-4 border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{new Date(r.reported_at).toLocaleString()}</span>
                          <button
                            onClick={async () => {
                              await api.deleteSoilReport(activeFarm.farm_id, r.report_id);
                              setSoilReports(prev => prev.filter(x => x.report_id !== r.report_id));
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {r.ph_level != null && <span className="text-gray-700">pH: <strong>{r.ph_level}</strong></span>}
                          {r.moisture_percent != null && <span className="text-gray-700">Moisture: <strong>{r.moisture_percent}%</strong></span>}
                          {r.nitrogen_ppm != null && <span className="text-gray-700">N: <strong>{r.nitrogen_ppm} ppm</strong></span>}
                          {r.phosphorus_ppm != null && <span className="text-gray-700">P: <strong>{r.phosphorus_ppm} ppm</strong></span>}
                          {r.potassium_ppm != null && <span className="text-gray-700">K: <strong>{r.potassium_ppm} ppm</strong></span>}
                          {r.organic_matter_percent != null && <span className="text-gray-700">OM: <strong>{r.organic_matter_percent}%</strong></span>}
                        </div>
                        {r.notes && <p className="text-xs text-gray-500 mt-2 italic">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
      {showAddFarm && <AddFarmModal onClose={() => setShowAddFarm(false)} onCreated={handleFarmCreated} />}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDeleteFarm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
