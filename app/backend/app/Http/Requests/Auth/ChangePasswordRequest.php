<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'old_password' => ['nullable', 'string', 'required_without:current_password'],
            'current_password' => ['nullable', 'string', 'required_without:old_password'],
            'new_password' => [
                'required',
                'string',
                'different:current_password',
                'different:old_password',
                Password::min(8)->mixedCase()->letters()->numbers(),
            ],
            'new_password_confirmation' => ['required', 'same:new_password'],
        ];
    }
}
