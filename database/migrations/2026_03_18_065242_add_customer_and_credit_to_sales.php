<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->decimal('due_amount', 12, 2)->default(0)->after('change_amount');
        });

        DB::statement("ALTER TABLE sales MODIFY payment_method ENUM('cash','easypaisa','bank_transfer','credit') DEFAULT 'cash'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE sales MODIFY payment_method ENUM('cash','easypaisa','bank_transfer') DEFAULT 'cash'");

        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['customer_id', 'due_amount']);
        });
    }
};
