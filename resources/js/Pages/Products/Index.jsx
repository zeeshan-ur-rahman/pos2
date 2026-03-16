import { Link, useForm } from '@inertiajs/react';

export default function Index({ products }) {

    const { delete: destroy } = useForm();

    const deleteProduct = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            destroy(`/products/${id}`);
        }
    };
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href="/add-product" className="bg-blue-500 text-white px-4 py-2">
                    Add Product
                </Link>
            </div>

            <table className="w-full border-collapse border">
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
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="border p-2">{product.name}</td>
                            <td className="border p-2">{product.generic_name}</td>
                            <td className="border p-2">{product.category}</td>
                            <td className="border p-2">
                                {product.batches.reduce((sum, b) => sum + b.stock_quantity, 0)}
                            </td>
                            <td className="border p-2">
                                {product.batches.length > 0
                                    ? product.batches[0].selling_price
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
                    {products.length === 0 && (
                        <tr>
                            <td colSpan="12" className="border p-4 text-center text-gray-500">
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
