<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Batch;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $thirtyDaysFromNow = $now->copy()->addDays(30);

        $totalProducts = Product::count();

        $lowStockBatches = Batch::with('product')
            ->where('stock_quantity', '>', 0)
            ->where('stock_quantity', '<=', 10)
            ->orderBy('stock_quantity', 'asc')
            ->get();

        $expiredBatches = Batch::with('product')
            ->where('stock_quantity', '>', 0)
            ->where('expiry_date', '<', $now)
            ->orderBy('expiry_date', 'asc')
            ->get();

        $expiringSoonBatches = Batch::with('product')
            ->where('stock_quantity', '>', 0)
            ->where('expiry_date', '>=', $now)
            ->where('expiry_date', '<=', $thirtyDaysFromNow)
            ->orderBy('expiry_date', 'asc')
            ->get();

        $totalInventoryValue = Batch::where('stock_quantity', '>', 0)
            ->selectRaw('SUM(buying_price * stock_quantity) as total')
            ->value('total') ?? 0;

        $totalSellingValue = Batch::where('stock_quantity', '>', 0)
            ->selectRaw('SUM(selling_price * stock_quantity) as total')
            ->value('total') ?? 0;

        $totalStockQuantity = Batch::where('stock_quantity', '>', 0)
            ->sum('stock_quantity');

        $outOfStockProducts = Product::whereDoesntHave('batches', function ($q) {
            $q->where('stock_quantity', '>', 0);
        })->count();

        $recentProducts = Product::with('batches')
            ->latest()
            ->take(5)
            ->get();

        // Today's sales stats
        $todaySales = Sale::whereDate('created_at', today())->get();
        $todaySaleIds = $todaySales->pluck('id');
        $todayCost = SaleItem::whereIn('sale_id', $todaySaleIds)
            ->selectRaw('SUM(buying_price * quantity) as total')
            ->value('total') ?? 0;

        return \Inertia\Inertia::render('Dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalStockQuantity' => (int) $totalStockQuantity,
                'totalInventoryValue' => round($totalInventoryValue, 2),
                'totalSellingValue' => round($totalSellingValue, 2),
                'lowStockCount' => $lowStockBatches->count(),
                'expiredCount' => $expiredBatches->count(),
                'expiringSoonCount' => $expiringSoonBatches->count(),
                'outOfStockProducts' => $outOfStockProducts,
                'todaySalesCount' => $todaySales->count(),
                'todayRevenue' => round($todaySales->sum('total_amount'), 2),
                'todayProfit' => round($todaySales->sum('total_amount') - $todayCost, 2),
            ],
            'lowStockBatches' => $lowStockBatches,
            'expiredBatches' => $expiredBatches,
            'expiringSoonBatches' => $expiringSoonBatches,
            'recentProducts' => $recentProducts,
        ]);
    }
}
