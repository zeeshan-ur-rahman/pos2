<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function processSale(array $cartItems, array $saleData, User $cashier): Sale
    {
        return DB::transaction(function () use ($cartItems, $saleData, $cashier) {
            $saleItemsData = [];
            $subtotal = 0;

            foreach ($cartItems as $item) {
                $allocated = $this->allocateStock($item['product_id'], $item['quantity']);

                $unitType = $item['unit_type'] ?? 'strip';
                $unitQuantity = $item['unit_quantity'] ?? $item['quantity'];
                $isFirstAlloc = true;

                foreach ($allocated as $alloc) {
                    $itemDiscount = $item['discount'] ?? 0;
                    if (count($allocated) > 1) {
                        $itemDiscount = ($item['discount'] ?? 0) * ($alloc['quantity'] / $item['quantity']);
                    }
                    $lineTotal = ($alloc['selling_price'] * $alloc['quantity']) - $itemDiscount;
                    $subtotal += $lineTotal;

                    $saleItemsData[] = [
                        'product_id' => $item['product_id'],
                        'batch_id' => $alloc['batch_id'],
                        'unit_type' => $unitType,
                        'unit_quantity' => $isFirstAlloc ? $unitQuantity : 0,
                        'quantity' => $alloc['quantity'],
                        'unit_price' => $alloc['selling_price'],
                        'buying_price' => $alloc['buying_price'],
                        'discount' => $itemDiscount,
                        'total' => $lineTotal,
                    ];
                    $isFirstAlloc = false;
                }
            }

            $discountAmount = $saleData['discount_amount'] ?? 0;
            $taxAmount = $saleData['tax_amount'] ?? 0;
            $totalAmount = $subtotal - $discountAmount + $taxAmount;
            $amountReceived = $saleData['amount_received'] ?? $totalAmount;

            $sale = Sale::create([
                'invoice_number' => Sale::generateInvoiceNumber(),
                'user_id' => $cashier->id,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'amount_received' => $amountReceived,
                'change_amount' => max(0, $amountReceived - $totalAmount),
                'payment_method' => $saleData['payment_method'] ?? 'cash',
                'status' => 'completed',
                'notes' => $saleData['notes'] ?? null,
            ]);

            foreach ($saleItemsData as $itemData) {
                $sale->items()->create($itemData);
            }

            return $sale->load('items.product', 'items.batch');
        });
    }

    private function allocateStock(int $productId, int $requestedQty): array
    {
        $product = Product::find($productId);

        $batches = Batch::where('product_id', $productId)
            ->where('stock_quantity', '>', 0)
            ->where('expiry_date', '>', now())
            ->orderBy('expiry_date', 'asc')
            ->lockForUpdate()
            ->get();

        $totalAvailable = $batches->sum('stock_quantity');
        if ($totalAvailable < $requestedQty) {
            throw new \Exception(
                "Insufficient stock for {$product->name}. Requested: {$requestedQty}, Available: {$totalAvailable}"
            );
        }

        $allocated = [];
        $remaining = $requestedQty;

        foreach ($batches as $batch) {
            if ($remaining <= 0) break;

            $take = min($remaining, $batch->stock_quantity);
            $batch->decrement('stock_quantity', $take);
            $remaining -= $take;

            $allocated[] = [
                'batch_id' => $batch->id,
                'quantity' => $take,
                'selling_price' => $product->tabletPrice($batch->selling_price),
                'buying_price' => $product->tabletPrice($batch->buying_price),
            ];
        }

        return $allocated;
    }
}
