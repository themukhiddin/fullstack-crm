<?php

namespace App\Http\Requests;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'client_id' => ['nullable', 'exists:clients,id'],
            'deal_id' => ['nullable', 'exists:deals,id'],
        ];
    }
}
