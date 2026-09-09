import { Sprout, Leaf, CloudRain, TrendingUp, Search, Menu, Check, ArrowRight, Star, Users, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sprout className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AgriAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors">Features</a>
              <Link to="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">Dashboard</Link>
              <Link to="/farms" className="text-gray-700 hover:text-emerald-600 transition-colors">Farms</Link>
              <Link to="/fertilizer" className="text-gray-700 hover:text-emerald-600 transition-colors">Fertilizer</Link>
              <Link to="/login" className="text-gray-700 hover:text-emerald-600 transition-colors">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                🌱 AI-Powered Agriculture
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                Smart AI Agriculture for Better Farming
              </h1>
              <p className="text-xl text-gray-600">
                Harness the power of artificial intelligence to optimize crop yields, predict weather patterns, and make data-driven decisions for sustainable farming.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 backdrop-blur-lg bg-white/60 border-2 border-emerald-200 text-emerald-700 rounded-lg hover:bg-white/80 transition-all">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Smart farming technology"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Active Farmers' },
              { number: '2M+', label: 'Acres Monitored' },
              { number: '35%', label: 'Avg Yield Increase' },
              { number: '98%', label: 'Accuracy Rate' }
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to transform your farming operations with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Soil Analysis',
                description: 'Get detailed insights about soil health, nutrient levels, and pH balance using AI-powered analysis.',
                gradient: 'from-amber-500 to-orange-500'
              },
              {
                icon: Leaf,
                title: 'Disease Detection',
                description: 'Early detection of crop diseases and pests through computer vision and machine learning algorithms.',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                icon: Sprout,
                title: 'Crop Recommendation',
                description: 'AI-driven suggestions for optimal crop selection based on soil, climate, and market conditions.',
                gradient: 'from-teal-500 to-cyan-500'
              },
              {
                icon: CloudRain,
                title: 'Weather Forecast',
                description: 'Hyperlocal weather predictions and climate insights to plan your farming activities effectively.',
                gradient: 'from-blue-500 to-indigo-500'
              },
              {
                icon: TrendingUp,
                title: 'Yield Prediction',
                description: 'Accurate crop yield forecasting using historical data, weather patterns, and growth analytics.',
                gradient: 'from-violet-500 to-purple-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Real-time monitoring and comprehensive analytics to track your farm performance and ROI.',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-xl"></div>
                <div className="relative backdrop-blur-lg bg-white/60 rounded-2xl p-8 border border-emerald-100 hover:border-emerald-300 hover:shadow-2xl transition-all">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-100/50 to-teal-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with AgriAI in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Your Farm',
                description: 'Sign up and add your farm details, including location, size, and current crops.'
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI analyzes your data, weather patterns, soil conditions, and market trends.'
              },
              {
                step: '03',
                title: 'Get Insights',
                description: 'Receive actionable recommendations and monitor your farm in real-time.'
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-8 border border-emerald-200 hover:shadow-xl transition-all">
                  <div className="text-6xl font-bold bg-gradient-to-br from-emerald-200 to-teal-200 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-emerald-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
              Trusted by Farmers Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our farming community has to say about AgriAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'John Martinez',
                role: 'Organic Farm Owner',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
                rating: 5,
                text: 'AgriAI helped us increase our crop yield by 40% in just one season. The disease detection feature saved us thousands in potential losses.'
              },
              {
                name: 'Sarah Chen',
                role: 'Agricultural Consultant',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
                rating: 5,
                text: 'The AI-powered recommendations are incredibly accurate. It\'s like having an expert agronomist available 24/7 for all our clients.'
              },
              {
                name: 'David Thompson',
                role: 'Commercial Farmer',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
                rating: 5,
                text: 'The weather forecasting and yield prediction features have revolutionized how we plan our operations. Highly recommended!'
              }
            ].map((testimonial, index) => (
              <div key={index} className="backdrop-blur-lg bg-white/60 rounded-2xl p-8 border border-emerald-100 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Farm?
              </h2>
              <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
                Join thousands of farmers who are already using AI to boost their productivity and profits
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-lg hover:shadow-2xl transition-all">
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-8 h-8 text-emerald-400" />
                <span className="text-xl font-bold">AgriAI</span>
              </div>
              <p className="text-emerald-200 leading-relaxed">
                Empowering farmers with AI-driven insights for sustainable and profitable agriculture.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-emerald-300">© 2026 AgriAI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Users className="w-5 h-5 text-emerald-400" />
              <Shield className="w-5 h-5 text-emerald-400" />
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
