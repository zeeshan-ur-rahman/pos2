import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        generic_name: '',
        barcode: '',
        category: '',
        batch_number: '',
        expiry_date: '',
        buying_price: '',
        selling_price: '',
        stock_quantity: '',
        company: '',
        units_per_box: '',
        tablets_per_strip: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/products');
    };

    const upb = parseInt(data.units_per_box) || 0;
    const tps = parseInt(data.tablets_per_strip) || 0;
    const totalTablets = upb > 0 && tps > 0 ? upb * tps : upb;
    const sellingPrice = parseFloat(data.selling_price) || 0;
    const stock = parseInt(data.stock_quantity) || 0;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Add New Medicine</h2>}
        >
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-8">

                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Brand Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Generic Name</label>
                                <input type="text" value={data.generic_name} onChange={e => setData('generic_name', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.generic_name && <p className="text-red-500 text-sm">{errors.generic_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                                <input type="text" value={data.category} onChange={e => setData('category', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Batch Number</label>
                                <input type="text" value={data.batch_number} onChange={e => setData('batch_number', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.batch_number && <p className="text-red-500 text-sm">{errors.batch_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Expiry Date</label>
                                <input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.expiry_date && <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>}
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
                                {upb > 0 && tps > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">= {totalTablets} tablets per box</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Buying Price</label>
                                <input type="number" step="0.01" min="0" value={data.buying_price}
                                    onChange={e => setData('buying_price', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.buying_price && <p className="text-red-500 text-sm">{errors.buying_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Selling Price</label>
                                <input type="number" step="0.01" min="0" value={data.selling_price}
                                    onChange={e => setData('selling_price', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.selling_price && <p className="text-red-500 text-sm">{errors.selling_price}</p>}
                                {sellingPrice > 0 && upb > 1 && (
                                    <p className="text-xs text-green-600 font-medium mt-1">
                                        Per strip: Rs {(sellingPrice / upb).toFixed(2)}
                                        {tps > 1 && <> · Per tablet: Rs {(sellingPrice / totalTablets).toFixed(2)}</>}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Stock Quantity {upb > 1 && <span className="text-gray-400 font-normal">(boxes)</span>}
                                </label>
                                <input type="number" min="0" value={data.stock_quantity}
                                    onChange={e => setData('stock_quantity', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                    placeholder={upb > 1 ? 'e.g. 5 boxes' : ''} />
                                {errors.stock_quantity && <p className="text-red-500 text-sm">{errors.stock_quantity}</p>}
                                {stock > 0 && upb > 1 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        = {stock * upb} strips{tps > 1 && <> · {stock * totalTablets} tablets</>} total
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                                <input type="text" value={data.company} onChange={e => setData('company', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Barcode</label>
                                <input type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                                {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
                            </div>

                            <div className="col-span-full flex justify-end mt-4">
                                <button type="submit" disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
                                    Save Product
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
