<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = (int) $this->route('id');

        return [
            'name' => ['required', 'string', 'max:50'],
            'code' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z][a-z0-9_]*$/',
                Rule::unique('roles', 'code')->ignore($roleId),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'integer', 'in:1,2'],
        ];
    }
}
