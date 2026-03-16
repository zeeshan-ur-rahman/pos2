<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $fillable = [
        'product_id',
        'batch_number',
        'expiry_date',
        'buying_price',
        'selling_price',
        'stock_quantity'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
