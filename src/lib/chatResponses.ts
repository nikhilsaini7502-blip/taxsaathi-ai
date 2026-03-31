import type { AppMode } from '../context/ModeContext';

export function replyForQuestion(text: string, mode: AppMode): string {
  const q = text.toLowerCase();

  if (/80c|eight zero|section\s*80/.test(q)) {
    return mode === 'genz'
      ? '80C cap = ₹1.5L/year — ELSS, PPF, EPF (employee), tuition, LIC, etc. Tumne full use kiya? Nahi to IT Dept ko free mein treat de rahe ho 💀 Diversify but stay under cap.'
      : 'Section 80C allows deductions up to ₹1,50,000 per financial year for specified investments and expenses (e.g., ELSS, PPF, EPF employee contribution, life insurance premiums, tuition fees). Contributions beyond the limit do not yield additional deduction.';
  }

  if (/hra|house rent|rent/.test(q)) {
    return mode === 'genz'
      ? 'HRA exemption = min(actual HRA, rent − 10% of basic, 50%/40% of basic metro/non-metro). Rent agreement + receipts rakho warna “maine bola tha” se kaam nahi chalega.'
      : 'House Rent Allowance exemption under Section 10(13A) is the least of: (1) HRA received, (2) rent paid minus 10% of salary (basic + DA), or (3) 50% of salary in metro cities / 40% elsewhere. Maintain rent receipts and, where applicable, a registered agreement.';
  }

  if (/new regime|new tax|115bac/.test(q)) {
    return mode === 'genz'
      ? 'New regime = simpler slabs, higher standard deduction, but bye-bye most deductions (80C, HRA kinda vibes differ). Old vs new = Excel warrior moment — hamara calculator dekh lo, number bolenge sach.'
      : 'The new tax regime offers revised slabs and a higher standard deduction for salaried taxpayers, with most Chapter VI-A deductions unavailable. Whether it is beneficial depends on your salary structure, rent, and investments. Use the calculator on this page for a side-by-side estimate.';
  }

  if (/old regime/.test(q)) {
    return mode === 'genz'
      ? 'Old regime = deductions ka buffet 🍱 — 80C, HRA exemption, etc. Trade-off: slabs thode stiff. Pro move: compare dono regimes every year.'
      : 'The old/existing regime permits deductions such as Section 80C and HRA exemption (where applicable), with traditional slab rates. Annual comparison with the new regime is recommended as outcomes are taxpayer-specific.';
  }

  if (/tds|withhold/.test(q)) {
    return mode === 'genz'
      ? 'TDS = pehle hi kaat liya jaata hai taaki year-end pe shock na ho. Form 26AS check karo — agar zyada kata hai to refund, kam kata hai to bachaoge nahi to demand notice aayega.'
      : 'Tax Deducted at Source (TDS) is withheld by payers on specified incomes. Reconcile TDS with Form 26AS and AIS. Excess TDS may be refunded via ITR; shortfall may require advance tax or self-assessment payment.';
  }

  if (/itr|return|file/.test(q)) {
    return mode === 'genz'
      ? 'ITR file karna = closure arc 🎬 Pick the right ITR form, match AIS/26AS, claim exemptions properly. Deadline miss = interest + drama — avoid.'
      : 'Select the appropriate ITR form based on income sources, reconcile third-party data (AIS/26AS), and file within the due date to avoid interest under Sections 234A/B/C and late fees where applicable.';
  }

  if (/tax|save|deduct/.test(q)) {
    return mode === 'genz'
      ? 'Tax planning ≠ last-minute panic scrolling. 80C kholo, HRA proofs stack karo, regime compare karo. Main hoon na — niche calculator se old vs new dekh lo, phir chill (legally).'
      : 'Effective tax planning involves timing investments, utilizing eligible deductions within statutory limits, and comparing tax regimes. The tools below help estimate liability and unused deduction headroom.';
  }

  return mode === 'genz'
    ? 'Hmm, thoda vague — but okay main flex: regimes compare karo, 80C max out socho, HRA proofs tight rakho. Specific sawaal? ‘HRA’, ‘80C’, ‘new regime’ type karke dubara try karo. Main yahin hoon ✨'
    : 'For tailored guidance, please ask about a specific topic (for example, HRA, Section 80C, old versus new regime, or TDS). This assistant provides general information only and is not a substitute for professional tax advice.';
}
