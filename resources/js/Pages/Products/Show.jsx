import { Link } from "@inertiajs/react";

export default function Show({ product }) {
    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                {product.name}
            </h1>

            <div className="mb-4">
                <p><b>Generic:</b> {product.generic_name}</p>
                <p><b>Category:</b> {product.category}</p>
                <p><b>Company:</b> {product.company}</p>
                <p><b>Barcode:</b> {product.barcode || "-"}</p>
            </div>

            <h2 className="text-xl font-semibold mb-2">Batches</h2>

            <table className="w-full border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2">Batch</th>
                    <th className="border p-2">Expiry</th>
                    <th className="border p-2">Stock</th>
                    <th className="border p-2">Price</th>
                </tr>
                </thead>

                <tbody>
                {product.batches.map((batch) => (
                    <tr key={batch.id}>
                        <td className="border p-2">{batch.batch_number}</td>
                        <td className="border p-2">{batch.expiry_date}</td>
                        <td className="border p-2">{batch.stock_quantity}</td>
                        <td className="border p-2">{batch.selling_price}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Link
                href="/products"
                className="inline-block mt-4 bg-gray-500 text-white px-4 py-2"
            >
                Back
            </Link>

        </div>
    );
}
