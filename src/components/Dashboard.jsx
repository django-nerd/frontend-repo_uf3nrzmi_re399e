import { useEffect, useState } from 'react'
import { Plus, Database, Users, Building, Gift, Wallet } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-400 border-emerald-500/20',
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-400 border-violet-500/20',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-400 border-amber-500/20',
    pink: 'from-pink-500/10 to-pink-500/0 text-pink-400 border-pink-500/20',
  }
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-sm ${colors[color]}`}>
      <div className="absolute inset-0 bg-gradient-to-br pointer-events-none" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function QuickAdd({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [collection, setCollection] = useState('trust')
  const [form, setForm] = useState({ name: '', title: '', amount: '', value: '' })
  const schemaFields = {
    trust: ['name', 'purpose'],
    beneficiary: ['full_name', 'email'],
    trustee: ['full_name', 'role'],
    asset: ['title', 'category', 'value'],
    ngo: ['name', 'email'],
    donation: ['ngo_name', 'amount'],
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = {}
    schemaFields[collection].forEach((f) => {
      if (form[f] !== undefined && form[f] !== '') payload[f] = f === 'amount' || f === 'value' ? Number(form[f]) : form[f]
    })

    const res = await fetch(`${API_BASE}/api/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setOpen(false)
      setForm({})
      onCreate && onCreate(collection)
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.detail || 'Failed to create')
    }
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Quick add</h3>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>
      {open && (
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
          <select value={collection} onChange={(e) => setCollection(e.target.value)} className="col-span-2 bg-slate-800 text-slate-100 border border-white/10 rounded-lg px-3 py-2">
            <option value="trust">Trust</option>
            <option value="beneficiary">Beneficiary</option>
            <option value="trustee">Trustee</option>
            <option value="asset">Asset</option>
            <option value="ngo">NGO</option>
            <option value="donation">Donation</option>
          </select>
          {schemaFields[collection].map((f) => (
            <input key={f} placeholder={f} value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="bg-slate-800 text-slate-100 border border-white/10 rounded-lg px-3 py-2" />
          ))}
          <button type="submit" className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg">Save</button>
        </form>
      )}
    </div>
  )
}

function DataSection({ title, collection }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/${collection}`)
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={fetchItems} className="text-xs text-slate-300 hover:text-white">Refresh</button>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No records yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-300">
              <tr>
                {Object.keys(items[0]).filter(k => k !== '_id' && k !== 'created_at' && k !== 'updated_at').slice(0,4).map((k) => (
                  <th key={k} className="py-2 pr-6 font-medium">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {items.map((it) => (
                <tr key={it._id} className="border-t border-white/5">
                  {Object.entries(it).filter(([k]) => k !== '_id' && k !== 'created_at' && k !== 'updated_at').slice(0,4).map(([k, v]) => (
                    <td key={k} className="py-2 pr-6 truncate max-w-[220px]">{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)

  const loadSummary = async () => {
    const res = await fetch(`${API_BASE}/api/summary`)
    if (res.ok) {
      const data = await res.json()
      setSummary(data)
    }
  }

  useEffect(() => { loadSummary() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_25%)]" />
        <header className="relative border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-400/30 grid place-items-center">
                <Database className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h1 className="text-white font-bold">Living Trust & NGO Manager</h1>
                <p className="text-slate-400 text-xs">Manage trusts, beneficiaries, assets, NGOs and donations.</p>
              </div>
            </div>
            <a href="/test" className="text-slate-300 hover:text-white text-sm">Connection test</a>
          </div>
        </header>

        <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Trusts" value={summary?.trusts ?? '—'} icon={Building} color="blue" />
            <StatCard title="Beneficiaries" value={summary?.beneficiaries ?? '—'} icon={Users} color="emerald" />
            <StatCard title="Assets Value" value={`$${(summary?.total_asset_value ?? 0).toLocaleString()}`} icon={Wallet} color="violet" />
            <StatCard title="NGOs" value={summary?.ngos ?? '—'} icon={Building} color="amber" />
            <StatCard title="Donations" value={`$${(summary?.total_donation ?? 0).toLocaleString()}`} icon={Gift} color="pink" />
          </div>

          <QuickAdd onCreate={loadSummary} />

          <div className="grid lg:grid-cols-2 gap-6">
            <DataSection title="Trusts" collection="trust" />
            <DataSection title="Beneficiaries" collection="beneficiary" />
            <DataSection title="Assets" collection="asset" />
            <DataSection title="NGOs" collection="ngo" />
          </div>
        </main>
      </div>
    </div>
  )
}
