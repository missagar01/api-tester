// Exact sample JSON provided by the user
export const INITIAL_PO_DATA = [
  {
    "po_number": "O-SRML-26-00010/01",
    "rfq_id": "SRML-26-00010",
    "rfq_date": "2026-10-12",
    "order_total_amount": "4.72",
    "order_price_basis": "Ex",
    "order_payment_term": "Adv",
    "order_delivery_period": 2,
    "guranty_warranty": null,
    "vendor_currency": "\u20b9",
    "order_remarks": null,
    "order_add_remarks": null,
    "other_terms_conditions": "FOR TEST PO API",
    "vendor": {
      "legal_name": "JAY MARKET CREATORS PVT LIMITED",
      "email": "sm@malooindia.com",
      "registered_address ": "4NO,RAJA WOODMOUNT STREET KOLKATA",
      "gstin": "19AAACJ6889M1ZO"
    },
    "order_confirmed_by": {
      "name": "SANDEEP KUMAR DUBEY"
    },
    "order_variants": [
      {
        "po_number": "O-SRML-26-00010/01",
        "order_quantity": "4.000",
        "order_mrp": "0.00",
        "order_discount": "0.00",
        "order_price": "1.00",
        "product_hsn_code": 8454,
        "product_gst": 18,
        "indent_product": {
          "indent_number": "SA-IND-EMG-26-27-00109",
          "product_srno": "1",
          "product_id": "S01260080",
          "product_name": "Copper Tube",
          "quantity": 4,
          "user_code": "ERP"
        }
      }
    ]
  }
];

export const createBlankVariant = (poNumber = "") => ({
  po_number: poNumber,
  order_quantity: "1.000",
  order_mrp: "0.00",
  order_discount: "0.00",
  order_price: "100.00",
  product_hsn_code: 8481,
  product_gst: 18,
  indent_product: {
    indent_number: "IND-NEW-001",
    product_srno: "1",
    product_id: "P001",
    product_name: "New Item",
    quantity: 1,
    user_code: "ERP"
  }
});

export const createBlankPO = () => {
  const dateStr = new Date().toISOString().split("T")[0];
  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const poNum = `O-SRML-26-000${uniqueId}/01`;

  return {
    po_number: poNum,
    rfq_id: `SRML-26-000${uniqueId}`,
    rfq_date: dateStr,
    order_total_amount: "118.00",
    order_price_basis: "Ex",
    order_payment_term: "Adv",
    order_delivery_period: 7,
    guranty_warranty: null,
    vendor_currency: "₹",
    order_remarks: null,
    order_add_remarks: null,
    other_terms_conditions: "STANDARD TERMS APPLY",
    vendor: {
      legal_name: "",
      email: "",
      "registered_address ": "",
      gstin: ""
    },
    order_confirmed_by: {
      name: ""
    },
    order_variants: [
      createBlankVariant(poNum)
    ]
  };
};
