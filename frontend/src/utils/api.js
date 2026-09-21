import axios from 'axios';

// to use the backend url
const API = axios.create({
  baseURL: "https://webgen-backend-one.vercel.app/api",
  headers: { "Content-Type": "application/json"},
});

// to pass the token if user is logged-in
API.interceptors.request.use((config)=> {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if token is expired or session expired
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isThirdParty = /\/(deploy|github)$/i.test(url);
    if (err.response?.status === 401 && !isThirdParty) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export const apiError = (err) =>
  err?.response?.data?.error || err?.message || "Something went wrong";

const body = (p) => p.then((r) => r.data);

// THESE ROUTE ARE FOR AUTHENTICATION
export const register = (data) => body(API.post("/auth/register", data));
export const registerVerify = (email, code) =>
  body(API.post("/auth/register/verify", { email, code }));
export const registerResend = (email) =>
  body(API.post("/auth/register/resend", { email }));
export const login = (data) => body(API.post("/auth/login", data));

export const getMe = () => body(API.get("/auth/me"));
export const updateProfile = (data) => body(API.patch("/auth/me", data));
export const changePassword = (data) =>
  body(API.patch("/auth/me/password", data));
export const deleteMyAccount = () => body(API.delete("/auth/me"));
export const getContributions = () => body(API.get("/auth/me/contributions"));

// IF USER FORGOT THEIR PASSWORD
export const forgotRequest = (email) =>
  body(API.post("/auth/forgot/request", { email }));
export const forgotVerifyCode = (email, code) =>
  body(API.post("/auth/forgot/verify-code", { email, code }));
export const forgotReset = (email, code, newPassword) =>
  body(API.post("/auth/forgot/reset", { email, code, newPassword }));


// THESE ROUTES ARE FOR THE PROJECTS
export const getProjects = () => body(API.get("/projects"));
export const createProject = (data) => body(API.post("/projects", data));
export const getProject = (id) => body(API.get(`/projects/${id}`));
export const updateProject = (id, data) =>
  body(API.patch(`/projects/${id}`, data));
export const deleteProject = (id) => body(API.delete(`/projects/${id}`));
export const generateProject = (id, prompt) =>
  body(API.post(`/projects/${id}/generate`, { prompt }));
export const uploadToGithub = (id, data) =>
  body(API.post(`/projects/${id}/github`, data));
export const deployToVercel = (id, data) =>
  body(API.post(`/projects/${id}/deploy`, data));


// THESE ROUTES ARE FOR THE COMMUNITY ROUTER WE CREATED IN THE BACKEND
export const getCommunity = (sort = "new") =>
  body(API.get(`/community?sort=${sort}`));
export const getCommunityProject = (id) => body(API.get(`/community/${id}`));
export const likeCommunityProject = (id) =>
  body(API.post(`/community/${id}/like`));


// THESE ROUTES ARE FOR PAYMENTS
export const getPackages = () => body(API.get("/payments/packages"));
export const createCheckoutSession = (packageId) =>
  body(API.post("/payments/create-checkout-session", { packageId }));
export const verifySession = (sessionId) =>
  body(API.post("/payments/verify-session", { sessionId }));

export default API;