<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'user_type' => ['required', 'integer', 'in:1,2'],
            'org_id' => ['required', 'string', 'max:64'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['integer', Rule::exists('roles', 'id')],
            'project_ids' => ['nullable', 'array'],
            'project_ids.*' => ['string', 'max:64'],
            'status' => ['nullable', 'integer', 'in:1,2,3,4'],
            'remark' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
