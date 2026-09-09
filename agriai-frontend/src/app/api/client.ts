const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

interface ApiError {
  error: { code: string; message: string };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: { code: "UNKNOWN", message: res.statusText },
    }));
    throw new Error(body.error?.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;
  try {
    const data = await request<{ access_token: string; refresh_token: string }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      false
    );
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return false;
  }
}

// ── Farm types ──────────────────────────────────────────────────────────────

export interface FarmResponse {
  farm_id: string;
  user_id: string;
  name: string;
  region: string | null;
  area_hectares: number;
  latitude: number | null;
  longitude: number | null;
  current_crop: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmCreate {
  name: string;
  region?: string;
  area_hectares: number;
  latitude?: number;
  longitude?: number;
  current_crop?: string;
}

export interface FarmUpdate {
  name?: string;
  region?: string;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
  current_crop?: string;
}

export interface SoilReportResponse {
  report_id: string;
  farm_id: string;
  ph_level: number | null;
  moisture_percent: number | null;
  nitrogen_ppm: number | null;
  phosphorus_ppm: number | null;
  potassium_ppm: number | null;
  organic_matter_percent: number | null;
  notes: string | null;
  reported_at: string;
  created_at: string;
}

export interface SoilReportCreate {
  ph_level?: number;
  moisture_percent?: number;
  nitrogen_ppm?: number;
  phosphorus_ppm?: number;
  potassium_ppm?: number;
  organic_matter_percent?: number;
  notes?: string;
}

export interface CropHistoryResponse {
  history_id: string;
  farm_id: string;
  crop_name: string;
  sown_date: string | null;
  harvest_date: string | null;
  yield_tons: number | null;
  season: string | null;
  created_at: string;
}

export interface CropHistoryCreate {
  crop_name: string;
  sown_date?: string;
  harvest_date?: string;
  yield_tons?: number;
  season?: string;
}

// ── Predictions ──────────────────────────────────────────────────────────────

export interface SoilPredictionResponse {
  soil_type: string;
  confidence: number;
  deficiencies: string[];
  recommendations: string[];
  prediction_id: string;
  cached?: boolean;
}

export interface SoilPredictionRequest {
  report_id?: string;
  inline_values?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    moisture: number;
  };
}

export interface RecommendedCrop {
  crop_name: string;
  suitability_score: number;
  reason: string;
}

export interface CropRecommendationResponse {
  recommended_crops: RecommendedCrop[];
  rotation_advice: string;
  inference_mode: string;
  prediction_id: string;
  cached?: boolean;
}

export interface CropRecommendationRequest {
  soil_report_id?: string;
  farm_id?: string;
  season: string;
  previous_crop?: string;
}

export interface FertilizerPredictionResponse {
  fertilizer_type: string;
  dosage_kg_per_hectare: number;
  total_dosage_kg: number;
  application_method: string;
  additional_notes: string;
  confidence: number;
  cached?: boolean;
  prediction_id?: string;
}

export interface FertilizerPredictionRequest {
  soil_report_id?: string;
  inline_values?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    moisture: number;
  };
  crop_name: string;
  area_hectares: number;
}

export interface DiseasePredictionResponse {
  disease_name: string;
  scientific_name: string;
  confidence: number;
  severity: string;
  affected_area_pct: number;
  treatment: {
    chemical: string;
    biological: string;
    cultural: string;
  };
  is_healthy: boolean;
  prediction_id?: string;
}

export interface YieldPredictionRequest {
  farm_id: string;
  crop_name: string;
  soil_report_id: string;
  season: string;
}

export interface YieldPredictionResponse {
  predicted_yield_kg_per_hectare: number;
  total_predicted_yield_kg: number;
  yield_range: {
    low: number;
    high: number;
    confidence_level: number;
  };
  key_factors: string[];
  prediction_id: string;
  cached?: boolean;
}

export interface PredictionHistoryResponse {
  prediction_id: string;
  user_id: string;
  prediction_type: string;
  input_data: any;
  result: any;
  created_at: string;
  feedback_rating: string | null;
}

export interface FeedbackCreate {
  prediction_id: string;
  rating: "correct" | "partially_correct" | "incorrect";
  comment?: string;
  actual_outcome?: any;
}

export interface FeedbackResponse {
  feedback_id: string;
  prediction_id: string;
  rating: string;
  comment: string | null;
  submitted_at: string;
}

export interface DashboardSummary {
  total_farms: number;
  total_area_hectares: number;
  predictions_this_month: number;
  recent_prediction: PredictionHistoryResponse | null;
  total_feedback: number;
  correct_count: number;
  partially_correct_count: number;
  incorrect_count: number;
  weighted_accuracy_pct: number;
}

