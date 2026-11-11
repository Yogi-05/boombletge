# Boompledge – Loan Creation Page

A lightweight, standalone recreation of the Boompledge loan creation screen based on the supplied reference screenshot.

## Run

1. Extract the project folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
3. No package installation, build step, framework, or internet connection is required.

For a local development server, you can optionally run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Included

- Dark Boompledge-style sidebar and responsive page layout.
- Loan item dialog with item type, description, gross weight, wastage, quantity, and value.
- Dynamic gross/wastage/net weight, quantity, value amount, and loan amount summary.
- Customer, Jewel, and optional ID image upload with preview, drag-and-drop, and camera capture hint.
- Loan details: loan amount, interest amount, overdue duration/date, interest type, and interest rate.
- Cash (Shop Bal) and Bank Bal payment modes, linked-account selector, and displayed balances.
- Customer phone, Aadhaar, name, relation type/name, and address fields.
- Highlighted red account information labels above Clear All and Complete Loan.
- Clear All confirmation and front-end validation on Complete Loan.

## Important integration note

This is a front-end-only demonstration. Bank names/balances are sample UI data, and completing the form does not create a real loan or transfer money. Connect the UI to your authenticated backend, real account balance API, owner-side Aadhaar verification process, and loan submission endpoint before production use. Do not treat the demo balance checks as financial authorization.
