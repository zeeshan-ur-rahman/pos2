<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BatchController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::get('/add-product', function () {
    return Inertia::render('Products/Create');
})->middleware(['auth']);

Route::post('/products/{product}/batches',[BatchController::class,'store'])->middleware(['auth']);

Route::get('/products', [ProductController::class,'index'])->middleware(['auth']);
Route::post('/products', [ProductController::class,'store'])->middleware(['auth']);
Route::get('/products/{product}/edit',[ProductController::class,'edit']);
Route::put('/products/{product}',[ProductController::class,'update']);
Route::delete('/products/{product}',[ProductController::class,'destroy']);
Route::get('/products/{product}',[ProductController::class,'show']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
