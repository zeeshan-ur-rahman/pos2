import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function SaleDetail({ sale }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Sale ${sale.invoice_number}`} />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href={route('pos.history')} className="text-sm text-blue-600 hover:text-blue-800 mb-1 inline-block">&larr; Back to Sales</Link>
                            <h1 className="text-2xl font-bold text-gray-900">{sale.invoice_number}</h1>
                        </div>
                        <Link href={route('pos.receipt', sale.id)}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                            Print Receipt
                        </Link>
                    </div>

                    {/* Sale Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase">Date & Time</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {new Date(sale.created_at).toLocaleString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase">Cashier</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">{sale.user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase">Payment</p>
                                <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{sale.payment_method.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 mt-1">
                                    {sale.status}
                                </span>
                            </div>
                        </div>
                        {sale.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Notes</p>
                                <p className="text-sm text-gray-600 mt-1">{sale.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Sale Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Medicine</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Batch</th>
                                        <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Unit</th>
                                        <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Qty</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Unit Price</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Discount</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sale.items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                                                <p className="text-xs text-gray-400">{item.product.generic_name}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">
                                                {item.batch.batch_number}
                                                <p className="text-xs text-gray-400">Exp: {new Date(item.batch.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-sm text-gray-500 capitalize">{item.unit_type || 'strip'}</td>
                                            <td className="px-5 py-3.5 text-center text-sm font-medium text-gray-700">
                                                {item.unit_quantity > 0 ? item.unit_quantity : item.quantity}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-sm text-gray-600">Rs {parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td className="px-5 py-3.5 text-right text-sm text-red-500">
                                                {parseFloat(item.discount) > 0 ? `-Rs ${parseFloat(item.discount).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-800">Rs {parseFloat(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/50">
                            <div className="max-w-xs ml-auto space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-700">Rs {parseFloat(sale.subtotal).toFixed(2)}</span>
                                </div>
                                {parseFloat(sale.discount_amount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="text-red-600">-Rs {parseFloat(sale.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span>Rs {parseFloat(sale.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Received</span>
                                    <span className="text-gray-700">Rs {parseFloat(sale.amount_received).toFixed(2)}</span>
                                </div>
                                {parseFloat(sale.change_amount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Change</span>
                                        <span className="text-gray-700">Rs {parseFloat(sale.change_amount).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
