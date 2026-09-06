"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTokenStatus,
  callProtectedEndpoint,
  forceRefreshNow,
  simulateAccessTokenExpiry,
  simulateRefreshTokenExpiry,
  logoutUser,
} from "@/services/authDebug";

interface TokenInfo {
  present: boolean;
  preview: string;
  expiresAt: number | null;
}

interface LogEntry {
  time: string;
  message: string;
  success: boolean;
}

interface ActionResult {
  success: boolean;
  message: string;
  sessionExpired?: boolean;
}

function formatCountdown(expiresAt: number | null): string | null {
  if (!expiresAt) return null;
  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) return "expired";
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AuthDebugDashboard() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<TokenInfo>({ present: false, preview: "", expiresAt: null });
  const [refreshToken, setRefreshToken] = useState<TokenInfo>({ present: false, preview: "", expiresAt: null });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [, forceTick] = useState(0);

  const refreshStatus = async () => {
    const status = await getTokenStatus();
    setAccessToken(status.accessToken);
    setRefreshToken(status.refreshToken);
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(() => {
      refreshStatus();
      forceTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string, success: boolean) => {
    setLogs((prev) => [{ time: new Date().toLocaleTimeString(), message, success }, ...prev]);
  };

  const runAction = async (action: () => Promise<ActionResult>) => {
    setLoading(true);
    try {
      const result = await action();
      addLog(result.message, result.success);

      if (result.sessionExpired) {
        addLog("🔒 Session fully expired — redirecting to login...", false);
        setTimeout(() => router.push("/login"), 1500);
        return;
      }
    } catch (err: any) {
      addLog(`❌ ${err.message || "Unexpected error"}`, false);
    } finally {
      await refreshStatus();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-indigo-600">TaskFlow</h1>
          <h2 className="text-2xl font-bold text-gray-800">Auth debug dashboard</h2>
          <p className="text-sm text-gray-500">
            Live status of your Strapi access + refresh token cookies.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Access Token</p>
              <span className={`w-2.5 h-2.5 rounded-full ${accessToken.present ? "bg-green-500" : "bg-red-500"}`} />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {accessToken.present ? "Present" : "Missing"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {accessToken.present ? accessToken.preview : "No active access token"}
            </p>
            {accessToken.present && accessToken.expiresAt && (
              <p className="text-xs font-medium text-indigo-500 mt-1">
                Expires in {formatCountdown(accessToken.expiresAt)}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Refresh Token</p>
              <span className={`w-2.5 h-2.5 rounded-full ${refreshToken.present ? "bg-green-500" : "bg-red-500"}`} />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {refreshToken.present ? "Present" : "Missing"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {refreshToken.present ? refreshToken.preview : "No refresh token"}
            </p>
            {refreshToken.present && refreshToken.expiresAt && (
              <p className="text-xs font-medium text-indigo-500 mt-1">
                Expires in {formatCountdown(refreshToken.expiresAt)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={loading}
              onClick={() => runAction(callProtectedEndpoint)}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Call protected endpoint
            </button>
            <button
              disabled={loading}
              onClick={() => runAction(forceRefreshNow)}
              className="px-4 py-2 text-sm rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
            >
              Force refresh now
            </button>
            <button
              disabled={loading}
              onClick={() => runAction(simulateAccessTokenExpiry)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Simulate access token expiry
            </button>
            <button
              disabled={loading}
              onClick={() => runAction(simulateRefreshTokenExpiry)}
              className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Simulate refresh token expiry
            </button>
          </div>
          <div className="mt-3 text-right">
            <button
              disabled={loading}
              onClick={() => runAction(logoutUser)}
              className="text-sm text-gray-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Activity log</p>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400">No actions yet — try a button above.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <li key={i} className="text-xs flex gap-2">
                  <span className="text-gray-400">{log.time}</span>
                  <span className={log.success ? "text-green-600" : "text-red-500"}>{log.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}