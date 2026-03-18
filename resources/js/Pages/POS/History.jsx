import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function History({ sales, filters }) {
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    const applyFilters = () => {
        router.get(route('pos.history'), { from, to }, { preserveState: true });
    };

    const clearFilters = () => {
        setFrom('');
        setTo('');
        router.get(route('pos.history'));
    };

    const quickFilter = (period) => {
        const today = new Date();
        let fromDate = new Date();

        if (period === 'today') fromDate = today;
        else if (period === 'yesterday') { fromDate.setDate(today.getDate() - 1); today.setDate(today.getDate() - 1); }
        else if (period === 'week') fromDate.setDate(today.getDate() - 7);
        else if (period === 'month') fromDate.setMonth(today.getMonth() - 1);

        const fmt = (d) => d.toISOString().split('T')[0];
        router.get(route('pos.history'), { from: fmt(fromDate), to: fmt(today) }, { preserveState: true });
    };

    const paymentBadge = (method) => {
        const styles = {
            cash: 'bg-green-50 text-green-700',
            easypaisa: 'bg-emerald-50 text-emerald-700',
            bank_transfer: 'bg-blue-50 text-blue-700',
        };
        return styles[method] || 'bg-gray-50 text-gray-700';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sales History" />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
                        <div className="flex gap-2">
                            <Link href={route('pos.terminal')} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                New Sale
                            </Link>
                            <Link href={route('pos.daily-summary')} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">
                                Daily Summary
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex gap-2">
                                {['today', 'yesterday', 'week', 'month'].map(period => (
                                    <button key={period} onClick={() => quickFilter(period)}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 capitalize">
                                        {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : period}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-end gap-2 ml-auto">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">From</label>
                                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-md py-1.5 px-2" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">To</label>
                                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-md py-1.5 px-2" />
                                </div>
                                <button onClick={applyFilters} className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">Filter</button>
                                {(from || to) && (
                                    <button onClick={clearFilters} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">Clear</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {sales.data.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-400 text-sm">No sales found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80">
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Invoice</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Date & Time</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Items</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Payment</th>
                                            <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Total</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Cashier</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sales.data.map(sale => (
                                            <tr key={sale.id} className="hover:bg-gray-50/50">
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm font-mono font-medium text-blue-600">{sale.invoice_number}</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                                    {new Date(sale.created_at).toLocaleString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                                                        {sale.items.length}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${paymentBadge(sale.payment_method)}`}>
                                                        {sale.payment_method.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-800">
                                                    Rs {parseFloat(sale.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-600">{sale.user.name}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('pos.show', sale.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</Link>
                                                        <Link href={route('pos.receipt', sale.id)} className="text-gray-500 hover:text-gray-700 text-xs font-medium">Receipt</Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {sales.links && sales.links.length > 3 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Showing {sales.from} to {sales.to} of {sales.total} sales
                                </span>
                                <div className="flex gap-1">
                                    {sales.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-xs rounded-md ${
                                                link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveState
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
