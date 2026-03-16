<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Batch;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('batches')->latest()->get();

        return \Inertia\Inertia::render('Products/Index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'generic_name' => 'required',
            'category' => 'required',
            'company' => 'required',
            'barcode' => 'nullable',

            'batch_number' => 'required',
            'expiry_date' => 'required|date',
            'buying_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'stock_quantity' => 'required|numeric',
        ]);

        // Create Product
        $product = Product::create([
            'name' => $validated['name'],
            'generic_name' => $validated['generic_name'],
            'barcode' => $validated['barcode'] ?? null,
            'category' => $validated['category'],
            'company' => $validated['company']
        ]);

        // Create Batch
        Batch::create([
            'product_id' => $product->id,
            'batch_number' => $validated['batch_number'],
            'expiry_date' => $validated['expiry_date'],
            'buying_price' => $validated['buying_price'],
            'selling_price' => $validated['selling_price'],
            'stock_quantity' => $validated['stock_quantity'],
        ]);

        return redirect('/products')->with('success','Product Added Successfully');
    }

    public function edit(Product $product){
        return \Inertia\Inertia::render('Products/Edit',[
           'product' => $product
        ]);
    }

    public function update(Request $request,Product $product){
        $validated = $request ->validate([
            'name' =>'required',
            'generic_name' =>'required',
            'category' => 'required',
            'company' => 'required',
            'barcode'=>'nullable'
        ]);

        $product->update($validated);
        return redirect('/products');
    }

    public function show(Product $product){
        $product->load('batches');

        return \Inertia\Inertia::render('Products/Show',[
            'product' =>$product
        ]);
    }

    public function destroy(Product $product){
        $product->delete();
        return redirect('/products')->with('success','Product Deleted');
    }


}
