<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->input('with_balance')) {
            $query->where('balance', '>', 0);
        }

        return Inertia::render('Customers/Index', [
            'customers' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('search', 'with_balance'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        Customer::create($validated);

        return redirect()->route('customers.index')->with('success', 'Customer added successfully');
    }

    public function show(Customer $customer)
    {
        $customer->load(['payments.recorder', 'payments.sale']);

        $sales = $customer->sales()
            ->with('user', 'items')
            ->latest()
            ->paginate(10, ['*'], 'sales_page');

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'sales' => $sales,
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone,' . $customer->id,
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.show', $customer)->with('success', 'Customer updated');
    }

    public function recordPayment(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($customer, $validated, $request) {
            $newBalance = $customer->balance - $validated['amount'];

            CustomerPayment::create([
                'customer_id' => $customer->id,
                'type' => 'payment',
                'amount' => -$validated['amount'],
                'running_balance' => $newBalance,
                'description' => $validated['description'] ?? 'Payment received',
                'recorded_by' => $request->user()->id,
            ]);

            $customer->update(['balance' => $newBalance]);
        });

        return back()->with('success', 'Payment of Rs ' . number_format($validated['amount'], 2) . ' recorded');
    }

    public function search(Request $request)
    {
        $search = $request->input('q', '');
        if (strlen($search) < 1) return response()->json([]);

        $customers = Customer::where('name', 'like', "%{$search}%")
            ->orWhere('phone', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'name', 'phone', 'balance']);

        return response()->json($customers);
    }

    public function destroy(Customer $customer)
    {
        if ($customer->balance > 0) {
            return back()->with('error', 'Cannot delete customer with outstanding balance');
        }

        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Customer deleted');
    }
}
