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
        'units_per_box',
        'tablets_per_strip',
    ];

    public function stripPrice(float $boxPrice): float
    {
        if ($this->units_per_box && $this->units_per_box > 1) {
            return round($boxPrice / $this->units_per_box, 2);
        }
        return $boxPrice;
    }

    public function tabletPrice(float $boxPrice): float
    {
        $totalTablets = $this->totalTabletsPerBox();
        if ($totalTablets > 1) {
            return round($boxPrice / $totalTablets, 2);
        }
        return $boxPrice;
    }

    public function totalTabletsPerBox(): int
    {
        if ($this->units_per_box && $this->tablets_per_strip) {
            return $this->units_per_box * $this->tablets_per_strip;
        }
        return $this->units_per_box ?? 1;
    }

    public function pricePerUnit(float $boxPrice, string $unit): float
    {
        return match ($unit) {
            'box' => $boxPrice,
            'strip' => $this->stripPrice($boxPrice),
            'tablet' => $this->tabletPrice($boxPrice),
            default => $this->stripPrice($boxPrice),
        };
    }

    public function toSmallestUnit(int $qty, string $unit): int
    {
        return match ($unit) {
            'box' => $qty * $this->totalTabletsPerBox(),
            'strip' => $qty * ($this->tablets_per_strip ?? 1),
            'tablet' => $qty,
            default => $qty,
        };
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function availableBatches()
    {
        return $this->hasMany(Batch::class)
            ->where('stock_quantity', '>', 0)
            ->orderBy('expiry_date', 'asc');
    }

    public function sellableBatches()
    {
        return $this->hasMany(Batch::class)
            ->where('stock_quantity', '>', 0)
            ->where('expiry_date', '>', now())
            ->orderBy('expiry_date', 'asc');
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
