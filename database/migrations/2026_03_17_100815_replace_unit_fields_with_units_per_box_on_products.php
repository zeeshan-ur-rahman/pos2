<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['tablets_per_strip', 'strips_per_box']);
            $table->unsignedInteger('units_per_box')->nullable()->after('barcode');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('units_per_box');
            $table->unsignedInteger('tablets_per_strip')->nullable()->after('barcode');
            $table->unsignedInteger('strips_per_box')->nullable()->after('tablets_per_strip');
        });
    }
};