// ── Weather types ────────────────────────────────────────────────────────────

export interface WeatherForecastItem {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  condition: string;
  icon?: string;
}

export interface WeatherResponse {
  location: string;
  latitude: number;
  longitude: number;
  current_temp: number | null;
  summary: string;
  forecast: WeatherForecastItem[];
  agricultural_advisory?: string;
}

// ── User types ───────────────────────────────────────────────────────────────

export interface UserResponse {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const api = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) =>
    request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh_token: string) =>
    request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  logout: (refresh_token: string) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  me: () => request<UserResponse>("/auth/me"),

  updateProfile: (data: { full_name?: string; phone?: string }) =>
    request<UserResponse>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<void>("/auth/me/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),

  // ── Farms ──────────────────────────────────────────────────────────────────

  createFarm: (data: FarmCreate) =>
    request<FarmResponse>("/farms", { method: "POST", body: JSON.stringify(data) }),

  getFarms: (page = 1, pageSize = 20) =>
    request<FarmResponse[]>(`/farms?page=${page}&page_size=${pageSize}`),

  getFarm: (farmId: string) => request<FarmResponse>(`/farms/${farmId}`),

  updateFarm: (farmId: string, data: FarmUpdate) =>
    request<FarmResponse>(`/farms/${farmId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteFarm: (farmId: string) =>
    request<void>(`/farms/${farmId}`, { method: "DELETE" }),

  // ── Soil Reports ───────────────────────────────────────────────────────────

  createSoilReport: (farmId: string, data: SoilReportCreate) =>
    request<SoilReportResponse>(`/farms/${farmId}/soil-reports`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSoilReports: (farmId: string, page = 1, pageSize = 20) =>
    request<SoilReportResponse[]>(
      `/farms/${farmId}/soil-reports?page=${page}&page_size=${pageSize}`
    ),

  deleteSoilReport: (farmId: string, reportId: string) =>
    request<void>(`/farms/${farmId}/soil-reports/${reportId}`, { method: "DELETE" }),

  // ── Crop History ───────────────────────────────────────────────────────────

  addCropHistory: (farmId: string, data: CropHistoryCreate) =>
    request<CropHistoryResponse>(`/farms/${farmId}/crop-history`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCropHistory: (farmId: string, page = 1, pageSize = 20) =>
    request<CropHistoryResponse[]>(
      `/farms/${farmId}/crop-history?page=${page}&page_size=${pageSize}`
    ),

  // ── Predictions ────────────────────────────────────────────────────────────

  predictSoil: (data: SoilPredictionRequest) =>
    request<SoilPredictionResponse>("/predict/soil", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  predictCrop: (data: CropRecommendationRequest) =>
    request<CropRecommendationResponse>("/predict/crop", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  predictFertilizer: (data: FertilizerPredictionRequest) =>
    request<FertilizerPredictionResponse>("/predict/fertilizer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  predictDisease: (formData: FormData) =>
    request<DiseasePredictionResponse>("/predict/disease", {
      method: "POST",
      body: formData,
    }),

  predictYield: (data: YieldPredictionRequest) =>
    request<YieldPredictionResponse>("/predict/yield", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getWeather: (params: { farm_id?: string; lat?: number; lon?: number; days?: number }) => {
    const query = new URLSearchParams();
    if (params.farm_id) query.append("farm_id", params.farm_id);
    if (params.lat) query.append("lat", params.lat.toString());
    if (params.lon) query.append("lon", params.lon.toString());
    if (params.days) query.append("days", params.days.toString());
    return request<WeatherResponse>(`/predict/weather?${query.toString()}`);
  },

  // ── Feedback ───────────────────────────────────────────────────────────────

  submitFeedback: (data: FeedbackCreate) =>
    request<FeedbackResponse>("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyFeedback: (skip = 0, limit = 10) =>
    request<FeedbackResponse[]>(`/feedback/my?skip=${skip}&limit=${limit}`),

  // ── Dashboard & History ────────────────────────────────────────────────────

  getPredictionHistory: (params: {
    prediction_type?: string;
    farm_id?: string;
    skip?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.prediction_type) query.append("prediction_type", params.prediction_type);
    if (params.farm_id) query.append("farm_id", params.farm_id);
    if (params.skip) query.append("skip", params.skip.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    return request<PredictionHistoryResponse[]>(`/predictions/history?${query.toString()}`);
  },

  getDashboardSummary: () => request<DashboardSummary>("/dashboard/summary"),
};
