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
        Schema::table('sale_items', function (Blueprint $table) {
            $table->enum('unit_type', ['box', 'tablet'])->default('tablet')->after('batch_id');
            $table->unsignedInteger('unit_quantity')->default(0)->after('unit_type');
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn(['unit_type', 'unit_quantity']);
        });
    }
};
