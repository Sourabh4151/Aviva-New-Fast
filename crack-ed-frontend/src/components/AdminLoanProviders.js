import React, { useState, useEffect } from 'react';
import '../styles/admin-dashboard.css';

function calculateEMI(amount, rate, tenure) {
  if (!amount || !rate || !tenure) return 0;
  const interest = amount * (rate / 100) * (tenure / 12);
  return ((amount + interest) / tenure).toFixed(2);
}

const AdminLoanProviders = () => {
  const [providers, setProviders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    logo: '',
    base_interest_rate: '',
    tenures: [],
    newTenure: '',
    description: '',
    cibil_score: '',
  });
  const [amount, setAmount] = useState(100000);
  const [previewTenures, setPreviewTenures] = useState({});
  const adminToken = localStorage.getItem('admin_token');

  // Fetch providers from backend
  const fetchProviders = async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-providers`);
    const data = await res.json();
    setProviders(data);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const resetForm = () => setForm({ name: '', logo: '', base_interest_rate: '', tenures: [], newTenure: '', description: '', cibil_score: '' });

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.base_interest_rate || form.tenures.length === 0) return alert('Fill all fields');
    const payload = {
      name: form.name,
      logo: form.logo,
      base_interest_rate: parseFloat(form.base_interest_rate),
      tenures: form.tenures.map(Number),
      description: form.description,
      cibil_score: form.cibil_score ? parseInt(form.cibil_score) : null,
    };
    try {
      if (editing !== null) {
        const id = providers[editing].id;
        await fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-providers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        setEditing(null);
      } else {
        await fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-providers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
      }
      resetForm();
      fetchProviders();
    } catch (err) {
      alert('Failed to save provider.');
    }
  };

  const handleEdit = (idx) => {
    setEditing(idx);
    const p = providers[idx];
    setForm({
      name: p.name,
      logo: p.logo,
      base_interest_rate: p.base_interest_rate,
      tenures: p.tenures || [],
      newTenure: '',
      description: p.description || '',
      cibil_score: p.cibil_score || '',
    });
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Delete this provider?')) return;
    const id = providers[idx].id;
    try {
      await fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-providers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      fetchProviders();
      if (editing === idx) resetForm();
    } catch (err) {
      alert('Failed to delete provider.');
    }
  };

  const handleTenureAdd = () => {
    if (!form.newTenure || isNaN(form.newTenure)) return;
    setForm({ ...form, tenures: [...form.tenures, Number(form.newTenure)], newTenure: '' });
  };

  const handleTenureDelete = (t) => {
    setForm({ ...form, tenures: form.tenures.filter(x => x !== t) });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, logo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-loan-providers-section" style={{ margin: '2rem 0' }}>
      <h3>Manage Loan Providers</h3>
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: 24, background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label>Provider Name</label><br />
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label>Logo</label><br />
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {form.logo && <img src={form.logo} alt="Logo Preview" style={{ width: 40, height: 40, objectFit: 'contain', marginTop: 4 }} />}
          </div>
          <div>
            <label>Interest Rate (%)</label><br />
            <input type="number" value={form.base_interest_rate} onChange={e => setForm(f => ({ ...f, base_interest_rate: e.target.value }))} required min="0" step="0.01" />
          </div>
          <div>
            <label>Tenures (months)</label><br />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={form.newTenure} onChange={e => setForm(f => ({ ...f, newTenure: e.target.value }))} placeholder="Add tenure" min="1" />
              <button type="button" onClick={handleTenureAdd}>Add</button>
            </div>
            <div style={{ marginTop: 4 }}>
              {form.tenures.map(t => (
                <span key={t} style={{ marginRight: 8, background: '#e0e0e0', padding: '2px 8px', borderRadius: 4 }}>
                  {t}m <button type="button" onClick={() => handleTenureDelete(t)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>x</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label>Description</label><br />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ minWidth: 180 }} />
          </div>
          <div>
            <label>CIBIL Score</label><br />
            <input type="number" value={form.cibil_score} onChange={e => setForm(f => ({ ...f, cibil_score: e.target.value }))} min="0" step="1" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="submit">{editing !== null ? 'Update' : 'Add'} Provider</button>
          {editing !== null && <button type="button" onClick={() => { setEditing(null); resetForm(); }} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>
      <div style={{ marginBottom: 24 }}>
        <label>Test EMI Calculation: </label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Loan Amount" style={{ width: 120, marginLeft: 8 }} />
      </div>
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Name</th>
            <th>Logo</th>
            <th>Interest Rate (%)</th>
            <th>Tenures</th>
            <th>Description</th>
            <th>EMI Example</th>
            <th>CIBIL Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p, idx) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.logo && <img src={p.logo} alt={p.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />}</td>
              <td>{p.base_interest_rate}</td>
              <td>{p.tenures && p.tenures.join(', ')}</td>
              <td>{p.description}</td>
              <td>
                {p.tenures && p.tenures.length > 0 && (
                  <div>
                    <select
                      value={previewTenures[p.name] || p.tenures[0]}
                      onChange={e => setPreviewTenures(pt => ({ ...pt, [p.name]: Number(e.target.value) }))}
                      style={{ marginBottom: 4 }}
                    >
                      {p.tenures.map(t => (
                        <option key={t} value={t}>{t} months</option>
                      ))}
                    </select>
                    <div>
                      EMI: ₹{calculateEMI(amount, p.base_interest_rate, previewTenures[p.name] || p.tenures[0])}
                    </div>
                  </div>
                )}
              </td>
              <td>{p.cibil_score || '-'}</td>
              <td>
                <button onClick={() => handleEdit(idx)}>Edit</button>
                <button onClick={() => handleDelete(idx)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
          {providers.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No providers added yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLoanProviders; 