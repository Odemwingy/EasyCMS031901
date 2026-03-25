<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $menuId = (int) $this->route('id');

        return [
            'parent_id' => ['nullable', 'integer', 'different:id', Rule::exists('menus', 'id')],
            'type' => ['nullable', 'integer', 'in:1,2,3'],
            'name' => ['required', 'string', 'max:50'],
            'permission' => ['nullable', 'string', 'max:100', Rule::unique('menus', 'permission')->ignore($menuId)],
            'route_path' => ['nullable', 'string', 'max:200'],
            'component' => ['nullable', 'string', 'max:200'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'status' => ['required', 'integer', 'in:1,2'],
            'remark' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
