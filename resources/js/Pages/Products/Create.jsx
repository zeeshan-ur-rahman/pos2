import { useForm } from "@inertiajs/react";

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
        company: ''
    });

    const submit = (e) => {
        e.preventDefault();

        // Convert expiry_date to YYYY-MM-DD
        const parts = data.expiry_date.split('-'); // ["DD","MM","YYYY"]
        if(parts.length === 3){
            data.expiry_date = `${parts[2]}-${parts[1]}-${parts[0]}`; // "YYYY-MM-DD"
        }

        post('/products');
    };

    return (

        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="bg-white shadow-lg rounded-xl w-full max-w-5xl p-8">

                <h1 className="text-3xl font-bold text-gray-700 mb-6 border-b pb-3">
                    Add New Medicine
                </h1>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    {/* Generic Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Generic Name
                        </label>
                        <input
                            type="text"
                            value={data.generic_name}
                            onChange={e => setData('generic_name', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Batch Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Batch Number
                        </label>
                        <input
                            type="text"
                            value={data.batch_number}
                            onChange={e => setData('batch_number', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={data.expiry_date}
                            onChange={e => {
                                let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
                                if (val.length > 5) val = val.slice(0,5) + '-' + val.slice(5,9);
                                setData('expiry_date', val);
                            }}
                            maxLength={10}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        {errors.expiry_date && <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>}
                    </div>

                    {/* Buying Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Buying Price
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.buying_price}
                            onChange={e => setData('buying_price', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Selling Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Selling Price
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.selling_price}
                            onChange={e => setData('selling_price', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Stock Quantity
                        </label>
                        <input
                            type="number"
                            value={data.stock_quantity}
                            onChange={e => setData('stock_quantity', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Company
                        </label>
                        <input
                            type="text"
                            value={data.company}
                            onChange={e => setData('company', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Barcode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Barcode
                        </label>
                        <input
                            type="text"
                            value={data.barcode}
                            onChange={e => setData('barcode', e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Button */}
                    <div className="col-span-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
                        >
                            Save Product
                        </button>
                    </div>

                </form>
            </div>

        </div>
    );
}
