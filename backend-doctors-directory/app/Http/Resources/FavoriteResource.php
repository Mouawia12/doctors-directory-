<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Favorite */
class FavoriteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'doctor_id' => $this->doctor_id,
            'doctor' => $this->whenLoaded('doctor', fn () => new DoctorResource($this->doctor)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
