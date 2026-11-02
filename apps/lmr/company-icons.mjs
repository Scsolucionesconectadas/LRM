const svg = content => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
export const mailIcon = svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>');
export const whatsappIcon = svg('<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.2Z"/><path d="M8.2 7.3c-.7.4-.9 1.4-.7 2.2.7 2.8 2.6 4.7 5.4 5.6.9.3 1.8.1 2.3-.6l.6-1.1-2.2-1.1-.9.8c-1.4-.6-2.4-1.6-3-2.9l.7-1-1.1-2.2Z"/>');
export const qualityIcon = svg('<path d="M5 4h14v16H5zM8 9l2 2 5-5M8 16h8"/>');

const illustrations = {
  health: '<rect x="38" y="25" width="76" height="80" rx="5" fill="#e5f1fa"/><path d="M50 105V40h52v65M65 40V25h22v15M76 12v13m-6-7h12M61 54h8m14 0h8M61 68h8m14 0h8M61 82h8m14 0h8M70 105V93h12v12"/><rect x="121" y="59" width="26" height="38" rx="4" fill="#fff"/><path d="M128 69h12m-12 9h12m-12 9h7M115 71h6m-6 14h6M25 110h124"/>',
  water: '<path d="M39 46h87v55H39z" fill="#e5f1fa"/><path d="M28 101h111M39 46V33h87v68M45 62c9-8 16 8 25 0s16 8 25 0 16 8 25 0M45 78c9-8 16 8 25 0s16 8 25 0 16 8 25 0M56 33V17h29v16M108 33V18h24M132 18v27m-7-7 7 7 7-7"/><path d="M50 101v10m65-10v10M22 44h17"/><circle cx="26" cy="44" r="6" fill="#fff"/>',
  industry: '<path d="M25 103V55l32 14V45l33 15V27h18v76z" fill="#e5f1fa"/><path d="M25 103V55l32 14V45l33 15V27h18v76M20 108h126M38 82h8m18 0h8M38 94h8m18 0h8M90 18h18"/><rect x="115" y="66" width="28" height="37" rx="6" fill="#fff"/><path d="M116 79h26m-26 12h26M108 57h20v9M129 103v5"/>'
};

export function companyIllustration(kind) {
  if (!illustrations[kind]) throw new Error(`Ilustración de Empresa desconocida: ${kind}`);
  return `<svg class="company-technical-illustration" data-company-illustration="${kind}" viewBox="0 0 170 125" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${illustrations[kind]}</g><g fill="currentColor" opacity=".2"><circle cx="19" cy="23" r="3"/><circle cx="151" cy="47" r="3"/></g></svg>`;
}
