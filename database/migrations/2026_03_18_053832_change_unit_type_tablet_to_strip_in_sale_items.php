<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'tablet', 'strip') NOT NULL DEFAULT 'tablet'");
        DB::table('sale_items')->where('unit_type', 'tablet')->update(['unit_type' => 'strip']);
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'strip') NOT NULL DEFAULT 'strip'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'strip', 'tablet') NOT NULL DEFAULT 'strip'");
        DB::table('sale_items')->where('unit_type', 'strip')->update(['unit_type' => 'tablet']);
        DB::statement("ALTER TABLE sale_items MODIFY unit_type ENUM('box', 'tablet') NOT NULL DEFAULT 'tablet'");
    }
};
