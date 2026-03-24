<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AuditLogIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'log_type' => ['nullable', 'string', 'max:50'],
            'operator_id' => ['nullable', 'integer', 'min:1'],
            'object_type' => ['nullable', 'string', 'max:50'],
            'object_id' => ['nullable', 'string', 'max:64'],
            'start_time' => ['nullable', 'date'],
            'end_time' => ['nullable', 'date'],
            'project_id' => ['nullable', 'string', 'max:64'],
        ];
    }
}
