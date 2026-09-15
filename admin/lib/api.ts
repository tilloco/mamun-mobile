import type {
  AiRecommendation,
  ApiErrorBody,
  CourseModule,
  DashboardData,
  FreeQuota,
  LessonDetail,
  RequestOtpResponse,
  SubmitAnswerResult,
  User,
  VerifyOtpResponse,
} from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(body: ApiErrorBody, statusCode: number) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    super(message || "Noma'lum xatolik yuz berdi");
    this.statusCode = statusCode;
    this.code = body.code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // Tarmoq xatosi (server ishlamayapti, internet yo'q va h.k.)
    throw new ApiError(
      { statusCode: 0, message: "Serverga ulanib bo'lmadi. Internetni yoki server manzilini tekshiring." },
      0,
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    throw new ApiError(data as ApiErrorBody, res.status);
  }

  return data as T;
}

export const api = {
  // --- Auth ---
  requestOtp: (email: string) => request<RequestOtpResponse>('/auth/request-otp', { method: 'POST', body: { email } }),

  verifyOtp: (email: string, code: string, name?: string, referredByCode?: string) =>
    request<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: { email, code, name, referredByCode },
    }),

  // --- Profile ---
  getMe: (token: string) => request<User>('/users/me', { token }),

  updateProfile: (token: string, dto: { name?: string; examDate?: string }) =>
    request<User>('/users/me', { method: 'PATCH', token, body: dto }),

  getDashboard: (token: string) => request<DashboardData>('/users/dashboard', { token }),

  // --- Content ---
  // Backend endi bu ikkalasini ham login talab qiladi (anonim scraping'dan himoya
  // uchun) - shuning uchun token har doim yuborilishi kerak.
  listModules: (token: string) => request<CourseModule[]>('/content/modules', { token }),

  getLesson: (token: string, lessonId: string) =>
    request<LessonDetail>(`/content/lessons/${lessonId}`, { token }),

  // --- Quiz ---
  submitAnswer: (token: string, questionId: string, chosenIndex: number) =>
    request<SubmitAnswerResult>('/quiz/answer', { method: 'POST', token, body: { questionId, chosenIndex } }),

  completeLesson: (token: string, lessonId: string) =>
    request<{ message: string }>(`/quiz/lessons/${lessonId}/complete`, { method: 'POST', token }),

  getFreeQuota: (token: string) => request<FreeQuota>('/quiz/free-quota', { token }),

  // --- AI shaxsiylashtirilgan tavsiyalar (faqat Premium) ---
  getAiRecommendation: (token: string, forceRefresh = false) =>
    request<AiRecommendation>(`/ai/recommendation${forceRefresh ? '?refresh=true' : ''}`, { token }),
};