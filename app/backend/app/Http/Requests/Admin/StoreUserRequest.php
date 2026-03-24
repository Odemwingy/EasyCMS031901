<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'name' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->letters()->numbers()],
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
