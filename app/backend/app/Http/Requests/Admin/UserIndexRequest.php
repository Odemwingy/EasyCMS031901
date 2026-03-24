<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'size' => ['nullable', 'integer', 'in:20,50,100'],
            'keyword' => ['nullable', 'string', 'max:50'],
            'org_id' => ['nullable', 'string', 'max:64'],
            'role_id' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'integer', 'in:1,2,3,4'],
            'user_type' => ['nullable', 'integer', 'in:1,2'],
        ];
    }
}
