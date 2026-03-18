import { Head, Link } from '@inertiajs/react';

export default function Receipt({ sale }) {
    const groupedItems = sale.items.reduce((acc, item) => {
        const existing = acc.find(i => i.product_id === item.product_id && i.unit_type === item.unit_type);
        if (existing) {
            existing.quantity += item.quantity;
            existing.unit_quantity = (existing.unit_quantity || 0) + (item.unit_quantity || 0);
            existing.total = parseFloat(existing.total) + parseFloat(item.total);
            existing.discount = parseFloat(existing.discount) + parseFloat(item.discount);
        } else {
            acc.push({ ...item, unit_quantity: item.unit_quantity || 0 });
        }
        return acc;
    }, []);

    return (
        <>
            <Head title={`Receipt - ${sale.invoice_number}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .receipt-container { box-shadow: none !important; border: none !important; max-width: 80mm !important; margin: 0 !important; padding: 10px !important; }
                }
            `}</style>

            {/* Action Buttons - hidden on print */}
            <div className="no-print bg-gray-100 py-4 px-4 flex items-center justify-center gap-3">
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>
                    Print Receipt
                </button>
                <Link
                    href={route('pos.terminal')}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    New Sale
                </Link>
                <Link
                    href={route('pos.history')}
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
                >
                    Sales History
                </Link>
            </div>

            {/* Receipt */}
            <div className="min-h-screen bg-gray-100 flex items-start justify-center py-6 print:bg-white print:py-0">
                <div className="receipt-container bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
                    {/* Header */}
                    <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Pharmacy POS</h1>
                        <p className="text-xs text-gray-500 mt-1">Your Health, Our Priority</p>
                        <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                            <p>Invoice: <span className="font-semibold text-gray-700">{sale.invoice_number}</span></p>
                            <p>Date: {new Date(sale.created_at).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}</p>
                            <p>Cashier: {sale.user.name}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <table className="w-full text-sm mb-4">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-xs font-semibold text-gray-500">Item</th>
                                <th className="text-center py-2 text-xs font-semibold text-gray-500">Qty</th>
                                <th className="text-right py-2 text-xs font-semibold text-gray-500">Price</th>
                                <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {groupedItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2">
                                        <p className="font-medium text-gray-800">{item.product.name}</p>
                                    </td>
                                    <td className="py-2 text-center text-gray-600">
                                        {item.unit_quantity > 0
                                            ? `${item.unit_quantity} ${item.unit_type}${item.unit_quantity > 1 ? (item.unit_type === 'box' ? 'es' : 's') : ''}`
                                            : `${item.quantity} strip${item.quantity > 1 ? 's' : ''}`}
                                    </td>
                                    <td className="py-2 text-right text-gray-600">Rs {parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="py-2 text-right font-medium text-gray-800">Rs {parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t border-dashed border-gray-300 pt-3 space-y-1.5">
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
                        {parseFloat(sale.tax_amount) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax</span>
                                <span className="text-gray-700">Rs {parseFloat(sale.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                            <span>Total</span>
                            <span>Rs {parseFloat(sale.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Paid ({sale.payment_method})</span>
                            <span className="text-gray-700">Rs {parseFloat(sale.amount_received).toFixed(2)}</span>
                        </div>
                        {parseFloat(sale.change_amount) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Change</span>
                                <span className="text-gray-700">Rs {parseFloat(sale.change_amount).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-dashed border-gray-300 mt-4 pt-4">
                        <p className="text-xs text-gray-500">Thank you for your purchase!</p>
                        <p className="text-xs text-gray-400 mt-1">Get well soon</p>
                    </div>
                </div>
            </div>
        </>
    );
}
