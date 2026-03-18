import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function Terminal() {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discountValue, setDiscountValue] = useState('');
    const [discountType, setDiscountType] = useState('fixed');
    const [amountReceived, setAmountReceived] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const priceForUnit = (item) => {
        if (item.unit === 'box') return item.box_price;
        if (item.unit === 'strip') return item.strip_price;
        return item.tablet_price;
    };
    const toTablets = (item) => {
        if (item.unit === 'box') return item.qty * (item.total_tablets || item.units_per_box || 1);
        if (item.unit === 'strip') return item.qty * (item.tablets_per_strip || 1);
        return item.qty;
    };
    const maxQty = (item) => {
        if (item.unit === 'box') return Math.floor(item.total_stock / (item.total_tablets || item.units_per_box || 1));
        if (item.unit === 'strip') return Math.floor(item.total_stock / (item.tablets_per_strip || 1));
        return item.total_stock;
    };

    const getItemDiscount = (item) => {
        const raw = parseFloat(item.discountInput) || 0;
        const line = priceForUnit(item) * item.qty;
        return item.discountType === 'percentage' ? (line * raw) / 100 : raw;
    };

    const subtotal = cart.reduce((sum, item) => sum + (priceForUnit(item) * item.qty) - getItemDiscount(item), 0);
    const orderDiscount = discountType === 'percentage'
        ? (subtotal * (parseFloat(discountValue) || 0)) / 100
        : (parseFloat(discountValue) || 0);
    const totalAmount = subtotal - orderDiscount;
    const changeAmount = paymentMethod === 'cash' && amountReceived ? Math.max(0, parseFloat(amountReceived) - totalAmount) : 0;

    const searchProducts = useCallback((query) => {
        if (query.length < 1) { setSearchResults([]); return; }
        setSearching(true);
        axios.get(route('pos.search'), { params: { q: query } })
            .then(res => setSearchResults(res.data))
            .catch(() => setSearchResults([]))
            .finally(() => setSearching(false));
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchProducts(searchQuery), 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, searchProducts]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus(); }
            if (e.key === 'F2') { e.preventDefault(); handleCompleteSale(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart, paymentMethod, amountReceived, discountValue, discountType]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                if (existing.qty >= maxQty(existing)) return prev;
                return prev.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                generic_name: product.generic_name,
                box_price: parseFloat(product.box_price),
                strip_price: parseFloat(product.strip_price),
                tablet_price: parseFloat(product.tablet_price),
                units_per_box: product.units_per_box,
                tablets_per_strip: product.tablets_per_strip,
                total_tablets: product.total_tablets,
                total_stock: product.total_stock,
                unit: 'box',
                qty: 1,
                discountInput: '',
                discountType: 'fixed',
            }];
        });
        setSearchQuery('');
        setSearchResults([]);
        searchRef.current?.focus();
    };

    const updateQty = (id, newQty) => {
        if (newQty < 1) return removeFromCart(id);
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, qty: Math.min(newQty, maxQty(i)) } : i));
    };

    const updateUnit = (id, newUnit) => {
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, unit: newUnit, qty: 1, discountInput: '' } : i));
    };

    const updateItemDiscount = (id, value) => {
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, discountInput: value } : i));
    };

    const updateItemDiscountType = (id, type) => {
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, discountType: type, discountInput: '' } : i));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product_id !== id));

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            if (searchResults.length === 1) addToCart(searchResults[0]);
            else if (searchResults.length === 0) searchProducts(searchQuery);
        }
    };

    const handleCompleteSale = () => {
        if (cart.length === 0) { setError('Cart is empty'); return; }
        const received = paymentMethod === 'cash' ? parseFloat(amountReceived) : totalAmount;
        if (paymentMethod === 'cash' && (!received || received < totalAmount)) {
            setError('Amount received must be at least Rs ' + totalAmount.toFixed(2));
            return;
        }
        setProcessing(true);
        setError('');
        router.post(route('pos.store'), {
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: toTablets(item),
                unit_type: item.unit,
                unit_quantity: item.qty,
                discount: getItemDiscount(item),
            })),
            payment_method: paymentMethod,
            discount_amount: orderDiscount,
            amount_received: received,
            notes,
        }, {
            onError: () => setError('Failed to process sale. Please try again.'),
            onFinish: () => setProcessing(false),
        });
    };

    const clearCart = () => {
        if (cart.length > 0 && !confirm('Clear all items from cart?')) return;
        setCart([]);
        setDiscountValue('');
        setDiscountType('fixed');
        setAmountReceived('');
        setNotes('');
        setError('');
    };

    const formatStock = (p) => {
        const totalPerBox = p.total_tablets || p.units_per_box || 1;
        const tps = p.tablets_per_strip || 1;
        if (totalPerBox <= 1) return `${p.total_stock} in stock`;
        const boxes = Math.floor(p.total_stock / totalPerBox);
        const remaining = p.total_stock % totalPerBox;
        const strips = tps > 1 ? Math.floor(remaining / tps) : 0;
        const tablets = tps > 1 ? remaining % tps : remaining;
        let parts = [];
        if (boxes > 0) parts.push(`${boxes} box${boxes !== 1 ? 'es' : ''}`);
        if (strips > 0) parts.push(`${strips} strip${strips !== 1 ? 's' : ''}`);
        if (tablets > 0) parts.push(`${tablets} tablet${tablets !== 1 ? 's' : ''}`);
        return parts.length > 0 ? `${parts.join(' + ')} (${p.total_stock} tablets)` : `${p.total_stock} tablets`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="POS Terminal" />
            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-4">
                    {(error || flash?.error) && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error || flash.error}</div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                    </div>
                                    <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown}
                                        className="w-full pl-12 pr-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Scan barcode or search medicine... (F1)" autoFocus />
                                    {searching && <div className="absolute inset-y-0 right-0 pr-4 flex items-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                </div>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100"><span className="text-sm font-semibold text-gray-600">{searchResults.length} products found</span></div>
                                    <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                                        {searchResults.map(product => (
                                            <button key={product.id} onClick={() => addToCart(product)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors text-left">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{product.generic_name} · {product.category}</p>
                                                    {product.barcode && <p className="text-xs text-gray-400 font-mono mt-0.5">{product.barcode}</p>}
                                                </div>
                                                <div className="text-right ml-4 shrink-0">
                                                    <p className="text-sm font-bold text-gray-900">Rs {parseFloat(product.box_price).toFixed(2)}</p>
                                                    {product.units_per_box > 1 && <p className="text-xs text-gray-400">Strip: Rs {parseFloat(product.strip_price).toFixed(2)}</p>}
                                                    {product.tablets_per_strip > 1 && <p className="text-xs text-gray-400">Tablet: Rs {parseFloat(product.tablet_price).toFixed(2)}</p>}
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatStock(product)}</p>
                                                </div>
                                                <div className="ml-3 shrink-0">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-600">Cart ({cart.length} items)</span>
                                    {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>}
                                </div>
                                {cart.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                                        <p className="text-sm text-gray-400">No items in cart</p>
                                        <p className="text-xs text-gray-400 mt-1">Search and add medicines above</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50/80">
                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Medicine</th>
                                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase">Price</th>
                                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase">Qty</th>
                                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase">Discount</th>
                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase">Total</th>
                                                    <th className="px-4 py-2.5 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {cart.map(item => (
                                                    <tr key={item.product_id} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                                            <p className="text-xs text-gray-400">{item.generic_name}</p>
                                                            {(item.units_per_box > 1 || item.tablets_per_strip > 1) && (
                                                                <div className="flex rounded-md overflow-hidden border border-gray-200 mt-1.5 w-fit">
                                                                    {item.units_per_box > 1 && (
                                                                        <button onClick={() => updateUnit(item.product_id, 'box')}
                                                                            className={`px-2 py-0.5 text-[10px] font-semibold ${item.unit === 'box' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                                            Box (Rs {item.box_price.toFixed(2)})
                                                                        </button>
                                                                    )}
                                                                    {item.units_per_box > 1 && (
                                                                        <button onClick={() => updateUnit(item.product_id, 'strip')}
                                                                            className={`px-2 py-0.5 text-[10px] font-semibold ${item.unit === 'strip' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                                            Strip (Rs {item.strip_price.toFixed(2)})
                                                                        </button>
                                                                    )}
                                                                    {item.tablets_per_strip > 1 && (
                                                                        <button onClick={() => updateUnit(item.product_id, 'tablet')}
                                                                            className={`px-2 py-0.5 text-[10px] font-semibold ${item.unit === 'tablet' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                                            Tablet (Rs {item.tablet_price.toFixed(2)})
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                            Rs {priceForUnit(item).toFixed(2)}
                                                            <p className="text-[10px] text-gray-400">per {item.unit}</p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">-</button>
                                                                <input type="number" value={item.qty} onChange={(e) => updateQty(item.product_id, parseInt(e.target.value) || 1)}
                                                                    className="w-16 text-center text-sm border border-gray-200 rounded-md py-1" min="1" max={maxQty(item)} />
                                                                <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                                                    disabled={item.qty >= maxQty(item)}>+</button>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1 justify-center">
                                                                <div className="flex rounded-md overflow-hidden border border-gray-200">
                                                                    <button onClick={() => updateItemDiscountType(item.product_id, 'fixed')}
                                                                        className={`px-1.5 py-0.5 text-[10px] font-semibold ${item.discountType === 'fixed' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Rs</button>
                                                                    <button onClick={() => updateItemDiscountType(item.product_id, 'percentage')}
                                                                        className={`px-1.5 py-0.5 text-[10px] font-semibold ${item.discountType === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>%</button>
                                                                </div>
                                                                <input type="number" value={item.discountInput} onChange={(e) => updateItemDiscount(item.product_id, e.target.value)}
                                                                    className="w-16 text-center text-sm border border-gray-200 rounded-md py-1" placeholder="0" min="0" max={item.discountType === 'percentage' ? 100 : undefined} />
                                                            </div>
                                                            {item.discountType === 'percentage' && parseFloat(item.discountInput) > 0 && (
                                                                <p className="text-[10px] text-gray-400 text-center mt-0.5">-Rs {getItemDiscount(item).toFixed(2)}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                                                            Rs {((priceForUnit(item) * item.qty) - getItemDiscount(item)).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium text-gray-800">Rs {subtotal.toFixed(2)}</span></div>
                                    <div className="text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Discount</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex rounded-md overflow-hidden border border-gray-200">
                                                    <button onClick={() => { setDiscountType('fixed'); setDiscountValue(''); }} className={`px-2 py-1 text-xs font-semibold ${discountType === 'fixed' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Rs</button>
                                                    <button onClick={() => { setDiscountType('percentage'); setDiscountValue(''); }} className={`px-2 py-1 text-xs font-semibold ${discountType === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>%</button>
                                                </div>
                                                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                                                    className="w-24 text-right text-sm border border-gray-200 rounded-md py-1 px-2" placeholder="0" min="0" max={discountType === 'percentage' ? 100 : undefined} />
                                            </div>
                                        </div>
                                        {discountType === 'percentage' && parseFloat(discountValue) > 0 && <p className="text-xs text-gray-400 text-right mt-1">-Rs {orderDiscount.toFixed(2)}</p>}
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                                        <span className="text-base font-bold text-gray-800">Total</span>
                                        <span className="text-xl font-extrabold text-gray-900">Rs {totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Payment Method</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[{ value: 'cash', label: 'Cash', icon: '💵' }, { value: 'easypaisa', label: 'Easypaisa', icon: '📱' }, { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }].map(method => (
                                        <button key={method.value} onClick={() => setPaymentMethod(method.value)}
                                            className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${paymentMethod === method.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                            <span className="mr-1">{method.icon}</span> {method.label}
                                        </button>
                                    ))}
                                </div>
                                {paymentMethod === 'cash' && (
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Amount Received</label>
                                            <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)}
                                                className="w-full text-lg font-semibold border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500" placeholder="0.00" min="0" step="0.01" />
                                        </div>
                                        {amountReceived && parseFloat(amountReceived) >= totalAmount && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex justify-between items-center">
                                                <span className="text-sm text-green-700">Change</span>
                                                <span className="text-lg font-bold text-green-700">Rs {changeAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2 flex-wrap">
                                            {[totalAmount, Math.ceil(totalAmount / 100) * 100, Math.ceil(totalAmount / 500) * 500, Math.ceil(totalAmount / 1000) * 1000]
                                                .filter((v, i, a) => a.indexOf(v) === i && v > 0).map(amount => (
                                                <button key={amount} onClick={() => setAmountReceived(amount.toString())}
                                                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700">Rs {amount.toFixed(0)}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg py-2 px-3 resize-none" rows="2" placeholder="Prescription reference, customer notes..." />
                            </div>

                            <button onClick={handleCompleteSale} disabled={processing || cart.length === 0}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2">
                                {processing ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</>) : (
                                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Complete Sale (F2)</>
                                )}
                            </button>

                            <div className="flex gap-2">
                                <a href={route('pos.history')} className="flex-1 text-center py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200 hover:border-gray-300">Sales History</a>
                                <a href={route('pos.daily-summary')} className="flex-1 text-center py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200 hover:border-gray-300">Daily Summary</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
