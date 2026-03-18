import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Show({ product }) {
    const upb = product.units_per_box && product.units_per_box > 1 ? product.units_per_box : 0;
    const tps = product.tablets_per_strip || 0;
    const totalPerBox = upb > 0 && tps > 0 ? upb * tps : upb;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{product.name}</h2>}
        >
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-8">

                        <div className="mb-6">
                            <p><b>Generic:</b> {product.generic_name}</p>
                            <p><b>Category:</b> {product.category}</p>
                            <p><b>Company:</b> {product.company}</p>
                            <p><b>Barcode:</b> {product.barcode || "-"}</p>
                            {upb > 0 && <p><b>Strips per Box:</b> {upb}</p>}
                            {tps > 0 && <p><b>Tablets per Strip:</b> {tps}</p>}
                            {totalPerBox > 0 && <p><b>Total Tablets per Box:</b> {totalPerBox}</p>}
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
                            {product.batches.map((batch) => {
                                const tpb = totalPerBox || 1;
                                const boxes = totalPerBox > 0 ? Math.floor(batch.stock_quantity / tpb) : 0;
                                const remaining = totalPerBox > 0 ? batch.stock_quantity % tpb : batch.stock_quantity;
                                const strips = tps > 0 ? Math.floor(remaining / tps) : 0;
                                const tablets = tps > 0 ? remaining % tps : remaining;
                                let stockParts = [];
                                if (boxes > 0) stockParts.push(`${boxes} box${boxes !== 1 ? 'es' : ''}`);
                                if (strips > 0) stockParts.push(`${strips} strip${strips !== 1 ? 's' : ''}`);
                                if (tablets > 0) stockParts.push(`${tablets} tablet${tablets !== 1 ? 's' : ''}`);
                                return (
                                    <tr key={batch.id}>
                                        <td className="border p-2">{batch.batch_number}</td>
                                        <td className="border p-2">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                        <td className="border p-2">
                                            {stockParts.length > 0 ? stockParts.join(' + ') : batch.stock_quantity}
                                        </td>
                                        <td className="border p-2">{batch.selling_price}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <Link href="/products" className="inline-block mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg">
                            Back
                        </Link>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
