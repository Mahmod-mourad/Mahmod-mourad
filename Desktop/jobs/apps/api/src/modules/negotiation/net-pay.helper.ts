export function calculateNetPay(grossAnnual: number, country: 'NL' | 'DE' | 'GULF', is30PercentRuling: boolean = false): number {
  if (country === 'GULF') {
    // 0% income tax
    return grossAnnual;
  }

  if (country === 'NL') {
    // Very rough proxy for NL
    if (is30PercentRuling) {
      // 30% tax free, remaining 70% taxed at approx 36.93% (up to bracket) -> effective ~26%
      return grossAnnual * 0.74;
    }
    // Approx 30-40% effective tax depending on bracket
    return grossAnnual * 0.65;
  }

  if (country === 'DE') {
    // Proxy for DE Tax Class 1 (approx 35-42% effective deduction including social security)
    return grossAnnual * 0.60;
  }

  return grossAnnual;
}
