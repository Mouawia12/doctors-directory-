<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

trait RespondsWithJson
{
    protected function respond(mixed $data = null, ?string $message = null, mixed $errors = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    protected function respondWithPagination(LengthAwarePaginator $paginator, array $items, ?string $message = null): JsonResponse
    {
        return $this->respond([
            'items' => $items,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], $message);
    }

    protected function respondWithError(array|string|null $errors, ?string $message = null, int $status = 422): JsonResponse
    {
        return $this->respond(null, $message, $errors, $status);
    }
}
