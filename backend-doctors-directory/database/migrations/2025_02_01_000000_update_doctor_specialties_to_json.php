<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('ALTER TABLE doctors DROP INDEX doctors_specialty_index');

        DB::statement("UPDATE doctors SET specialty = JSON_ARRAY(specialty) WHERE specialty IS NOT NULL");
        DB::statement("UPDATE doctors SET sub_specialty = JSON_ARRAY(sub_specialty) WHERE sub_specialty IS NOT NULL AND sub_specialty <> ''");
        DB::statement("UPDATE doctors SET sub_specialty = JSON_ARRAY() WHERE sub_specialty IS NULL OR sub_specialty = ''");

        DB::statement('ALTER TABLE doctors MODIFY specialty JSON NOT NULL');
        DB::statement('ALTER TABLE doctors MODIFY sub_specialty JSON NULL');
    }

    public function down(): void
    {
        DB::statement("UPDATE doctors SET specialty = JSON_UNQUOTE(JSON_EXTRACT(specialty, '$[0]'))");
        DB::statement("UPDATE doctors SET sub_specialty = JSON_UNQUOTE(JSON_EXTRACT(sub_specialty, '$[0]'))");

        DB::statement('ALTER TABLE doctors MODIFY specialty VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE doctors MODIFY sub_specialty VARCHAR(255) NULL');
        DB::statement('ALTER TABLE doctors ADD INDEX doctors_specialty_index (specialty)');
    }
};
