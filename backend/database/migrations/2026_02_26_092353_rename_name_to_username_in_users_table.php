<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE users CHANGE name username VARCHAR(255) NOT NULL');
        } elseif ($driver === 'sqlite') {
            DB::statement('ALTER TABLE users RENAME COLUMN name TO username');
        } else {
            DB::statement('ALTER TABLE users RENAME COLUMN name TO username');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE users CHANGE username name VARCHAR(255) NOT NULL');
        } elseif ($driver === 'sqlite') {
            DB::statement('ALTER TABLE users RENAME COLUMN username TO name');
        } else {
            DB::statement('ALTER TABLE users RENAME COLUMN username TO name');
        }
    }
};
