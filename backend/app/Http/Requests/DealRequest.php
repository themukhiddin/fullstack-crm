<?php

namespace App\Http\Requests;

use App\Enums\DealStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DealRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'stage' => ['nullable', Rule::enum(DealStage::class)],
            'closed_at' => ['nullable', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
        ];
    }
}
