import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Layers, 
  UserCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Package
} from 'lucide-react';
import { createBlankVariant, createBlankPO } from '../data/sampleData';
import { useToast } from './Toast';

export const PoForm = ({ poList, setPoList, activePoIndex, setActivePoIndex }) => {
  const { addToast } = useToast();
  const [expandedVariants, setExpandedVariants] = useState({ 0: true });

  const activePo = poList[activePoIndex] || poList[0];

  // Helper to update active PO field
  const updatePoField = (key, value) => {
    const updated = [...poList];
    updated[activePoIndex] = {
      ...updated[activePoIndex],
      [key]: value
    };
    // Sync po_number to child variants
    if (key === 'po_number') {
      updated[activePoIndex].order_variants = updated[activePoIndex].order_variants.map(v => ({
        ...v,
        po_number: value
      }));
    }
    setPoList(updated);
  };

  // Helper to update vendor nested field
  const updateVendorField = (key, value) => {
    const updated = [...poList];
    const currentVendor = updated[activePoIndex].vendor || {};
    updated[activePoIndex] = {
      ...updated[activePoIndex],
      vendor: {
        ...currentVendor,
        [key]: value
      }
    };
    setPoList(updated);
  };

  // Helper to update order_confirmed_by
  const updateConfirmationField = (key, value) => {
    const updated = [...poList];
    updated[activePoIndex] = {
      ...updated[activePoIndex],
      order_confirmed_by: {
        ...(updated[activePoIndex].order_confirmed_by || {}),
        [key]: value
      }
    };
    setPoList(updated);
  };

  // Helper to update variant
  const updateVariant = (vIndex, key, value) => {
    const updated = [...poList];
    const variants = [...updated[activePoIndex].order_variants];
    variants[vIndex] = {
      ...variants[vIndex],
      [key]: value
    };
    updated[activePoIndex].order_variants = variants;
    setPoList(updated);
  };

  // Helper to update variant indent_product
  const updateIndentProduct = (vIndex, key, value) => {
    const updated = [...poList];
    const variants = [...updated[activePoIndex].order_variants];
    variants[vIndex] = {
      ...variants[vIndex],
      indent_product: {
        ...variants[vIndex].indent_product,
        [key]: value
      }
    };
    updated[activePoIndex].order_variants = variants;
    setPoList(updated);
  };

  // Add new variant
  const handleAddVariant = () => {
    const updated = [...poList];
    const newVariant = createBlankVariant(activePo.po_number);
    const newVariants = [...updated[activePoIndex].order_variants, newVariant];
    updated[activePoIndex].order_variants = newVariants;
    setPoList(updated);
    setExpandedVariants(prev => ({ ...prev, [newVariants.length - 1]: true }));
    addToast('New product variant line item added', 'info');
  };

  // Duplicate variant
  const handleDuplicateVariant = (vIndex) => {
    const updated = [...poList];
    const itemToClone = JSON.parse(JSON.stringify(updated[activePoIndex].order_variants[vIndex]));
    const newVariants = [...updated[activePoIndex].order_variants];
    newVariants.splice(vIndex + 1, 0, itemToClone);
    updated[activePoIndex].order_variants = newVariants;
    setPoList(updated);
    setExpandedVariants(prev => ({ ...prev, [vIndex + 1]: true }));
    addToast('Line item duplicated', 'info');
  };

  // Delete variant
  const handleDeleteVariant = (vIndex) => {
    if (activePo.order_variants.length <= 1) {
      addToast('PO must have at least one line item', 'error');
      return;
    }
    const updated = [...poList];
    const newVariants = updated[activePoIndex].order_variants.filter((_, idx) => idx !== vIndex);
    updated[activePoIndex].order_variants = newVariants;
    setPoList(updated);
    addToast('Line item removed', 'info');
  };

  // Toggle variant collapse
  const toggleVariantExpand = (idx) => {
    setExpandedVariants(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Auto calculate total amount
  const handleAutoCalcTotal = () => {
    let grandTotal = 0;
    activePo.order_variants.forEach(v => {
      const qty = parseFloat(v.order_quantity) || 0;
      const price = parseFloat(v.order_price) || 0;
      const gstPercent = parseFloat(v.product_gst) || 0;
      const discount = parseFloat(v.order_discount) || 0;
      
      const subtotal = Math.max(0, (qty * price) - discount);
      const tax = (subtotal * gstPercent) / 100;
      grandTotal += (subtotal + tax);
    });

    const formatted = grandTotal.toFixed(2);
    updatePoField('order_total_amount', formatted);
    addToast(`Total calculated: ${activePo.vendor_currency || '₹'} ${formatted}`, 'success');
  };

  // Add new PO to batch
  const handleAddPo = () => {
    const newPo = createBlankPO();
    setPoList([...poList, newPo]);
    setActivePoIndex(poList.length);
    addToast('New Purchase Order added to batch', 'success');
  };

  // Delete current PO
  const handleDeletePo = (idx) => {
    if (poList.length <= 1) {
      addToast('Batch must contain at least one PO', 'error');
      return;
    }
    const updated = poList.filter((_, i) => i !== idx);
    setPoList(updated);
    setActivePoIndex(Math.max(0, idx - 1));
    addToast('PO removed from batch', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Batch PO Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: '#f1f5f9',
        padding: '8px 12px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '80%' }}>
          {poList.map((po, idx) => (
            <div
              key={idx}
              onClick={() => setActivePoIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activePoIndex === idx ? 'var(--primary)' : '#ffffff',
                color: activePoIndex === idx ? '#ffffff' : '#475569',
                border: activePoIndex === idx ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                boxShadow: activePoIndex === idx ? '0 2px 6px rgba(79, 70, 229, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={14} />
              <span>{po.po_number || `PO #${idx + 1}`}</span>
              {poList.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePo(idx);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activePoIndex === idx ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '4px'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddPo}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '5px 12px' }}
        >
          <Plus size={13} />
          <span>Add Another PO</span>
        </button>
      </div>

      {/* SECTION 1: PO Header & Financial Details */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
            <FileText size={18} color="#4f46e5" />
            General Purchase Order Details
          </h2>
          <span className="badge badge-indigo">Header Info</span>
        </div>

        {/* Row 1: 4 aligned columns */}
        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">PO Number</label>
            <input
              type="text"
              className="form-input"
              value={activePo.po_number || ''}
              onChange={(e) => updatePoField('po_number', e.target.value)}
              placeholder="e.g. O-SRML-26-00010/01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">RFQ Identifier</label>
            <input
              type="text"
              className="form-input"
              value={activePo.rfq_id || ''}
              onChange={(e) => updatePoField('rfq_id', e.target.value)}
              placeholder="e.g. SRML-26-00010"
            />
          </div>

          <div className="form-group">
            <label className="form-label">RFQ Date</label>
            <input
              type="date"
              className="form-input"
              value={activePo.rfq_date || ''}
              onChange={(e) => updatePoField('rfq_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Order Currency</label>
            <select
              className="form-select"
              value={activePo.vendor_currency || '₹'}
              onChange={(e) => updatePoField('vendor_currency', e.target.value)}
            >
              <option value="₹">₹ - Indian Rupee (INR)</option>
              <option value="$">$ - US Dollar (USD)</option>
              <option value="€">€ - Euro (EUR)</option>
              <option value="£">£ - British Pound (GBP)</option>
            </select>
          </div>
        </div>

        {/* Row 2: 4 aligned columns matching Row 1 */}
        <div className="form-grid-4" style={{ marginTop: '14px' }}>
          <div className="form-group">
            <label className="form-label">Order Total Amount</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingRight: '36px' }}
                value={activePo.order_total_amount || ''}
                onChange={(e) => updatePoField('order_total_amount', e.target.value)}
                placeholder="4.72"
              />
              <button
                type="button"
                onClick={handleAutoCalcTotal}
                title="Calculate sum across line items"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Calculator size={15} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Price Basis</label>
            <input
              type="text"
              className="form-input"
              value={activePo.order_price_basis || ''}
              onChange={(e) => updatePoField('order_price_basis', e.target.value)}
              placeholder="e.g. Ex, FOR, CIF"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Term</label>
            <input
              type="text"
              className="form-input"
              value={activePo.order_payment_term || ''}
              onChange={(e) => updatePoField('order_payment_term', e.target.value)}
              placeholder="e.g. Adv, Net 30"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Period (Days)</label>
            <input
              type="number"
              className="form-input"
              value={activePo.order_delivery_period ?? ''}
              onChange={(e) => updatePoField('order_delivery_period', parseInt(e.target.value, 10) || 0)}
              placeholder="2"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Vendor Details */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
            <Building2 size={18} color="#0891b2" />
            Vendor Information
          </h2>
          <span className="badge badge-emerald">Vendor Info</span>
        </div>

        {/* Row 1: 3 columns */}
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Vendor Legal Name</label>
            <input
              type="text"
              className="form-input"
              value={activePo.vendor?.legal_name || ''}
              onChange={(e) => updateVendorField('legal_name', e.target.value)}
              placeholder="e.g. JAY MARKET CREATORS PVT LIMITED"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vendor Email</label>
            <input
              type="email"
              className="form-input"
              value={activePo.vendor?.email || ''}
              onChange={(e) => updateVendorField('email', e.target.value)}
              placeholder="vendor@company.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">GSTIN Number</label>
            <input
              type="text"
              className="form-input"
              value={activePo.vendor?.gstin || ''}
              onChange={(e) => updateVendorField('gstin', e.target.value)}
              placeholder="19AAACJ6889M1ZO"
            />
          </div>
        </div>

        {/* Row 2: Full width address */}
        <div className="form-group" style={{ marginTop: '14px' }}>
          <label className="form-label">Registered Office Address</label>
          <input
            type="text"
            className="form-input"
            value={activePo.vendor?.['registered_address '] || activePo.vendor?.registered_address || ''}
            onChange={(e) => updateVendorField('registered_address ', e.target.value)}
            placeholder="4NO,RAJA WOODMOUNT STREET KOLKATA"
          />
        </div>
      </div>

      {/* SECTION 3: Confirmation & Terms */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
            <UserCheck size={18} color="#059669" />
            Confirmation & Terms
          </h2>
          <span className="badge badge-emerald">Terms & Status</span>
        </div>

        {/* Row 1: 2 columns */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Order Confirmed By</label>
            <input
              type="text"
              className="form-input"
              value={activePo.order_confirmed_by?.name || ''}
              onChange={(e) => updateConfirmationField('name', e.target.value)}
              placeholder="e.g. SANDEEP KUMAR DUBEY"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Other Terms & Conditions</label>
            <input
              type="text"
              className="form-input"
              value={activePo.other_terms_conditions || ''}
              onChange={(e) => updatePoField('other_terms_conditions', e.target.value)}
              placeholder="FOR TEST PO API"
            />
          </div>
        </div>

        {/* Row 2: 3 columns for Nullable items */}
        <div className="form-grid-3" style={{ marginTop: '14px' }}>
          {/* Warranty */}
          <div className="form-group">
            <div className="form-label">
              <span>Guarantee / Warranty</span>
              <span
                onClick={() => updatePoField('guranty_warranty', activePo.guranty_warranty === null ? '1 Year Standard' : null)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.725rem',
                  color: activePo.guranty_warranty === null ? '#64748b' : '#059669',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {activePo.guranty_warranty === null ? 'Set Text' : 'Set null'}
              </span>
            </div>
            {activePo.guranty_warranty === null ? (
              <div style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                background: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                color: '#b45309',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                border: '1px dashed #fcd34d'
              }}>
                null (No warranty)
              </div>
            ) : (
              <input
                type="text"
                className="form-input"
                value={activePo.guranty_warranty || ''}
                onChange={(e) => updatePoField('guranty_warranty', e.target.value)}
                placeholder="1 Year Standard Warranty"
              />
            )}
          </div>

          {/* Remarks */}
          <div className="form-group">
            <div className="form-label">
              <span>Order Remarks</span>
              <span
                onClick={() => updatePoField('order_remarks', activePo.order_remarks === null ? 'Urgent dispatch' : null)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.725rem',
                  color: activePo.order_remarks === null ? '#64748b' : '#059669',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {activePo.order_remarks === null ? 'Set Text' : 'Set null'}
              </span>
            </div>
            {activePo.order_remarks === null ? (
              <div style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                background: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                color: '#b45309',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                border: '1px dashed #fcd34d'
              }}>
                null (No remarks)
              </div>
            ) : (
              <input
                type="text"
                className="form-input"
                value={activePo.order_remarks || ''}
                onChange={(e) => updatePoField('order_remarks', e.target.value)}
                placeholder="Special delivery instructions"
              />
            )}
          </div>

          {/* Additional Remarks */}
          <div className="form-group">
            <div className="form-label">
              <span>Additional Remarks</span>
              <span
                onClick={() => updatePoField('order_add_remarks', activePo.order_add_remarks === null ? 'Standard Packing' : null)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.725rem',
                  color: activePo.order_add_remarks === null ? '#64748b' : '#059669',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {activePo.order_add_remarks === null ? 'Set Text' : 'Set null'}
              </span>
            </div>
            {activePo.order_add_remarks === null ? (
              <div style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                background: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                color: '#b45309',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                border: '1px dashed #fcd34d'
              }}>
                null (No additional remarks)
              </div>
            ) : (
              <input
                type="text"
                className="form-input"
                value={activePo.order_add_remarks || ''}
                onChange={(e) => updatePoField('order_add_remarks', e.target.value)}
                placeholder="Packaging and dispatch guidelines"
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: Order Variants & Indent Items */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
              <Layers size={18} color="#7c3aed" />
              Order Variants & Items ({activePo.order_variants?.length || 0})
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
              Item pricing, tax codes, and warehouse mapping
            </p>
          </div>

          <button
            onClick={handleAddVariant}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Add Line Item</span>
          </button>
        </div>

        {/* Variants List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activePo.order_variants?.map((variant, vIdx) => {
            const isExpanded = expandedVariants[vIdx] ?? true;
            const qty = parseFloat(variant.order_quantity) || 0;
            const unitPrice = parseFloat(variant.order_price) || 0;
            const gst = parseFloat(variant.product_gst) || 0;
            const subtotal = qty * unitPrice;
            const totalWithGst = subtotal * (1 + gst / 100);

            return (
              <div
                key={vIdx}
                style={{
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  overflow: 'hidden'
                }}
              >
                {/* Variant Header Card */}
                <div
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: '#ffffff',
                    borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                  }}
                  onClick={() => toggleVariantExpand(vIdx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#e0e7ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {vIdx + 1}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                        {variant.indent_product?.product_name || `Line Item #${vIdx + 1}`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                        ID: {variant.indent_product?.product_id || 'N/A'} • {variant.order_quantity} Qty
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
                      {activePo.vendor_currency || '₹'} {totalWithGst.toFixed(2)} (incl. GST)
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateVariant(vIdx);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px' }}
                      title="Duplicate this line item"
                    >
                      <Copy size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVariant(vIdx);
                      }}
                      className="btn btn-danger-ghost btn-sm"
                      style={{ padding: '3px 8px' }}
                      title="Remove this line item"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div style={{ color: '#64748b' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Variant Body */}
                {isExpanded && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc' }}>
                    
                    {/* Variant Pricing Row: 6 balanced columns */}
                    <div className="form-grid-6">
                      <div className="form-group">
                        <label className="form-label">Order Qty</label>
                        <input
                          type="text"
                          className="form-input"
                          value={variant.order_quantity || ''}
                          onChange={(e) => updateVariant(vIdx, 'order_quantity', e.target.value)}
                          placeholder="4.000"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Unit Price</label>
                        <input
                          type="text"
                          className="form-input"
                          value={variant.order_price || ''}
                          onChange={(e) => updateVariant(vIdx, 'order_price', e.target.value)}
                          placeholder="1.00"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">MRP</label>
                        <input
                          type="text"
                          className="form-input"
                          value={variant.order_mrp || ''}
                          onChange={(e) => updateVariant(vIdx, 'order_mrp', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Discount</label>
                        <input
                          type="text"
                          className="form-input"
                          value={variant.order_discount || ''}
                          onChange={(e) => updateVariant(vIdx, 'order_discount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">HSN Code</label>
                        <input
                          type="number"
                          className="form-input"
                          value={variant.product_hsn_code ?? ''}
                          onChange={(e) => updateVariant(vIdx, 'product_hsn_code', parseInt(e.target.value, 10) || 0)}
                          placeholder="8454"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">GST %</label>
                        <input
                          type="number"
                          className="form-input"
                          value={variant.product_gst ?? ''}
                          onChange={(e) => updateVariant(vIdx, 'product_gst', parseFloat(e.target.value) || 0)}
                          placeholder="18"
                        />
                      </div>
                    </div>

                    {/* Sub-card: Indent Product Details: 6 balanced columns */}
                    <div style={{
                      background: '#ffffff',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <Package size={14} color="#0891b2" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          Warehouse Indent Mapping
                        </span>
                      </div>

                      <div className="form-grid-6">
                        <div className="form-group">
                          <label className="form-label">Indent No</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.indent_product?.indent_number || ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'indent_number', e.target.value)}
                            placeholder="SA-IND-EMG-26-27-00109"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Product Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.indent_product?.product_name || ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'product_name', e.target.value)}
                            placeholder="Copper Tube"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Product ID</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.indent_product?.product_id || ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'product_id', e.target.value)}
                            placeholder="S01260080"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Sr. No</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.indent_product?.product_srno || ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'product_srno', e.target.value)}
                            placeholder="1"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            className="form-input"
                            value={variant.indent_product?.quantity ?? ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="4"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">User Code</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.indent_product?.user_code || ''}
                            onChange={(e) => updateIndentProduct(vIdx, 'user_code', e.target.value)}
                            placeholder="ERP"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
