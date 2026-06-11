import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useWallet from '../../wallet/hooks/useWallet';
import DashboardSidebar from '../components/DashboardSidebar';

const TYPE_STYLES = {
    sale: 'text-emerald-400',
    royalty: 'text-blue-400',
    withdrawal: 'text-red-400',
    refund: 'text-yellow-400',
};
const TYPE_SIGN = { sale: '+', royalty: '+', withdrawal: '-', refund: '+' };

const Wallet = () => {
    const { user } = useSelector((state) => state.auth);
    const { wallet, transactions, loading, fetchWallet, requestWithdrawal } = useWallet();
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const [message, setMessage] = useState(null);

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => { fetchWallet(); }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) return;
        setWithdrawing(true);
        setMessage(null);
        try {
            await requestWithdrawal(amount);
            setMessage({ type: 'success', text: 'Withdrawal request submitted!' });
            setWithdrawAmount('');
            fetchWallet();
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Withdrawal failed' });
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <DashboardSidebar />

            {/* Main */}
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-3xl">
                    <h1 className="font-serif text-2xl tracking-widest uppercase mb-8">Wallet & Payouts</h1>

                    {loading ? (
                        <div className="flex justify-center h-64 items-center">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Wallet Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: 'Total Earned', value: wallet?.totalEarned || 0, color: 'text-white' },
                                    { label: 'Pending', value: wallet?.pendingBalance || 0, color: 'text-yellow-400' },
                                    { label: 'Available', value: wallet?.availableBalance || 0, color: 'text-emerald-400' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="bg-[#141414] border border-neutral-900 p-5">
                                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
                                        <p className={`text-2xl font-bold ${color}`}>₹{value.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Withdraw */}
                            <div className="bg-[#141414] border border-neutral-900 p-6 mb-8">
                                <h2 className="text-xs font-semibold tracking-widest uppercase mb-4">Request Withdrawal</h2>
                                {message && (
                                    <div className={`mb-4 p-3 text-xs border ${message.type === 'success' ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30' : 'text-red-400 border-red-900/50 bg-red-950/30'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <form onSubmit={handleWithdraw} className="flex gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">₹</span>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={e => setWithdrawAmount(e.target.value)}
                                            placeholder="Amount"
                                            min="1"
                                            max={wallet?.availableBalance || 0}
                                            className="w-full bg-[#1c1c1c] border border-neutral-700 pl-8 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={withdrawing || !withdrawAmount}
                                        className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer">
                                        {withdrawing ? '...' : 'Withdraw'}
                                    </button>
                                </form>
                                <p className="text-[10px] text-neutral-600 mt-2">Withdrawals are processed within 3-5 business days. Available balance: ₹{(wallet?.availableBalance || 0).toLocaleString()}</p>
                            </div>

                            {/* Transactions */}
                            <div>
                                <h2 className="text-xs font-semibold tracking-widest uppercase mb-4">Recent Transactions</h2>
                                {transactions.length === 0 ? (
                                    <p className="text-neutral-600 text-sm text-center py-8 border border-dashed border-neutral-800">No transactions yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {transactions.map(tx => (
                                            <div key={tx._id} className="flex items-center justify-between bg-[#141414] border border-neutral-900 px-4 py-3">
                                                <div>
                                                    <p className="text-xs text-white">{tx.description || tx.type}</p>
                                                    <p className="text-[10px] text-neutral-600 mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${TYPE_STYLES[tx.type]}`}>
                                                        {TYPE_SIGN[tx.type]}₹{tx.amount?.toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] text-neutral-600 uppercase">{tx.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Wallet;
