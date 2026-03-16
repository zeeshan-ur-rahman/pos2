<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'category',
        'company',
        'barcode',
    ];

    public function batches()
    {
        return $this->hasMany(Batch::class)
            ->where('stock_quantity', '>', 0)
            ->orderBy('expiry_date', 'asc');
    }
}
