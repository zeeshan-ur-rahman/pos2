import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, lowStockBatches, expiredBatches, expiringSoonBatches, recentProducts }) {
    const user = usePage().props.auth.user;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const hasAlerts = stats.expiredCount > 0 || stats.expiringSoonCount > 0 || stats.lowStockCount > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* ─── Hero Banner ─── */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">{greeting}</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">{user.name}</h1>
                            <p className="text-slate-400 text-sm mt-2">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('pos.terminal')}
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                                POS Terminal
                            </Link>
                            <Link
                                href="/add-product"
                                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                New Medicine
                            </Link>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-lg backdrop-blur transition-all duration-200 border border-white/10"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                All Products
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                    {/* ─── Today's Sales ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <StatCard
                            icon={<IconCart />}
                            iconBg="bg-indigo-500"
                            label="Today's Sales"
                            value={stats.todaySalesCount}
                            sub={stats.todaySalesCount > 0 ? 'Transactions today' : 'No sales yet today'}
                            subColor={stats.todaySalesCount > 0 ? 'text-indigo-500' : 'text-gray-400'}
                        />
                        <StatCard
                            icon={<IconMoney />}
                            iconBg="bg-emerald-500"
                            label="Today's Revenue"
                            value={`Rs ${formatNumber(stats.todayRevenue)}`}
                            sub="Total sales amount"
                            subColor="text-gray-400"
                        />
                        <StatCard
                            icon={<IconTrend />}
                            iconBg="bg-green-500"
                            label="Today's Profit"
                            value={`Rs ${formatNumber(stats.todayProfit)}`}
                            sub="Revenue minus cost"
                            subColor="text-emerald-500"
                        />
                    </div>

                    {/* ─── Inventory Stats ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            icon={<IconBox />}
                            iconBg="bg-blue-500"
                            label="Total Products"
                            value={stats.totalProducts}
                            sub={stats.outOfStockProducts > 0 ? `${stats.outOfStockProducts} out of stock` : 'All in stock'}
                            subColor={stats.outOfStockProducts > 0 ? 'text-red-500' : 'text-emerald-500'}
                        />
                        <StatCard
                            icon={<IconStack />}
                            iconBg="bg-violet-500"
                            label="Stock Units"
                            value={stats.totalStockQuantity.toLocaleString()}
                            sub={stats.lowStockCount > 0 ? `${stats.lowStockCount} batches running low` : 'All levels healthy'}
                            subColor={stats.lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}
                        />
                        <StatCard
                            icon={<IconMoney />}
                            iconBg="bg-emerald-500"
                            label="Cost Value"
                            value={`Rs ${formatNumber(stats.totalInventoryValue)}`}
                            sub="Total buying value"
                            subColor="text-gray-400"
                        />
                        <StatCard
                            icon={<IconTrend />}
                            iconBg="bg-amber-500"
                            label="Retail Value"
                            value={`Rs ${formatNumber(stats.totalSellingValue)}`}
                            sub={`Profit: Rs ${formatNumber(stats.totalSellingValue - stats.totalInventoryValue)}`}
                            subColor="text-emerald-500"
                        />
                    </div>

                    {/* Alert Banner */}
                    {hasAlerts && (
                        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                            <div className="bg-red-100 text-red-600 p-2 rounded-lg shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Attention Required</p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {[
                                        stats.expiredCount > 0 && `${stats.expiredCount} expired batch${stats.expiredCount > 1 ? 'es' : ''}`,
                                        stats.expiringSoonCount > 0 && `${stats.expiringSoonCount} expiring soon`,
                                        stats.lowStockCount > 0 && `${stats.lowStockCount} low on stock`,
                                    ].filter(Boolean).join('  ·  ')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* ── Expired ── */}
                        <Card>
                            <CardHeader
                                icon={<IconExpired />}
                                iconBg="bg-red-100 text-red-600"
                                title="Expired Medicines"
                                count={expiredBatches.length}
                                countBg="bg-red-100 text-red-700"
                            />
                            {expiredBatches.length === 0 ? (
                                <EmptyState icon={<IconShield />} text="No expired medicines found" />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <THead cols={['Medicine', 'Batch', 'Expired On', 'Qty']} />
                                        <tbody className="divide-y divide-gray-100">
                                            {expiredBatches.map(b => (
                                                <tr key={b.id} className="hover:bg-red-50/40 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <Link href={`/products/${b.product.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">{b.product.name}</Link>
                                                        <p className="text-xs text-gray-400 mt-0.5">{b.product.generic_name}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{b.batch_number}</td>
                                                    <td className="px-5 py-3.5">
                                                        <Badge color="red">{formatDate(b.expiry_date)}</Badge>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-700">{b.stock_quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        {/* ── Expiring Soon ── */}
                        <Card>
                            <CardHeader
                                icon={<IconClock />}
                                iconBg="bg-amber-100 text-amber-600"
                                title="Expiring Within 30 Days"
                                count={expiringSoonBatches.length}
                                countBg="bg-amber-100 text-amber-700"
                            />
                            {expiringSoonBatches.length === 0 ? (
                                <EmptyState icon={<IconShield />} text="Nothing expiring soon" />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <THead cols={['Medicine', 'Batch', 'Expires On', 'Qty']} />
                                        <tbody className="divide-y divide-gray-100">
                                            {expiringSoonBatches.map(b => (
                                                <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <Link href={`/products/${b.product.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">{b.product.name}</Link>
                                                        <p className="text-xs text-gray-400 mt-0.5">{b.product.generic_name}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{b.batch_number}</td>
                                                    <td className="px-5 py-3.5">
                                                        <Badge color="amber">{formatDate(b.expiry_date)}</Badge>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-700">{b.stock_quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        {/* ── Low Stock ── */}
                        <Card>
                            <CardHeader
                                icon={<IconWarning />}
                                iconBg="bg-orange-100 text-orange-600"
                                title="Low Stock Alerts"
                                count={lowStockBatches.length}
                                countBg="bg-orange-100 text-orange-700"
                            />
                            {lowStockBatches.length === 0 ? (
                                <EmptyState icon={<IconShield />} text="All stock levels are healthy" />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <THead cols={['Medicine', 'Batch', 'Remaining']} />
                                        <tbody className="divide-y divide-gray-100">
                                            {lowStockBatches.map(b => (
                                                <tr key={b.id} className="hover:bg-orange-50/40 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <Link href={`/products/${b.product.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">{b.product.name}</Link>
                                                        <p className="text-xs text-gray-400 mt-0.5">{b.product.generic_name}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{b.batch_number}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <StockBadge qty={b.stock_quantity} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        {/* ── Recent Products ── */}
                        <Card>
                            <CardHeader
                                icon={<IconRecent />}
                                iconBg="bg-indigo-100 text-indigo-600"
                                title="Recently Added"
                                count={recentProducts.length}
                                countBg="bg-indigo-100 text-indigo-700"
                            />
                            {recentProducts.length === 0 ? (
                                <EmptyState icon={<IconBox />} text="No products added yet" />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <THead cols={['Medicine', 'Company', 'Batches']} />
                                        <tbody className="divide-y divide-gray-100">
                                            {recentProducts.map(p => (
                                                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <Link href={`/products/${p.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">{p.name}</Link>
                                                        <p className="text-xs text-gray-400 mt-0.5">{p.generic_name}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm text-gray-500">{p.company}</span>
                                                        <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold">
                                                            {p.batches.length}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ════════════════════════════════════
   Reusable Components
   ════════════════════════════════════ */

function StatCard({ icon, iconBg, label, value, sub, subColor }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-4">
                <div className={`${iconBg} text-white p-3 rounded-xl shrink-0`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{value}</p>
                </div>
            </div>
            <p className={`text-xs font-medium mt-4 pt-3 border-t border-gray-50 ${subColor}`}>{sub}</p>
        </div>
    );
}

function Card({ children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {children}
        </div>
    );
}

function CardHeader({ icon, iconBg, title, count, countBg }) {
    return (
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            {count > 0 && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${countBg}`}>
                    {count}
                </span>
            )}
        </div>
    );
}

function THead({ cols }) {
    return (
        <thead>
            <tr className="bg-gray-50/80">
                {cols.map((col, i) => (
                    <th key={col} className={`px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === cols.length - 1 ? 'text-right' : 'text-left'}`}>
                        {col}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-300">{icon}</div>
            <p className="text-sm text-gray-400 font-medium">{text}</p>
        </div>
    );
}

function Badge({ color, children }) {
    const styles = {
        red: 'bg-red-50 text-red-700 ring-red-600/10',
        amber: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${styles[color]}`}>
            {children}
        </span>
    );
}

function StockBadge({ qty }) {
    const level = qty <= 3 ? 'critical' : qty <= 5 ? 'warning' : 'low';
    const styles = {
        critical: 'bg-red-50 text-red-700 ring-red-200',
        warning: 'bg-orange-50 text-orange-700 ring-orange-200',
        low: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    };
    const labels = { critical: 'Critical', warning: 'Low', low: 'Low' };

    return (
        <div className="flex items-center justify-end gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset ${styles[level]}`}>
                {qty} units
                <span className="text-[10px] font-medium opacity-70">· {labels[level]}</span>
            </span>
        </div>
    );
}

/* ════════════════════════════════════
   Icons (inline SVG)
   ════════════════════════════════════ */

function IconCart() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
}
function IconBox() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}
function IconStack() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-4.179 2.25m0 0L12 17.25l-5.571-3m11.142 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25" /></svg>;
}
function IconMoney() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
}
function IconTrend() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
}
function IconExpired() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
}
function IconClock() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconWarning() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
}
function IconRecent() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" /></svg>;
}
function IconShield() {
    return <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
}

/* ════════════════════════════════════
   Helpers
   ════════════════════════════════════ */

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
}
