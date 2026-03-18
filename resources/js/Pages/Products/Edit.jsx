import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit({ product }) {

    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        generic_name: product.generic_name,
        category: product.category,
        company: product.company,
        barcode: product.barcode,
        units_per_box: product.units_per_box || '',
        tablets_per_strip: product.tablets_per_strip || '',
        batches: product.batches.map(b => {
            const upb = product.units_per_box || 1;
            const tps = product.tablets_per_strip || 1;
            const totalPerBox = upb > 1 ? upb * tps : 1;
            return {
                id: b.id,
                batch_number: b.batch_number,
                expiry_date: b.expiry_date ? b.expiry_date.slice(0, 10) : '',
                buying_price: b.buying_price,
                selling_price: b.selling_price,
                stock_quantity: Math.floor(b.stock_quantity / totalPerBox),
            };
        }),
    });

    const updateBatch = (index, field, value) => {
        const updated = [...data.batches];
        updated[index] = { ...updated[index], [field]: value };
        setData('batches', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        put(`/products/${product.id}`);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Product</h2>}
        >
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-8">

                        <form onSubmit={submit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Brand Name</label>
                                    <input value={data.name} onChange={e => setData('name', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Generic Name</label>
                                    <input value={data.generic_name} onChange={e => setData('generic_name', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                    {errors.generic_name && <p className="text-red-500 text-sm">{errors.generic_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                                    <input value={data.category} onChange={e => setData('category', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                                    <input value={data.company} onChange={e => setData('company', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                    {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Barcode</label>
                                    <input value={data.barcode || ''} onChange={e => setData('barcode', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                    {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Strips per Box</label>
                                    <input type="number" min="1" value={data.units_per_box}
                                        onChange={e => setData('units_per_box', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        placeholder="e.g. 20" />
                                    {errors.units_per_box && <p className="text-red-500 text-sm">{errors.units_per_box}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Tablets per Strip</label>
                                    <input type="number" min="1" value={data.tablets_per_strip}
                                        onChange={e => setData('tablets_per_strip', e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        placeholder="e.g. 10" />
                                    {errors.tablets_per_strip && <p className="text-red-500 text-sm">{errors.tablets_per_strip}</p>}
                                </div>
                            </div>

                            {data.batches.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">Batches</h3>
                                    <div className="space-y-4">
                                        {data.batches.map((batch, index) => (
                                            <div key={batch.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Batch Number</label>
                                                        <input type="text" value={batch.batch_number}
                                                            onChange={e => updateBatch(index, 'batch_number', e.target.value)}
                                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                                                        <input type="date" value={batch.expiry_date}
                                                            onChange={e => updateBatch(index, 'expiry_date', e.target.value)}
                                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
                                                        <input type="number" min="0" value={batch.stock_quantity}
                                                            onChange={e => updateBatch(index, 'stock_quantity', e.target.value)}
                                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Buying Price</label>
                                                        <input type="number" step="0.01" min="0" value={batch.buying_price}
                                                            onChange={e => updateBatch(index, 'buying_price', e.target.value)}
                                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Selling Price</label>
                                                        <input type="number" step="0.01" min="0" value={batch.selling_price}
                                                            onChange={e => updateBatch(index, 'selling_price', e.target.value)}
                                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end mt-4">
                                <button disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
                                    Update
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
