<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function store(Request $request, Product $product){
        $validated = $request->validate([
           'batch_number' => 'required',
            'expiry_date'=> 'required|date',
            'buying_price' => 'required|numeric',
            'selling_price'=>'required|numeric',
            'stock_quantity' => 'required|numeric'
        ]);

        $validated['product_id'] = $product->id;

        Batch::create($validated);
        return back()->with('success','Batch Added Successfully');
    }
}
