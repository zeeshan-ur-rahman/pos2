import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ customer, sales }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState('ledger');

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        description: '',
    });

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('customers.payment', customer.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{customer.name}</h2>}>
            <Head title={customer.name} />
            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                    )}

                    {/* Customer Info + Payment Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        {customer.phone && <p>Phone: {customer.phone}</p>}
                                        {customer.address && <p>Address: {customer.address}</p>}
                                        {customer.notes && <p className="text-gray-400">Notes: {customer.notes}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Balance Due</p>
                                    <p className={`text-2xl font-bold ${parseFloat(customer.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Rs {parseFloat(customer.balance).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Link href={route('customers.edit', customer.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">Edit</Link>
                                <Link href={route('customers.index')} className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">Back to List</Link>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Record Payment</h4>
                            <form onSubmit={submitPayment} className="space-y-3">
                                <div>
                                    <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                        className="w-full border rounded-lg p-2.5 text-lg font-semibold focus:ring-2 focus:ring-green-400 outline-none"
                                        placeholder="Amount (Rs)" min="0.01" step="0.01" />
                                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                </div>
                                <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                                    placeholder="Description (optional)" />
                                {parseFloat(customer.balance) > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {[Math.ceil(parseFloat(customer.balance))].concat(
                                            [100, 500, 1000].filter(v => v < parseFloat(customer.balance))
                                        ).map(amt => (
                                            <button key={amt} type="button" onClick={() => setData('amount', amt.toString())}
                                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                                                Rs {amt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button type="submit" disabled={processing || !data.amount}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg">
                                    Receive Payment
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-200">
                        <button onClick={() => setTab('ledger')}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === 'ledger' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Payment Ledger ({customer.payments?.length || 0})
                        </button>
                        <button onClick={() => setTab('purchases')}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === 'purchases' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Purchase History ({sales.total || 0})
                        </button>
                    </div>

                    {/* Ledger Tab */}
                    {tab === 'ledger' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Description</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Balance</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(!customer.payments || customer.payments.length === 0) ? (
                                        <tr><td colSpan="6" className="px-5 py-8 text-center text-sm text-gray-400">No transactions yet</td></tr>
                                    ) : customer.payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                                    p.type === 'payment' ? 'bg-green-50 text-green-700' :
                                                    p.type === 'sale_credit' ? 'bg-red-50 text-red-700' :
                                                    'bg-gray-50 text-gray-700'
                                                }`}>
                                                    {p.type === 'sale_credit' ? 'Credit Sale' : p.type === 'payment' ? 'Payment' : 'Adjustment'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {p.description}
                                                {p.sale && (
                                                    <Link href={route('pos.show', p.sale.id)} className="text-blue-600 hover:text-blue-800 ml-1">
                                                        #{p.sale.invoice_number}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className={`px-5 py-3 text-right text-sm font-semibold ${parseFloat(p.amount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {parseFloat(p.amount) > 0 ? '+' : ''}Rs {Math.abs(parseFloat(p.amount)).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-3 text-right text-sm font-medium text-gray-700">
                                                Rs {parseFloat(p.running_balance).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-500">{p.recorder?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Purchases Tab */}
                    {tab === 'purchases' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Invoice</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Items</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Payment</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Total</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sales.data.length === 0 ? (
                                        <tr><td colSpan="6" className="px-5 py-8 text-center text-sm text-gray-400">No purchases yet</td></tr>
                                    ) : sales.data.map(sale => (
                                        <tr key={sale.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3">
                                                <Link href={route('pos.show', sale.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                    {sale.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {new Date(sale.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3 text-center text-sm text-gray-600">{sale.items?.length || 0}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                                    sale.payment_method === 'credit' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                }`}>
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-sm font-medium text-gray-800">Rs {parseFloat(sale.total_amount).toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right text-sm font-semibold text-red-600">
                                                {parseFloat(sale.due_amount) > 0 ? `Rs ${parseFloat(sale.due_amount).toFixed(2)}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
