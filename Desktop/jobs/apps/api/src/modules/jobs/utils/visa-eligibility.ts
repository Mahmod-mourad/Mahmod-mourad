import { RawJob } from '@nexahire/types';

export function tagVisaEligibility(raw: RawJob, location: string | null): string[] {
  const tags: string[] = [];
  
  // 1. Check direct visa sponsorship flags
  if (raw.visa_sponsorship === true || raw.has_visa_sponsorship === true) {
    tags.push('Visa Sponsorship');
  }

  // 2. Location-based rules
  if (location) {
    const locLower = location.toLowerCase();
    
    // Netherlands HSM (Highly Skilled Migrant)
    // No degree required. Under 30: ~€3,909/mo (2025 thresholds).
    if (locLower.includes('netherlands') || locLower.includes('amsterdam') || locLower.includes('nl')) {
      tags.push('NL HSM Eligible');
    }

    // Germany EU Blue Card (IT specialist without degree)
    // 3 years IT experience. Lower threshold: ~€45,934/year (2025).
    if (locLower.includes('germany') || locLower.includes('berlin') || locLower.includes('munich') || locLower.includes('münchen') || locLower.includes('de')) {
      tags.push('DE Blue Card Eligible');
    }
    
    // Gulf
    if (locLower.includes('dubai') || locLower.includes('uae') || locLower.includes('saudi') || locLower.includes('riyadh')) {
      tags.push('Gulf Iqama/Visa');
    }
  }

  return tags;
}
