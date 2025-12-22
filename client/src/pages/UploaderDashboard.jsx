import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Upload,
    History,
    CheckCircle2,
    AlertCircle,
    FileText,
    ShieldCheck,
    TrendingUp,
    ExternalLink,
    Search
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const UploaderDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalDocuments: 0, verifications: [], recentDocuments: [] });
    const [instStatus, setInstStatus] = useState(null);
    const [instRequest, setInstRequest] = useState(null);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestForm, setRequestForm] = useState({ name: '', address: '' });

    useEffect(() => {
        fetchStatus();
        fetchStats();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/institutions/my-status');
            setInstStatus(res.data.status);
            if (res.data.status !== 'none' && res.data.status !== 'approved') {
                setInstRequest(res.data.request);
            } else if (res.data.status === 'approved') {
                setInstRequest(res.data.institution);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/documents/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/institutions/request', {
                institutionName: requestForm.name,
                institutionAddress: requestForm.address
            });
            fetchStatus();
            setMessage('Request submitted successfully!');
        } catch (err) {
            setMessage('Request failed');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setLoading(true);
        setMessage('');
        try {
            const res = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(`Success! Tx: ${res.data.txHash.substring(0, 20)}...`);
            fetchStats();
            setFile(null);
        } catch (err) {
            setMessage(`Upload failed: ${err.response?.data?.message || err.message}`);
        }
        setLoading(false);
    };

    const COLORS = ['#10b981', '#ef4444', '#f59e0b'];
    const chartData = stats.verifications.map(v => ({ name: v.result.toUpperCase(), value: v.count }));

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Uploader Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        {instStatus === 'approved' ? `Manager at ${instRequest?.name}` : 'Setup your institution to start anchoring'}
                    </p>
                </div>
                {instStatus === 'approved' && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Active Institution</span>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Recent */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Total Documents</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.totalDocuments}</h3>
                                </div>
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-indigo-600 font-semibold gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Blockchain Synced</span>
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl shadow-lg border-t-4 border-emerald-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Total Verifications</p>
                                    <h3 className="text-3xl font-bold mt-1">
                                        {stats.verifications.reduce((acc, curr) => acc + curr.count, 0)}
                                    </h3>
                                </div>
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-emerald-600 font-semibold gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Real-time tracking</span>
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl shadow-lg border-t-4 border-amber-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Verification Success</p>
                                    <h3 className="text-3xl font-bold mt-1">
                                        {stats.verifications.find(v => v.result === 'valid')?.count || 0}
                                    </h3>
                                </div>
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-amber-600 font-semibold gap-1">
                                <Search className="w-4 h-4" />
                                <span>Validated Assets</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chart & Recent Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Verification Stats
                            </h3>
                            <div className="h-64">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        No verification data available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-600" />
                                Recent Uploads
                            </h3>
                            <div className="space-y-4">
                                {stats.recentDocuments.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No documents uploaded yet.</p>
                                ) : (
                                    stats.recentDocuments.slice(0, 4).map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/20">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 truncate w-32">{doc.filename}</p>
                                                    <p className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://etherscan.io/tx/${doc.tx_hash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload Tool or Request Form */}
                <div className="space-y-8">
                    {instStatus === 'approved' ? (
                        <div className="glass p-8 rounded-3xl shadow-xl border-t-8 border-indigo-600 sticky top-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-800">Anchor New Document</h2>
                                <p className="text-slate-500 text-sm mt-1">Immutable blockchain registration</p>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="group relative border-2 border-dashed border-slate-200 p-10 text-center rounded-3xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                                    <input
                                        type="file"
                                        onChange={e => setFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">
                                                {file ? file.name : "Choose a file"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, DOCX or Images up to 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all disabled:grayscale disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Anchoring to Network...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-5 h-5" />
                                            Anchor to Blockchain
                                        </span>
                                    )}
                                </button>
                            </form>

                            {message && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-6 p-4 rounded-2xl text-sm border ${message.includes('Success')
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                : 'bg-red-50 border-red-100 text-red-700'
                                            }`}
                                    >
                                        <div className="flex gap-2">
                                            {message.includes('Success') ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                            <p className="break-all font-medium leading-relaxed">{message}</p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> SHA-256
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <LayoutDashboard className="w-3 h-3" /> IPFS V2
                                    </span>
                                    <span className="flex items-center gap-1 text-indigo-500">
                                        ● MAINNET READY
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-8 rounded-3xl shadow-xl border-t-8 border-amber-500 sticky top-8">
                            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
                            <p className="text-slate-500 mb-8">Your account is currently inactive. Please register your institution to begin.</p>

                            {instStatus === 'pending' ? (
                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                                    <div className="flex gap-3 text-amber-800">
                                        <History className="w-6 h-6 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">Approval Pending</p>
                                            <p className="text-sm mt-1">Our administrators are reviewing "{instRequest?.institution_name}".</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleRequestSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Institution Name</label>
                                        <input
                                            className="w-full p-4 glass rounded-2xl focus:ring-2 ring-indigo-500 outline-none"
                                            placeholder="e.g. Stanford University"
                                            value={requestForm.name}
                                            onChange={e => setRequestForm({ ...requestForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Official Address</label>
                                        <textarea
                                            className="w-full p-4 glass rounded-2xl focus:ring-2 ring-indigo-500 outline-none h-32"
                                            placeholder="Enter full physical/web address"
                                            value={requestForm.address}
                                            onChange={e => setRequestForm({ ...requestForm, address: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Submit for Review
                                    </button>
                                </form>
                            )}

                            {instStatus === 'rejected' && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
                                    <div className="flex gap-2 font-bold mb-1">
                                        <AlertCircle className="w-4 h-4" /> REJECTED
                                    </div>
                                    <p>{instRequest?.rejection_reason}</p>
                                    <button onClick={() => setInstStatus('none')} className="mt-3 font-bold underline">Re-submit details</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploaderDashboard;
