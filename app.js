(() => {
  const $ = (id) => document.getElementById(id);
  const form = $('loanForm');
  const dialog = $('itemDialog');
  const itemForm = $('itemForm');
  const items = [];
  let toastTimer;

  const money = (value) => 'Rs. ' + Math.round(Number(value || 0)).toLocaleString('en-IN');
  const number = (id) => Number($(id).value || 0);
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  function updateSummary() {
    const gross = items.reduce((s, x) => s + x.gross * x.qty, 0);
    const waste = items.reduce((s, x) => s + x.wastage * x.qty, 0);
    const value = items.reduce((s, x) => s + x.value * x.qty, 0);
    const qty = items.reduce((s, x) => s + x.qty, 0);
    $('grossWeight').textContent = gross.toFixed(3) + 'g';
    $('wastage').textContent = waste.toFixed(3) + 'g';
    $('netWeight').textContent = Math.max(0, gross - waste).toFixed(3) + 'g';
    $('totalQty').textContent = qty;
    $('valueAmount').textContent = money(value);
    $('summaryLoanAmount').textContent = money(number('loanAmount'));
    $('disbursementLoanAmount').textContent = money(number('loanAmount'));
    $('emptyItems').classList.toggle('hidden', items.length > 0);
    $('itemsList').classList.toggle('hidden', items.length === 0);
    $('itemsList').innerHTML = items.map((x, i) => `<div class="item-row"><div><strong>${escapeHtml(x.type)}</strong><small>${escapeHtml(x.description || 'No description')}</small></div><div><strong>${x.gross.toFixed(3)}g</strong><small>Gross wt.</small></div><div><strong>${(x.gross-x.wastage).toFixed(3)}g</strong><small>Net wt.</small></div><div><strong>${x.qty}</strong><small>Quantity</small></div><button type="button" class="remove-item" data-remove="${i}" aria-label="Remove item">Remove</button></div>`).join('');
  }
  function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  $('addItemBtn').addEventListener('click', () => { itemForm.reset(); $('itemWastage').value = '0'; $('itemQty').value = '1'; dialog.showModal(); });
  $('closeDialog').addEventListener('click', () => dialog.close());
  $('cancelItem').addEventListener('click', () => dialog.close());
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = $('itemType').value, gross = Number($('itemGross').value), wastage = Number($('itemWastage').value || 0), qty = Number($('itemQty').value), value = Number($('itemValue').value);
    if (!type || gross <= 0 || wastage < 0 || wastage > gross || qty < 1 || value < 0 || !Number.isFinite(value)) { toast('Please enter valid item details. Wastage cannot exceed gross weight.'); return; }
    items.push({type, description:$('itemDescription').value.trim(), gross, wastage, qty, value});
    updateSummary(); dialog.close(); toast('Loan item added.');
  });
  $('itemsList').addEventListener('click', (e) => { const btn = e.target.closest('[data-remove]'); if (!btn) return; items.splice(Number(btn.dataset.remove),1); updateSummary(); toast('Item removed.'); });

  function updatePaymentMode() {
    const mode = document.querySelector('input[name="paymentMode"]:checked').value;
    $('cashOption').classList.toggle('selected', mode === 'cash');
    $('bankOption').classList.toggle('selected', mode === 'bank');
    $('bankAccountWrap').classList.toggle('hidden', mode !== 'bank');
    $('cashNotice').classList.toggle('hidden', mode !== 'cash');
  }
  document.querySelectorAll('input[name="paymentMode"]').forEach(r => r.addEventListener('change', updatePaymentMode));
  $('bankAccount').addEventListener('change', () => {
    const option = $('bankAccount').selectedOptions[0];
    $('selectedBankBalance').textContent = 'Available balance: ₹' + Number(option.dataset.balance).toLocaleString('en-IN');
  });
  $('loanAmount').addEventListener('input', updateSummary);
  $('customerName').addEventListener('input', () => { $('disbursementCustomerName').textContent = $('customerName').value.trim() || 'Enter customer name above'; });
  $('gpayNumber').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
  $('galleryUpload').addEventListener('click', () => document.querySelectorAll('.upload-card input').forEach(input => input.click()));

  document.querySelectorAll('.upload-card').forEach(card => {
    const input = card.querySelector('input');
    card.querySelector('.upload-btn').addEventListener('click', () => input.click());
    card.querySelector('.camera-btn').addEventListener('click', () => { input.setAttribute('capture','environment'); input.click(); });
    input.addEventListener('change', () => showImage(card, input.files[0]));
    card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('dragover'); });
    card.addEventListener('dragleave', () => card.classList.remove('dragover'));
    card.addEventListener('drop', e => { e.preventDefault(); card.classList.remove('dragover'); const file=e.dataTransfer.files[0]; if(file && file.type.startsWith('image/')) showImage(card,file); else toast('Please drop an image file.'); });
  });
  function showImage(card, file) {
    if (!file) return; if (!file.type.startsWith('image/')) { toast('Please choose an image file.'); return; }
    const old = card.querySelector('img'); if(old) old.remove();
    const img = document.createElement('img'); img.alt = card.dataset.photo + ' photo preview'; img.src = URL.createObjectURL(file); card.appendChild(img); card.classList.add('has-image');
  }

  $('clearAll').addEventListener('click', () => {
    if (!confirm('Clear all loan details, customer information, items and selected photos?')) return;
    form.reset(); $('disbursementCustomerName').textContent = 'Enter customer name above'; items.splice(0, items.length); updateSummary();
    document.querySelectorAll('.upload-card').forEach(card => { const img=card.querySelector('img'); if(img){URL.revokeObjectURL(img.src);img.remove();} card.classList.remove('has-image'); card.querySelector('input').value=''; });
    document.querySelector('input[name="paymentMode"][value="bank"]').checked = true; updatePaymentMode();
    $('selectedBankBalance').textContent = 'Available balance: ₹98,000'; toast('Form cleared.');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = $('phone').value.replace(/\D/g,'');
    const aadhaar = $('aadhaar').value.replace(/\D/g,'');
    if (items.length === 0) { toast('Add at least one loan item before completing the loan.'); $('addItemBtn').focus(); return; }
    if (number('loanAmount') <= 0) { toast('Enter a valid loan amount.'); $('loanAmount').focus(); return; }
    if (phone && phone.length !== 10) { toast('Enter a valid 10-digit phone number.'); $('phone').focus(); return; }
    if (aadhaar.length !== 12) { toast('Enter the 12-digit Aadhaar number.'); $('aadhaar').focus(); return; }
    const customerName = $('customerName').value.trim();
    const gpayNumber = $('gpayNumber').value.replace(/\D/g, '');
    if (!customerName) { toast('Enter the customer name for loan disbursement.'); $('customerName').focus(); return; }
    if (!/^[6-9][0-9]{9}$/.test(gpayNumber)) { toast('Enter a valid 10-digit Indian mobile number linked to GPay.'); $('gpayNumber').focus(); return; }
    const mode = document.querySelector('input[name="paymentMode"]:checked').value;
    if (mode === 'bank') {
      const selected = $('bankAccount').selectedOptions[0];
      if (number('loanAmount') > Number(selected.dataset.balance)) { toast('Loan amount exceeds the selected account balance.'); return; }
    } else if (number('loanAmount') > 161525) { toast('Loan amount exceeds the displayed shop balance.'); return; }
    const summary = {items:items.length, loanAmount:number('loanAmount'), paymentMode:mode, bank:mode==='bank' ? $('bankAccount').selectedOptions[0].textContent : null, customer:customerName, gpayNumber};
    console.info('Loan form demo submission:', summary);
    alert('Front-end validation successful!\n\nThis is a standalone UI demo. Connect your backend/API to save the loan permanently.');
  });
  $('collapseSidebar').addEventListener('click', () => $('sidebar').classList.toggle('collapsed'));
  $('mobileMenu').addEventListener('click', () => $('sidebar').classList.toggle('mobile-open'));
  $('disbursementCustomerName').textContent = '—';
  updateSummary(); updatePaymentMode();
})();
