<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')->whereNull('parent_id')->get();

        return $this->respond([
            'items' => CategoryResource::collection($categories)->resolve(),
        ]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return $this->respond(new CategoryResource($category->load('children')), __('تم إنشاء التصنيف'), 201);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return $this->respond(new CategoryResource($category->fresh('children')), __('تم تحديث التصنيف'));
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->doctors()->detach();
        $category->delete();

        return $this->respond(null, __('تم حذف التصنيف'));
    }
}
