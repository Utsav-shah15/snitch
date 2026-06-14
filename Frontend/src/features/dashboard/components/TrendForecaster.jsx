import React, { useEffect } from 'react';
import useTrends from '../../ai/hooks/useTrends';

const STATUS_STYLES = {
    rising: { bg: 'bg-emerald-950/30', border: 'border-emerald-800/30', text: 'text-emerald-400', icon: '📈' },
    stable: { bg: 'bg-blue-950/30', border: 'border-blue-800/30', text: 'text-blue-400', icon: '➡️' },
    declining: { bg: 'bg-red-950/30', border: 'border-red-800/30', text: 'text-red-400', icon: '📉' },
};

const CONFIDENCE_DOTS = {
    high: 'bg-emerald-400',
    medium: 'bg-yellow-400',
    low: 'bg-neutral-500',
};

const TrendForecaster = () => {
    const { trends, prediction, tip, loading, error, fetchTrends } = useTrends();

    useEffect(() => {
        fetchTrends();
    }, [fetchTrends]);

    if (loading) {
        return (
            <div className="bg-[#141414] border border-neutral-900 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-violet-400/60 uppercase tracking-widest font-bold">AI analyzing trends...</span>
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-neutral-800/50 animate-pulse rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || trends.length === 0) return null;

    return (
        <div className="bg-[#141414] border border-neutral-900 p-6">
            <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">AI Trend Forecaster</h3>
            </div>
            <p className="text-[10px] text-neutral-600 mb-5">Powered by AI analysis of your marketplace data</p>

            {/* Trend Cards */}
            <div className="space-y-3 mb-6">
                {(trends || []).map((trend, i) => {
                    const style = STATUS_STYLES[trend.status] || STATUS_STYLES.stable;
                    return (
                        <div key={i} className={`${style.bg} border ${style.border} p-4 rounded-lg`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm">{style.icon}</span>
                                        <h4 className="text-xs font-semibold text-white">{trend.title}</h4>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed">{trend.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${style.text}`}>
                                        {trend.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${CONFIDENCE_DOTS[trend.confidence] || CONFIDENCE_DOTS.low}`} />
                                        <span className="text-[9px] text-neutral-600">{trend.confidence}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Prediction */}
            {prediction && (
                <div className="bg-violet-950/20 border border-violet-800/20 p-4 rounded-lg mb-4">
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">🔮 Next Month Prediction</p>
                    <p className="text-xs text-neutral-300 leading-relaxed">{prediction}</p>
                </div>
            )}

            {/* Seller Tip */}
            {tip && (
                <div className="flex items-start gap-2 bg-[#1c1c1c] border border-neutral-800 p-3 rounded-lg">
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">{tip}</p>
                </div>
            )}
        </div>
    );
};

export default TrendForecaster;
