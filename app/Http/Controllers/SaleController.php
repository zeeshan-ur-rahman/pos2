<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService) {}

    public function index()
    {
        return Inertia::render('POS/Terminal');
    }

    public function searchProducts(Request $request)
    {
        $search = $request->input('q', '');

        if (strlen($search) < 1) {
            return response()->json([]);
        }

        $products = Product::with(['availableBatches' => function ($q) {
                $q->where('expiry_date', '>', now());
            }])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('barcode', $search);
            })
            ->whereHas('availableBatches', function ($q) {
                $q->where('expiry_date', '>', now());
            })
            ->limit(20)
            ->get()
            ->map(function ($product) {
                $batches = $product->availableBatches;
                $boxPrice = $batches->first()?->selling_price ?? 0;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'generic_name' => $product->generic_name,
                    'category' => $product->category,
                    'company' => $product->company,
                    'barcode' => $product->barcode,
                    'units_per_box' => $product->units_per_box,
                    'tablets_per_strip' => $product->tablets_per_strip,
                    'total_tablets' => $product->totalTabletsPerBox(),
                    'total_stock' => $batches->sum('stock_quantity'),
                    'box_price' => round($boxPrice, 2),
                    'strip_price' => $product->stripPrice($boxPrice),
                    'tablet_price' => $product->tabletPrice($boxPrice),
                ];
            });

        return response()->json($products);
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            $sale = $this->saleService->processSale(
                $request->validated()['items'],
                $request->validated(),
                $request->user()
            );

            return redirect()->route('pos.receipt', $sale)
                ->with('success', 'Sale completed successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function receipt(Sale $sale)
    {
        $sale->load('items.product', 'items.batch', 'user', 'customer');

        return Inertia::render('POS/Receipt', [
            'sale' => $sale,
        ]);
    }

    public function history(Request $request)
    {
        $query = Sale::with('user', 'items')
            ->latest();

        if ($date = $request->input('date')) {
            $query->whereDate('created_at', $date);
        }
        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        return Inertia::render('POS/History', [
            'sales' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('date', 'from', 'to'),
        ]);
    }

    public function show(Sale $sale)
    {
        $sale->load('items.product', 'items.batch', 'user', 'customer');

        return Inertia::render('POS/SaleDetail', [
            'sale' => $sale,
        ]);
    }

    public function dailySummary()
    {
        $today = now()->toDateString();
        $sales = Sale::whereDate('created_at', $today)->get();
        $saleIds = $sales->pluck('id');

        $totalCost = SaleItem::whereIn('sale_id', $saleIds)
            ->selectRaw('SUM(buying_price * quantity) as total')
            ->value('total') ?? 0;

        return Inertia::render('POS/DailySummary', [
            'summary' => [
                'date' => $today,
                'total_sales' => $sales->count(),
                'total_revenue' => $sales->sum('total_amount'),
                'total_discount' => $sales->sum('discount_amount'),
                'total_cost' => $totalCost,
                'total_profit' => $sales->sum('total_amount') - $totalCost,
                'payment_breakdown' => $sales->groupBy('payment_method')
                    ->map(fn ($group) => [
                        'count' => $group->count(),
                        'total' => $group->sum('total_amount'),
                    ]),
                'items_sold' => SaleItem::whereIn('sale_id', $saleIds)->sum('quantity'),
            ],
            'sales' => $sales->load('user'),
        ]);
    }
}
