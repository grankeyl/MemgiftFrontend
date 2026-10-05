export const obfuscateAddress = (address?: string | null) => {
    if (!address || typeof address !== 'string') return '';
    const cleaned = address.trim();
    if (!cleaned) return '';
    if (cleaned.length <= 10) return cleaned;
    return `${cleaned.slice(0, 4)}...${cleaned.slice(-4)}`;
};

export const cutNumber = (num: string, decimals = 2) => {
  let str = String(num);

  if (str.includes('.')) {
    let [int, frac] = str.split('.');
    frac = frac.slice(0, decimals);
    return decimals > 0 ? int + '.' + frac.padEnd(decimals, '0') : int;
  } else {
    return decimals > 0 ? str + '.' + '0'.repeat(decimals) : str;
  }
}

export const cutNumberNano = (num: any, decimals = 2) => {
  let str = parseFloat(num) / 1000000000;
  let str_price = String(str);

  if (str_price.includes('.')) {
    let [int, frac] = str_price.split('.');
    frac = frac.slice(0, decimals);
    return decimals > 0 ? int + '.' + frac.padEnd(decimals, '0') : int;
  } else {
    return decimals > 0 ? str_price + '.' + '0'.repeat(decimals) : str_price;
  }
}