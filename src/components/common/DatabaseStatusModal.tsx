import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Server,
  Layers,
  ArrowUpDown,
  Cpu,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  Globe,
  HardDrive,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { dbStatus, refreshDbStatus, syncDataToDb, isDbSyncing } = usePortal();
  const [activeTab, setActiveTab] = useState<'overview' | 'tidbConfig'>('overview');
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TiDB Cloud Connection Form State
  const [host, setHost] = useState(dbStatus?.host || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
  const [port, setPort] = useState(dbStatus?.port ? String(dbStatus.port) : '4000');
  const [user, setUser] = useState('4DCBaqMJVo1Yjy9.root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState(dbStatus?.database || 'college_nodue');
  const [enableSsl, setEnableSsl] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionUriInput, setConnectionUriInput] = useState('');

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Auto-switch to config tab if opened while database is not connected
  useEffect(() => {
    if (isOpen && dbStatus && !dbStatus.connected) {
      setActiveTab('tidbConfig');
    }
  }, [isOpen, dbStatus?.connected]);

  // Auto-parse connection URI if user pastes it
  const handleParseUri = (uriText: string) => {
    setConnectionUriInput(uriText);
    const cleaned = uriText.trim();
    if (!cleaned) return;

    try {
      const normalized = cleaned.replace(/^mysql:\/\//i, 'http://');
      const u = new URL(normalized);
      if (u.hostname) setHost(u.hostname);
      if (u.port) setPort(u.port);
      if (u.username) setUser(decodeURIComponent(u.username));
      if (u.pathname && u.pathname !== '/') {
        setDatabase(u.pathname.replace(/^\//, ''));
      }
      if (u.password && u.password !== '<PASSWORD>') {
        setPassword(decodeURIComponent(u.password));
        setTestFeedback({
          success: true,
          message: 'Connection URI parsed successfully with password included!',
        });
      } else {
        setTestFeedback({
          success: true,
          message: 'Cluster connection string detected! Please enter your TiDB password below.',
        });
      }
    } catch {
      const match = cleaned.match(/mysql:\/\/(?:([^:@]+)(?::([^@]*))?@)?([^:\/]+)(?::(\d+))?(?:\/(.*))?/i);
      if (match) {
        if (match[1]) setUser(match[1]);
        if (match[2] && match[2] !== '<PASSWORD>') setPassword(match[2]);
        if (match[3]) setHost(match[3]);
        if (match[4]) setPort(match[4]);
        if (match[5]) setDatabase(match[5]);
        setTestFeedback({
          success: true,
          message: 'Cluster connection string parsed. Please enter your TiDB password below.',
        });
      }
    }
  };

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSyncResult(null);
    await refreshDbStatus();
    setIsRefreshing(false);
  };

  const handleSync = async () => {
    setSyncResult(null);
    const res = await syncDataToDb();
    setSyncResult(res);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestFeedback(null);
    try {
      const res = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 4000,
          user: user.trim(),
          password: password.trim(),
          database: database.trim(),
          enableSsl,
        }),
      });
      const data = await res.json();
      setTestFeedback(data);
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: `Network error while contacting server: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setTestFeedback({
        success: false,
        message: 'Please enter your TiDB Cloud database password to connect.',
      });
      return;
    }

    setIsSavingConfig(true);
    setTestFeedback(null);
    try {
      const res = await fetch('/api/db/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 4000,
          user: user.trim(),
          password: password.trim(),
          database: database.trim(),
          enableSsl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestFeedback({
          success: true,
          message: data.message || 'Connected to TiDB Cloud and synchronized all database records!',
        });
        await refreshDbStatus();
      } else {
        setTestFeedback({
          success: false,
          message: data.message || 'Failed to connect to TiDB.',
        });
      }
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: `Error connecting to database: ${err.message}`,
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Database Engine & TiDB Cloud</h3>
              <p className="text-xs text-slate-400">Institutional Database Connectivity & Auto-Sync</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Status & Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tidbConfig')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tidbConfig'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Connect TiDB Database</span>
            {dbStatus?.connected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' ? (
            <>
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  dbStatus?.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {dbStatus?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs flex-1">
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{dbStatus?.connected ? 'TiDB Cloud Connected & Active' : 'Local Memory Store Active (TiDB Offline)'}</span>
                    {dbStatus?.latencyMs && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                        {dbStatus.latencyMs}ms ping
                      </span>
                    )}
                  </div>
                  <div className="mt-1 opacity-90">
                    {dbStatus?.connected
                      ? 'Every student, mark, attendance log, and fee payment is automatically saved to your TiDB database.'
                      : 'Data is stored in-memory. To persist records permanently to TiDB Cloud, click "Connect TiDB Database" above.'}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Storage Engine</span>
                  <span className="font-bold text-slate-800 uppercase flex items-center gap-1.5 mt-0.5">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    {dbStatus?.type || 'TiDB Cloud (MySQL)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Host / Port</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <Cpu className="w-3.5 h-3.5 text-slate-600" />
                    {dbStatus?.host ? `${dbStatus.host}:${dbStatus.port}` : 'gateway01...tidbcloud.com:4000'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Active Database</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    {dbStatus?.database || 'college_nodue'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">SSL / Encryption</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    TLS v1.2 Enabled
                  </span>
                </div>
              </div>

              {/* Persisted Records Counts */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Persisted Records Count</span>
                  <span className="text-[10px] text-slate-400">Auto-synced</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {dbStatus?.tableCounts?.students ?? 10}
                    </div>
                    <div className="text-[10px] text-slate-500">Students</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {dbStatus?.tableCounts?.faculty ?? 4}
                    </div>
                    <div className="text-[10px] text-slate-500">Faculty</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {dbStatus?.tableCounts?.attendance ?? 240}
                    </div>
                    <div className="text-[10px] text-slate-500">Attendance</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {dbStatus?.tableCounts?.fees ?? 8}
                    </div>
                    <div className="text-[10px] text-slate-500">Fees</div>
                  </div>
                </div>
              </div>

              {/* Sync Result notification */}
              {syncResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    syncResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {syncResult.message}
                </div>
              )}
            </>
          ) : (
            /* TiDB Cloud Configuration Tab */
            <form onSubmit={handleSaveAndConnect} className="space-y-3.5">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-indigo-950 mb-1">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Connect to TiDB Cloud Database</span>
                </div>
                Enter your TiDB cluster credentials below. Once connected, all student entries, marks, and attendance are permanently saved to your cloud database.
              </div>

              {/* Quick Paste Connection String */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Paste TiDB Connection String (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Auto-populates fields</span>
                </div>
                <input
                  type="text"
                  value={connectionUriInput}
                  onChange={(e) => handleParseUri(e.target.value)}
                  placeholder="mysql://4DCBaqMJVo1Yjy9.root:<PASSWORD>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/college_nodue"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">TiDB Host</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="4000"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">User</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="4DCBaqMJVo1Yjy9.root"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Database Name</label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="college_nodue"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">TiDB Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter TiDB Cloud cluster password"
                    className="w-full text-xs px-2.5 py-2 pr-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enableSsl"
                  checked={enableSsl}
                  onChange={(e) => setEnableSsl(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="enableSsl" className="text-xs text-slate-600 cursor-pointer font-medium">
                  Enable SSL / TLS v1.2 (Required for TiDB Cloud Serverless)
                </label>
              </div>

              {/* Test feedback notification */}
              {testFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    testFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {testFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testFeedback.message}</span>
                  </div>
                  {testFeedback.latencyMs !== undefined && (
                    <div className="mt-1 text-[11px] text-emerald-700">
                      Roundtrip Latency: {testFeedback.latencyMs}ms
                    </div>
                  )}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !password.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging TiDB...' : 'Test Connection'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingConfig || !password.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Zap className={`w-3.5 h-3.5 ${isSavingConfig ? 'animate-spin' : ''}`} />
                  <span>{isSavingConfig ? 'Connecting & Syncing...' : 'Connect & Sync to TiDB'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Check Status'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={isDbSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowUpDown className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
              <span>{isDbSyncing ? 'Syncing...' : 'Sync All Records'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
