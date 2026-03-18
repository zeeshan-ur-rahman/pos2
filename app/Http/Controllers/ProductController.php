<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Batch;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('availableBatches')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate(20)->withQueryString();

        return \Inertia\Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'generic_name' => 'required',
            'category' => 'required',
            'company' => 'required',
            'barcode' => 'nullable|unique:products,barcode',
            'units_per_box' => 'nullable|integer|min:1',
            'tablets_per_strip' => 'nullable|integer|min:1',

            'batch_number' => 'required',
            'expiry_date' => 'required|date',
            'buying_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $product = Product::create([
                'name' => $validated['name'],
                'generic_name' => $validated['generic_name'],
                'barcode' => $validated['barcode'] ?? null,
                'category' => $validated['category'],
                'company' => $validated['company'],
                'units_per_box' => $validated['units_per_box'] ?? null,
                'tablets_per_strip' => $validated['tablets_per_strip'] ?? null,
            ]);

            $stockInTablets = $validated['stock_quantity'] * $product->totalTabletsPerBox();

            Batch::create([
                'product_id' => $product->id,
                'batch_number' => $validated['batch_number'],
                'expiry_date' => $validated['expiry_date'],
                'buying_price' => $validated['buying_price'],
                'selling_price' => $validated['selling_price'],
                'stock_quantity' => $stockInTablets,
            ]);
        });

        return redirect('/products')->with('success', 'Product Added Successfully');
    }

    public function edit(Product $product)
    {
        $product->load('batches');

        return \Inertia\Inertia::render('Products/Edit', [
           'product' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required',
            'generic_name' => 'required',
            'category' => 'required',
            'company' => 'required',
            'barcode' => 'nullable|unique:products,barcode,' . $product->id,
            'units_per_box' => 'nullable|integer|min:1',
            'tablets_per_strip' => 'nullable|integer|min:1',
            'batches' => 'nullable|array',
            'batches.*.id' => 'required|exists:batches,id',
            'batches.*.batch_number' => 'required',
            'batches.*.expiry_date' => 'required|date',
            'batches.*.buying_price' => 'required|numeric|min:0',
            'batches.*.selling_price' => 'required|numeric|min:0',
            'batches.*.stock_quantity' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $product) {
            $product->update([
                'name' => $validated['name'],
                'generic_name' => $validated['generic_name'],
                'category' => $validated['category'],
                'company' => $validated['company'],
                'barcode' => $validated['barcode'],
                'units_per_box' => $validated['units_per_box'] ?? null,
                'tablets_per_strip' => $validated['tablets_per_strip'] ?? null,
            ]);

            $totalPerBox = $product->totalTabletsPerBox();

            if (!empty($validated['batches'])) {
                foreach ($validated['batches'] as $batchData) {
                    Batch::where('id', $batchData['id'])
                        ->where('product_id', $product->id)
                        ->update([
                            'batch_number' => $batchData['batch_number'],
                            'expiry_date' => $batchData['expiry_date'],
                            'buying_price' => $batchData['buying_price'],
                            'selling_price' => $batchData['selling_price'],
                            'stock_quantity' => $batchData['stock_quantity'] * $totalPerBox,
                        ]);
                }
            }
        });

        return redirect('/products')->with('success', 'Product Updated Successfully');
    }

    public function show(Product $product)
    {
        $product->load('batches');

        return \Inertia\Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect('/products')->with('success', 'Product Deleted');
    }
}
