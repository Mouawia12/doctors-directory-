<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tree = [
            'الصحة النفسية' => [
                'العلاج السلوكي المعرفي (CBT)',
                'العلاج الجدلي السلوكي (DBT)',
                'العلاج الدوائي والمتابعة',
            ],
            'العلاج الأسري والزوجي' => [
                'العلاج الأسري المنظومي',
                'الإرشاد الزوجي',
            ],
            'الصحة النفسية للأطفال والمراهقين' => [
                'التدخل المبكر',
                'اضطرابات النمو والتعلم',
            ],
            'التأهيل وعلاج الإدمان' => [
                'الوقاية من الانتكاس',
                'التأهيل السلوكي للإدمان',
            ],
            'الدعم العاطفي واليقظة' => [
                'التأمل واليقظة الذهنية',
                'إدارة الغضب والضغوط',
            ],
        ];

        foreach ($tree as $parentName => $children) {
            /** @var Category $parent */
            $parent = Category::firstOrCreate(
                ['name' => $parentName],
                ['slug' => $this->slugify($parentName)]
            );

            foreach ($children as $childName) {
                Category::firstOrCreate(
                    ['name' => $childName, 'parent_id' => $parent->id],
                    ['slug' => $this->slugify($childName)]
                );
            }
        }
    }

    protected function slugify(string $value): string
    {
        $slug = Str::slug($value, '-', 'ar') ?: Str::slug(Str::ascii($value, 'ar'));

        return $slug !== '' ? $slug : Str::random(8);
    }
}
