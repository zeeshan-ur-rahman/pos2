<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_type' => 'required|in:box,strip,tablet',
            'items.*.unit_quantity' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,easypaisa,bank_transfer',
            'discount_amount' => 'nullable|numeric|min:0',
            'amount_received' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
