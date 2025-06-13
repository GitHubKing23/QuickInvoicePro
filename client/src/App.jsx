import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';

export default function App() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now()}`);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([
    { name: '', qty: 1, rate: 0, billingType: 'Flat', taxRate: 0 },
  ]);
  const [logoData, setLogoData] = useState('');

  const handleItemChange = (index, field, value) => {
    const newItems = items.slice();
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      { name: '', qty: 1, rate: 0, billingType: 'Flat', taxRate: 0 },
    ]);

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalTax = items.reduce(
    (sum, item) => sum + item.qty * item.rate * (item.taxRate / 100),
    0
  );
  const grandTotal = subtotal + totalTax;

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
      head: [
        [
          'Item',
          'Type',
          'Qty',
          'Rate',
          'Tax %',
          'Subtotal',
          'Tax',
          'Total',
        ],
      ],
      body: items.map((it) => {
        const rowStyle =
          it.billingType === 'Hourly' ? { fillColor: [240, 240, 255] } : {};
        const sub = it.qty * it.rate;
        const tax = sub * (it.taxRate / 100);
        const total = sub + tax;
        return [
          { content: it.name, styles: rowStyle },
          { content: it.billingType, styles: rowStyle },
          { content: it.qty, styles: rowStyle },
          { content: it.rate, styles: rowStyle },
          { content: `${it.taxRate}%`, styles: rowStyle },
          { content: sub.toFixed(2), styles: rowStyle },
          { content: tax.toFixed(2), styles: rowStyle },
          { content: total.toFixed(2), styles: rowStyle },
        ];
      }),
      startY: 50,
    });
    const y = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 10, y);
    doc.text(`Tax: ${totalTax.toFixed(2)}`, 10, y + 10);
    doc.text(`Total: ${grandTotal.toFixed(2)}`, 10, y + 20);
    doc.save('invoice.pdf');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Invoice</h1>
      <div>
        <label>
          Client Name
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </label>
        <label>
          Client Email
          <input value={clientEmail} type="email" onChange={(e) => setClientEmail(e.target.value)} />
        </label>
        <label>
          Company Name
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>
        <label>
          Company Logo
          <input type="file" accept="image/*" onChange={handleLogo} />
        </label>
        <label>
          Invoice Number
          <input value={invoiceNumber} readOnly />
        </label>
        <label>
          Due Date
          <input value={dueDate} type="date" onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Tax %</th>
            <th>Line Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const sub = item.qty * item.rate;
            const tax = sub * (item.taxRate / 100);
            const total = sub + tax;
            return (
              <tr
                key={idx}
                style={{ background: item.billingType === 'Hourly' ? '#f0f0ff' : undefined }}
              >
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={item.billingType}
                    onChange={(e) => handleItemChange(idx, 'billingType', e.target.value)}
                  >
                    <option value="Flat">Flat</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.taxRate}
                    onChange={(e) =>
                      handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>{total.toFixed(2)}</td>
                <td>
                  <button onClick={() => removeItem(idx)}>x</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={addItem}>Add Item</button>
      <p>Subtotal: {subtotal.toFixed(2)}</p>
      <p>Tax: {totalTax.toFixed(2)}</p>
      <p>Total: {grandTotal.toFixed(2)}</p>
      <button onClick={downloadPdf}>Download as PDF</button>
    </div>
  );
}
