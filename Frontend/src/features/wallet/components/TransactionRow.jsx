import React from 'react';

const TYPE_STYLES = {
    sale: 'text-emerald-400',
    royalty: 'text-blue-400',
    withdrawal: 'text-red-400',
    refund: 'text-yellow-400',
};
const TYPE_SIGN = { sale: '+', royalty: '+', withdrawal: '-', refund: '+' };

/**
 * TransactionRow — Renders a single wallet transaction.
 *
 * @param {{ transaction: object }} props
 */
const TransactionRow = ({ transaction: tx }) => {
    return (
        <div className="flex items-center justify-between bg-[#141414] border border-neutral-900 px-4 py-3">
            <div>
                <p className="text-xs text-white">{tx.description || tx.type}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${TYPE_STYLES[tx.type]}`}>
                    {TYPE_SIGN[tx.type]}₹{tx.amount?.toLocaleString()}
                </p>
                <p className="text-[9px] text-neutral-600 uppercase">{tx.status}</p>
            </div>
        </div>
    );
};

export default TransactionRow;
