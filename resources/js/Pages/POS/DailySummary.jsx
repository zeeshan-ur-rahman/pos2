import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function DailySummary({ summary, sales }) {
    const paymentMethods = summary.payment_breakdown || {};

    return (
        <AuthenticatedLayout>
            <Head title="Daily Summary" />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Daily Summary</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('pos.terminal')} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                New Sale
                            </Link>
                            <Link href={route('pos.history')} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">
                                Full History
                            </Link>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Total Sales" value={summary.total_sales} color="blue" />
                        <StatCard label="Revenue" value={`Rs ${formatNumber(summary.total_revenue)}`} color="emerald" />
                        <StatCard label="Profit" value={`Rs ${formatNumber(summary.total_profit)}`} color="violet" />
                        <StatCard label="Items Sold" value={summary.items_sold} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Payment Breakdown</h3>
                            {Object.keys(paymentMethods).length === 0 ? (
                                <p className="text-sm text-gray-400">No sales today</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(paymentMethods).map(([method, data]) => (
                                        <div key={method} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize text-sm font-medium text-gray-700">{method.replace('_', ' ')}</span>
                                                <span className="text-xs text-gray-400">({data.count} sales)</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">Rs {parseFloat(data.total).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {summary.total_discount > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Total Discounts</span>
                                        <span className="text-sm font-semibold text-red-600">-Rs {parseFloat(summary.total_discount).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Today's Sales List */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Today's Sales</h3>
                            </div>
                            {sales.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-gray-400">No sales recorded today</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Invoice</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Time</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Cashier</th>
                                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Amount</th>
                                                <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3 text-sm font-mono text-blue-600">{sale.invoice_number}</td>
                                                    <td className="px-5 py-3 text-sm text-gray-600">
                                                        {new Date(sale.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-gray-600">{sale.user.name}</td>
                                                    <td className="px-5 py-3 text-right text-sm font-semibold text-gray-800">
                                                        Rs {parseFloat(sale.total_amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <Link href={route('pos.show', sale.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, color }) {
    const colors = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        violet: 'bg-violet-500',
        amber: 'bg-amber-500',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
                <div className={`${colors[color]} text-white p-3 rounded-xl shrink-0`}>
                    <div className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
}

function formatNumber(num) {
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}
