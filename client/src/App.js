import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';

export default function App() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber] = useState(() => `INV-${Date.now()}`);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ name: '', qty: 1, rate: 0, isHourly: false }]);
  const [logoData, setLogoData] = useState('');

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', qty: 1, rate: 0, isHourly: false }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    if (logoData) {
      doc.addImage(logoData, 'PNG', 150, 5, 40, 20);
    }
    doc.text(companyName, 10, 10);
    doc.text(`Invoice #: ${invoiceNumber}`, 10, 20);
    doc.text(`Bill To: ${clientName} (${clientEmail})`, 10, 30);
    doc.text(`Due: ${dueDate}`, 10, 40);
    doc.autoTable({
      head: [['Item', 'Qty', 'Rate', 'Type', 'Subtotal']],
      body: items.map((it) => [
        it.name,
        it.qty,
        it.rate,
        it.isHourly ? 'Hourly' : 'Flat',
        (it.qty * it.rate).toFixed(2)
      ]),
      startY: 50,
    });
    doc.text(`Total: ${total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save('invoice.pdf');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Invoice</h1>
      <div>
        <label>Client Name <input value={clientName} onChange={(e) => setClientName(e.target.value)} /></label>
        <label>Client Email <input value={clientEmail} type="email" onChange={(e) => setClientEmail(e.target.value)} /></label>
        <label>Company Name <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></label>
        <label>Company Logo <input type="file" accept="image/*" onChange={handleLogo} /></label>
        <label>Invoice Number <input value={invoiceNumber} readOnly /></label>
        <label>Due Date <input value={dueDate} type="date" onChange={(e) => setDueDate(e.target.value)} /></label>
      </div>
      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Hourly</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td><input value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} /></td>
              <td><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)} /></td>
              <td><input type="number" step="0.01" value={item.rate} onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)} /></td>
              <td><input type="checkbox" checked={item.isHourly} onChange={(e) => handleItemChange(idx, 'isHourly', e.target.checked)} /></td>
              <td>{(item.qty * item.rate).toFixed(2)}</td>
              <td><button onClick={() => removeItem(idx)}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addItem}>Add Item</button>
      <p>Total: {total.toFixed(2)}</p>
      <button onClick={downloadPdf}>Download as PDF</button>
    </div>
  );
}
