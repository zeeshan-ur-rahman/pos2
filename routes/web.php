<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SaleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/add-product', fn () => Inertia::render('Products/Create'));
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/{product}/edit', [ProductController::class, 'edit']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/batches', [BatchController::class, 'store']);

    // Customer Routes
    Route::resource('customers', CustomerController::class);
    Route::post('/customers/{customer}/payments', [CustomerController::class, 'recordPayment'])->name('customers.payment');
    Route::get('/api/customers/search', [CustomerController::class, 'search'])->name('customers.search');

    // POS Routes
    Route::get('/pos', [SaleController::class, 'index'])->name('pos.terminal');
    Route::get('/pos/search', [SaleController::class, 'searchProducts'])->name('pos.search');
    Route::post('/pos/sales', [SaleController::class, 'store'])->name('pos.store');
    Route::get('/pos/daily-summary', [SaleController::class, 'dailySummary'])->name('pos.daily-summary');
    Route::get('/pos/sales/history', [SaleController::class, 'history'])->name('pos.history');
    Route::get('/pos/sales/{sale}/receipt', [SaleController::class, 'receipt'])->name('pos.receipt');
    Route::get('/pos/sales/{sale}', [SaleController::class, 'show'])->name('pos.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
