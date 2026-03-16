import { useForm } from "@inertiajs/react";

export default function Edit({ product }) {

    const { data, setData, put, processing } = useForm({
        name: product.name,
        generic_name: product.generic_name,
        category: product.category,
        company: product.company,
        barcode: product.barcode
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/products/${product.id}`);
    };

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                Edit Product
            </h1>

            <form onSubmit={submit} className="grid gap-4 w-96">

                <input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="border p-2"
                />

                <input
                    value={data.generic_name}
                    onChange={e => setData('generic_name', e.target.value)}
                    className="border p-2"
                />

                <input
                    value={data.category}
                    onChange={e => setData('category', e.target.value)}
                    className="border p-2"
                />

                <input
                    value={data.company}
                    onChange={e => setData('company', e.target.value)}
                    className="border p-2"
                />

                <input
                    value={data.barcode || ''}
                    onChange={e => setData('barcode', e.target.value)}
                    className="border p-2"
                />

                <button
                    disabled={processing}
                    className="bg-blue-500 text-white p-2"
                >
                    Update
                </button>

            </form>
        </div>
    );
}
