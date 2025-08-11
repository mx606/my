import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDebts(); }, []);

  async function fetchDebts(q = '') {
    setLoading(true);
    const url = q ? `/api/debts?q=${encodeURIComponent(q)}` : '/api/debts';
    const res = await fetch(url);
    const data = await res.json();
    setDebts(data);
    setLoading(false);
  }

  async function addDebt(e) {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, amount, dueDate })
    });
    setName(''); setAmount(''); setDueDate('');
    fetchDebts(query);
  }

  async function deleteDebt(id) {
    if (!confirm('هل تريد حقًا حذف هذا الدين؟')) return;
    await fetch(`/api/debts?id=${id}`, { method: 'DELETE' });
    fetchDebts(query);
  }

  async function updateDebt(d) {
    const newName = prompt('الاسم:', d.name) ?? d.name;
    const newAmount = prompt('المبلغ:', String(d.amount)) ?? d.amount;
    const newDue = prompt('تاريخ الاستحقاق (YYYY-MM-DD):', d.dueDate.slice(0,10)) ?? d.dueDate.slice(0,10);
    await fetch('/api/debts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, name: newName, amount: newAmount, dueDate: newDue })
    });
    fetchDebts(query);
  }

  function totalSum() { return debts.reduce((s, d) => s + Number(d.amount), 0); }

  function exportExcel() {
    if (!debts.length) return alert('لا توجد بيانات للتصدير');
    const rows = debts.map(d => ({
      ID: d.id,
      الاسم: d.name,
      المبلغ: d.amount,
      'تاريخ الاستحقاق': new Date(d.dueDate).toISOString().slice(0,10),
      'تاريخ الإنشاء': new Date(d.createdAt).toISOString()
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Debts');
    XLSX.writeFile(wb, 'debts.xlsx');
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 20, fontFamily: 'Cairo, sans-serif' }}>
      <h1>📒 برنامج إدارة الديون</h1>
      <form onSubmit={addDebt} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="اسم الشخص" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="المبلغ" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        <button type="submit" className="blue">إضافة</button>
      </form>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="ابحث بالاسم..." value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={() => fetchDebts(query)} className="blue">بحث</button>
        <button onClick={() => { setQuery(''); fetchDebts(); }} className="red">عرض الكل</button>
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <strong>المجموع الكلي: </strong> {totalSum().toLocaleString()} 
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={exportExcel} className="blue">تصدير إلى Excel</button>
      </div>
      {loading ? (<div>جارٍ التحميل...</div>) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>#</th><th>الاسم</th><th>المبلغ</th><th>تاريخ الاستحقاق</th><th>إجراءات</th></tr></thead>
          <tbody>
            {debts.map((d, i) => (
              <tr key={d.id} style={{ borderTop: '1px solid #ddd' }}>
                <td>{i + 1}</td>
                <td>{d.name}</td>
                <td>{Number(d.amount).toLocaleString()}</td>
                <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => updateDebt(d)} className="blue">تعديل</button>
                  <button onClick={() => deleteDebt(d.id)} className="red" style={{ marginLeft: 8 }}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}