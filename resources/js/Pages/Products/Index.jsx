import { Link, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from 'react';

export default function Index({ products, filters }) {

    const { flash } = usePage().props;
    const { delete: destroy } = useForm();
    const [search, setSearch] = useState(filters?.search || '');

    const deleteProduct = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            destroy(`/products/${id}`);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value.length === 0) {
            router.get('/products', {}, { preserveState: true });
        } else if (value.length >= 3) {
            router.get('/products', { search: value }, { preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Type at least 3 characters to search..."
                            className="border rounded-lg px-3 py-2 w-80 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                        />
                        <Link href="/add-product" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                            Add Product
                        </Link>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-green-100 border border-green-400 text-green-700 px-4 py-3">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-4 rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Name</th>
                                    <th className="border p-2 text-left">Generic Name</th>
                                    <th className="border p-2 text-left">Category</th>
                                    <th className="border p-2 text-left">Stock</th>
                                    <th className="border p-2 text-left">Price</th>
                                    <th className="border p-2 text-left">Company</th>
                                    <th className="border p-2 text-left">Barcode</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="border p-2">{product.name}</td>
                                        <td className="border p-2">{product.generic_name}</td>
                                        <td className="border p-2">{product.category}</td>
                                        <td className="border p-2">
                                            {(() => {
                                                const total = product.available_batches.reduce((sum, b) => sum + b.stock_quantity, 0);
                                                const upb = product.units_per_box && product.units_per_box > 1 ? product.units_per_box : 0;
                                                if (upb > 0) {
                                                    const boxes = Math.floor(total / upb);
                                                    const loose = total % upb;
                                                    return `${boxes} box${boxes !== 1 ? 'es' : ''}${loose > 0 ? ` + ${loose} tab` : ''}`;
                                                }
                                                return total;
                                            })()}
                                        </td>
                                        <td className="border p-2">
                                            {product.available_batches.length > 0
                                                ? `Rs ${product.available_batches[0].selling_price}`
                                                : '-'}
                                        </td>
                                        <td className="border p-2">{product.company}</td>
                                        <td className="border p-2">{product.barcode || '-'}</td>
                                        <td className="border p-2 flex gap-2 justify-center">

                                            <Link
                                                href={`/products/${product.id}`}
                                                className="bg-green-500 text-white px-2 py-1 rounded"
                                            >
                                                View
                                            </Link>

                                            <Link
                                                href={`/products/${product.id}/edit`}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                Delete
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="border p-4 text-center text-gray-500">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links.length > 3 && (
                        <div className="flex justify-center gap-1 mt-4">
                            {products.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded border text-sm ${
                                        link.active
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveState
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
