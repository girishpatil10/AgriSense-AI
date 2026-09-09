import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { User, Bell, Globe, Shield, Settings, Camera, Mail, Phone, MapPin, Moon, Sun, Lock, Smartphone, Monitor, AlertTriangle, LogOut, Trash2, Check, ChevronDown, ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { api, UserResponse, FarmResponse } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => localStorage.getItem('avatar_data'));
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', email: '', location: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en-US');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('timezone') || 'CT');
  const [units, setUnits] = useState(() => localStorage.getItem('units') || 'imperial');
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : { email: true, push: true, sms: false, weather: true, yield: true, disease: true, market: false };
  });
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [farmPrefs, setFarmPrefs] = useState({
    default_farm: localStorage.getItem('default_farm') || '',
    primary_crop: localStorage.getItem('primary_crop') || 'wheat',
    farming_type: localStorage.getItem('farming_type') || 'organic',
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(() => localStorage.getItem('2fa_enabled') === 'true');

  useEffect(() => { loadUserData(); loadFarms(); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadUserData = async () => {
    try {
      const u = await api.me();
      setUser(u);
      setProfileForm({
        full_name: u.full_name || '',
        phone: u.phone || '',
        email: u.email || '',
        location: localStorage.getItem('user_location') || '',
        bio: localStorage.getItem('user_bio') || '',
      });
    } catch { showMessage('error', 'Failed to load user data'); }
  };

  const loadFarms = async () => {
    try { const data = await api.getFarms(); setFarms(data); } catch { /* optional */ }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showMessage('error', 'Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const d = reader.result as string;
      setAvatarPreview(d);
      localStorage.setItem('avatar_data', d);
      showMessage('success', 'Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    localStorage.removeItem('avatar_data');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showMessage('success', 'Photo removed');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile({ full_name: profileForm.full_name, phone: profileForm.phone || undefined });
      setUser(updated);
      localStorage.setItem('user_location', profileForm.location);
      localStorage.setItem('user_bio', profileForm.bio);
      showMessage('success', 'Profile updated successfully');
    } catch (err: any) { showMessage('error', err.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) { showMessage('error', 'Passwords do not match'); return; }
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(passwordForm.new)) {
      showMessage('error', 'Password needs 8+ chars, uppercase, lowercase, digit and special char');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(passwordForm.current, passwordForm.new);
      setPasswordForm({ current: '', new: '', confirm: '' });
      showMessage('success', 'Password changed successfully');
    } catch (err: any) { showMessage('error', err.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleNotificationToggle = (key: string) => {
    const u = { ...notifications, [key]: !notifications[key] };
    setNotifications(u);
    localStorage.setItem('notifications', JSON.stringify(u));
    showMessage('success', 'Saved');
  };

  const handlePreferencesSave = () => {
    localStorage.setItem('language', language);
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('units', units);
    showMessage('success', 'Preferences saved');
  };

  const handleFarmPrefsSave = () => {
    localStorage.setItem('default_farm', farmPrefs.default_farm);
    localStorage.setItem('primary_crop', farmPrefs.primary_crop);
    localStorage.setItem('farming_type', farmPrefs.farming_type);
    showMessage('success', 'Farm settings saved');
  };

  const handle2FAToggle = () => {
    const n = !twoFAEnabled;
    setTwoFAEnabled(n);
    localStorage.setItem('2fa_enabled', String(n));
    showMessage('success', n ? '2FA enabled' : '2FA disabled');
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const handleDeleteAccount = () => {
    if (window.confirm('Delete your account? This cannot be undone.')) {
      showMessage('error', 'Contact support to delete your account.');
    }
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'farm', label: 'Farm Settings', icon: Settings },
  ];

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-colors ${on ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${on ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {message && (
        <div className={`backdrop-blur-lg border rounded-2xl px-6 py-4 ${message.type === 'success' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-red-50/80 border-red-200 text-red-800'}`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="backdrop-blur-lg bg-white/80 border border-emerald-100 rounded-2xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-600 hidden sm:block">Manage your account and preferences</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-lg border border-emerald-100">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-800">{user?.full_name || 'Loading...'}</div>
              <div className="text-xs text-gray-600 capitalize">{user?.role || 'User'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Tab nav */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white/60 text-gray-700 hover:bg-white border border-emerald-100'}`}>
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Profile Information</h2>
                <p className="text-gray-600">Update your personal details and profile picture</p>
              </div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                      {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-100 hover:bg-emerald-50 transition-colors">
                      <Camera className="w-4 h-4 text-emerald-600" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{user?.full_name || 'User'}</h3>
                    <p className="text-gray-600 text-sm">{user?.email || ''}</p>
                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Upload photo</button>
                      {avatarPreview && <button type="button" onClick={handleRemovePhoto} className="text-red-500 text-sm font-medium hover:text-red-700">Remove</button>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF · max 2 MB</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate}>
                <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" value={profileForm.full_name} required
                        onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-gray-400 text-xs">(read-only)</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="email" value={profileForm.email} disabled
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-emerald-100 bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="tel" value={profileForm.phone} placeholder="+1 (555) 000-0000"
                          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={profileForm.location} placeholder="City, Country"
                          onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea rows={3} value={profileForm.bio} placeholder="Tell us about yourself..."
                        onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div><h2 className="text-2xl font-bold text-gray-800 mb-1">Notification Preferences</h2><p className="text-gray-600">Manage how you receive updates and alerts</p></div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Channels</h3>
                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { id: 'push', label: 'Push Notifications', desc: 'Get instant alerts on your device' },
                    { id: 'sms', label: 'SMS Notifications', desc: 'Text messages for critical alerts' },
                  ].map(ch => (
                    <div key={ch.id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-emerald-100">
                      <div><p className="font-medium text-gray-800">{ch.label}</p><p className="text-sm text-gray-600">{ch.desc}</p></div>
                      <Toggle on={notifications[ch.id]} onToggle={() => handleNotificationToggle(ch.id)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Alert Types</h3>
                <div className="space-y-3">
                  {[
                    { id: 'weather', label: 'Weather Alerts', desc: 'Severe weather and forecast updates' },
                    { id: 'yield', label: 'Yield Predictions', desc: 'AI-powered crop yield forecasts' },
                    { id: 'disease', label: 'Disease Detection', desc: 'Crop health and disease warnings' },
                    { id: 'market', label: 'Market Updates', desc: 'Price changes and market trends' },
                  ].map(al => (
                    <div key={al.id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-emerald-100">
                      <div><p className="font-medium text-gray-800">{al.label}</p><p className="text-sm text-gray-600">{al.desc}</p></div>
                      <Toggle on={notifications[al.id]} onToggle={() => handleNotificationToggle(al.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div><h2 className="text-2xl font-bold text-gray-800 mb-1">Preferences</h2><p className="text-gray-600">Customize your experience</p></div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDarkMode(false)}
                    className={`p-6 rounded-xl border-2 transition-all ${!darkMode ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white/50 hover:border-emerald-200'}`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"><Sun className="w-6 h-6 text-white" /></div>
                      <div className="text-center"><p className="font-medium text-gray-800">Light Mode</p><p className="text-sm text-gray-600">Bright and clean</p></div>
                      {!darkMode && <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    </div>
                  </button>
                  <button type="button" onClick={() => setDarkMode(true)}
                    className={`p-6 rounded-xl border-2 transition-all ${darkMode ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white/50 hover:border-emerald-200'}`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Moon className="w-6 h-6 text-white" /></div>
                      <div className="text-center"><p className="font-medium text-gray-800">Dark Mode</p><p className="text-sm text-gray-600">Easy on the eyes</p></div>
                      {darkMode && <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    </div>
                  </button>
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Language & Region</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option value="en-US">English (US)</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option value="CT">Central Time (CT)</option><option value="ET">Eastern Time (ET)</option><option value="PT">Pacific Time (PT)</option><option value="MT">Mountain Time (MT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Units</label>
                    <select value={units} onChange={e => setUnits(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option value="imperial">Imperial (acres, lbs)</option><option value="metric">Metric (hectares, kg)</option>
                    </select>
                  </div>
                </div>
                <button type="button" onClick={handlePreferencesSave} className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all">Save Preferences</button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div><h2 className="text-2xl font-bold text-gray-800 mb-1">Security Settings</h2><p className="text-gray-600">Manage your account security</p></div>
              <form onSubmit={handlePasswordChange}>
                <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-gray-800 mb-1">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">8+ chars with uppercase, lowercase, digit and special character.</p>
                  <div className="space-y-4">
                    {(['current', 'new', 'confirm'] as const).map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field === 'confirm' ? 'Confirm New Password' : field === 'new' ? 'New Password' : 'Current Password'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type={showPw[field] ? 'text' : 'password'} value={passwordForm[field]} required
                            onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
                            className="w-full pl-11 pr-11 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                          <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPw[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" disabled={loading}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}Update Password
                  </button>
                </div>
              </form>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-bold text-gray-800">Two-Factor Authentication</h3><p className="text-sm text-gray-600 mt-1">Add an extra layer of security</p></div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {twoFAEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle on={twoFAEnabled} onToggle={handle2FAToggle} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Connected Devices</h3>
                <div className="space-y-3">
                  {[
                    { device: 'This Browser', location: 'Current session', icon: Monitor, current: true },
                    { device: 'Mobile App', location: 'Last seen 2 days ago', icon: Smartphone, current: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><item.icon className="w-5 h-5 text-emerald-600" /></div>
                        <div><p className="font-medium text-gray-800">{item.device}</p><p className="text-sm text-gray-600">{item.location}</p></div>
                        {item.current && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Current</span>}
                      </div>
                      {!item.current && (
                        <button type="button" onClick={() => showMessage('success', 'Device removed')} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="backdrop-blur-lg bg-red-50/60 border border-red-200/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Danger Zone</h3>
                <div className="space-y-3">
                  <button type="button" onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/50 border border-red-200 hover:bg-red-50 transition-colors group">
                    <div className="flex items-center gap-3"><LogOut className="w-5 h-5 text-red-600" /><div className="text-left"><p className="font-medium text-gray-800">Sign Out</p><p className="text-sm text-gray-600">Sign out of your account</p></div></div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>
                  <button type="button" onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/50 border border-red-200 hover:bg-red-50 transition-colors group">
                    <div className="flex items-center gap-3"><Trash2 className="w-5 h-5 text-red-600" /><div className="text-left"><p className="font-medium text-gray-800">Delete Account</p><p className="text-sm text-gray-600">Permanently delete your account and all data</p></div></div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FARM SETTINGS */}
          {activeTab === 'farm' && (
            <div className="space-y-6">
              <div><h2 className="text-2xl font-bold text-gray-800 mb-1">Farm Settings</h2><p className="text-gray-600">Configure your default farm preferences</p></div>
              <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Farm Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Farm</label>
                    <select value={farmPrefs.default_farm} onChange={e => setFarmPrefs(p => ({ ...p, default_farm: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option value="">— Select a farm —</option>
                      {farms.map(f => <option key={f.farm_id} value={f.farm_id}>{f.name}</option>)}
                      {farms.length === 0 && <option disabled>No farms yet — add one in Farm Management</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crop Type</label>
                    <select value={farmPrefs.primary_crop} onChange={e => setFarmPrefs(p => ({ ...p, primary_crop: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      {['wheat','rice','corn','soybeans','cotton','barley','sorghum','oats'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farming Type</label>
                    <select value={farmPrefs.farming_type} onChange={e => setFarmPrefs(p => ({ ...p, farming_type: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option value="organic">Organic</option><option value="conventional">Conventional</option><option value="mixed">Mixed</option><option value="regenerative">Regenerative</option>
                    </select>
                  </div>
                </div>
                <button type="button" onClick={handleFarmPrefsSave} className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all">Save Farm Settings</button>
              </div>
              {farms.length > 0 && (
                <div className="backdrop-blur-lg bg-white/60 border border-white/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-gray-800 mb-4">Your Farms ({farms.length})</h3>
                  <div className="space-y-3">
                    {farms.map(f => (
                      <div key={f.farm_id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-emerald-100">
                        <div>
                          <p className="font-medium text-gray-800">{f.name}</p>
                          <p className="text-sm text-gray-600">{f.area_hectares} ha{f.current_crop ? ` · ${f.current_crop}` : ''}{f.region ? ` · ${f.region}` : ''}</p>
                        </div>
                        {farmPrefs.default_farm === f.farm_id && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Default</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}