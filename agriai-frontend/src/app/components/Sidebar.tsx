import { Link } from 'react-router';
import {
  Sprout,
  LayoutDashboard,
  Wheat,
  TestTube,
  Bug,
  Lightbulb,
  TrendingUp,
  CloudRain,
  History,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
  colorScheme?: 'emerald' | 'cyan';
}

export default function Sidebar({ isOpen, onClose, activePath, colorScheme = 'emerald' }: SidebarProps) {
  const mainMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Wheat, label: 'Farms', path: '/farms' },
    { icon: TestTube, label: 'Soil Analysis', path: '/soil-analysis' },
    { icon: Bug, label: 'Disease Detection', path: '/disease-detection' },
    { icon: Lightbulb, label: 'Crop Recommendation', path: '/crop-recommendation' },
    { icon: TrendingUp, label: 'Yield Prediction', path: '/yield-prediction' },
    { icon: CloudRain, label: 'Weather', path: '/weather' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Lightbulb, label: 'Feedback', path: '/feedback' }
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const getBorderColor = () => colorScheme === 'emerald' ? 'border-emerald-100' : 'border-cyan-100';
  const getHoverColor = () => colorScheme === 'emerald' ? 'hover:bg-emerald-50' : 'hover:bg-cyan-50';
  const getGradient = () => colorScheme === 'emerald'
    ? 'from-emerald-600 to-teal-600'
    : 'from-cyan-600 to-blue-600';
  const getTextColor = () => colorScheme === 'emerald' ? 'text-emerald-600' : 'text-cyan-600';
  const getBgGradient = () => colorScheme === 'emerald'
    ? 'from-emerald-600 to-teal-600'
    : 'from-cyan-600 to-blue-600';

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 backdrop-blur-lg bg-white/80 border-r ${getBorderColor()} transform transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Header */}
      <div className={`p-6 border-b ${getBorderColor()} flex items-center justify-between`}>
        <Link to="/" className="flex items-center gap-2">
          <Sprout className={`w-8 h-8 ${getTextColor()}`} />
          <span className={`text-xl font-bold bg-gradient-to-r ${getBgGradient()} bg-clip-text text-transparent`}>
            AgriAI
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {mainMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePath === item.path
                ? `bg-gradient-to-r ${getGradient()} text-white shadow-lg`
                : `text-gray-700 ${getHoverColor()}`
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation - Fixed */}
      <div className={`p-4 border-t ${getBorderColor()} space-y-2`}>
        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePath === item.path
                ? `bg-gradient-to-r ${getGradient()} text-white shadow-lg`
                : `text-gray-700 ${getHoverColor()}`
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
