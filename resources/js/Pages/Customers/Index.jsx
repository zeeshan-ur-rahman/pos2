import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ customers, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (value) => {
        setSearch(value);
        if (value.length >= 2 || value.length === 0) {
            router.get(route('customers.index'), { search: value || undefined, with_balance: filters.with_balance || undefined }, {
                preserveState: true, replace: true,
            });
        }
    };

    const toggleBalanceFilter = () => {
        router.get(route('customers.index'), {
            search: filters.search || undefined,
            with_balance: filters.with_balance ? undefined : '1',
        }, { preserveState: true, replace: true });
    };

    const totalBalance = customers.data.reduce((sum, c) => sum + parseFloat(c.balance), 0);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Customers</h2>}>
            <Head title="Customers" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
                                className="max-w-md flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Search by name or phone..." />
                            <button onClick={toggleBalanceFilter}
                                className={`px-3 py-2 text-sm rounded-lg border ${filters.with_balance ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                {filters.with_balance ? 'Showing Due Only' : 'Show Due Only'}
                            </button>
                        </div>
                        <Link href={route('customers.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                            + Add Customer
                        </Link>
                    </div>

                    {totalBalance > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-red-700 font-medium">Total Outstanding (this page)</span>
                            <span className="text-lg font-bold text-red-700">Rs {totalBalance.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Address</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Balance</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.data.length === 0 ? (
                                    <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-gray-400">No customers found</td></tr>
                                ) : customers.data.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-3.5">
                                            <Link href={route('customers.show', customer.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{customer.phone || '-'}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 truncate max-w-[200px]">{customer.address || '-'}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className={`text-sm font-semibold ${parseFloat(customer.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                Rs {parseFloat(customer.balance).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-2">
                                            <Link href={route('customers.show', customer.id)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</Link>
                                            <Link href={route('customers.edit', customer.id)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {customers.links && customers.last_page > 1 && (
                        <div className="flex justify-center gap-1">
                            {customers.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'}
                                    className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-white text-gray-600 hover:bg-gray-50 border' : 'text-gray-300'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
