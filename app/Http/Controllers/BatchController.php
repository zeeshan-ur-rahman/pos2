<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
           'batch_number' => 'required',
            'expiry_date' => 'required|date',
            'buying_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $validated['product_id'] = $product->id;

        $validated['stock_quantity'] = $validated['stock_quantity'] * $product->totalTabletsPerBox();

        Batch::create($validated);
        return back()->with('success', 'Batch Added Successfully');
    }
}
