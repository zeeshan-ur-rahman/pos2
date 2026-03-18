<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add tablets_per_strip to products
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('tablets_per_strip')->nullable()->after('units_per_box');
        });

        // Add 'tablet' to unit_type enum
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'strip', 'tablet') NOT NULL DEFAULT 'strip'");
    }

    public function down(): void
    {
        // Remove 'tablet' from enum
        DB::table('sale_items')->where('unit_type', 'tablet')->update(['unit_type' => 'strip']);
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'strip') NOT NULL DEFAULT 'strip'");

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('tablets_per_strip');
        });
    }
};
