import { useCallback } from 'react';

const useLabelAbbreviation = (maxLength = 12) => {
  const abbreviateLabel = useCallback((raw) => {
    if (!raw || typeof raw !== 'string') return raw || '';
    const name = raw.replace(/\s+/g, ' ').trim();
    if (name.length <= maxLength) return name;
    
    const stopwords = new Set(['AND', 'OF', 'THE', 'PVT', 'PVT.', 'PRIVATE', 'LTD', 'LTD.', 'LIMITED', 'CO', 'COMPANY']);
    const words = name.split(' ').filter(Boolean);
    
    const initials = words
      .filter(w => !stopwords.has(w.toUpperCase()))
      .map(w => w[0].toUpperCase())
      .join('');
    
    if (initials.length >= 3 && initials.length <= maxLength) return initials;
    
    let out = '';
    for (let i = 0; i < words.length; i += 1) {
      const w = words[i];
      const chunk = (w.length > 6 ? w.slice(0, 6) + '.' : w) + (i < words.length - 1 ? ' ' : '');
      if ((out + chunk).length > maxLength - 1) break;
      out += chunk;
    }
    
    return out.trim().replace(/[ .]+$/, '') + '…';
  }, [maxLength]);

  const formatAxisValue = useCallback((value) => {
    if (typeof value !== 'number' || isNaN(value)) return value;
    
    const absValue = Math.abs(value);
    const isNegative = value < 0;
    const sign = isNegative ? '-' : '';
    
    if (absValue >= 10000000) {
      return sign + (absValue / 10000000).toFixed(1) + 'Cr';
    } else if (absValue >= 100000) {
      return sign + (absValue / 100000).toFixed(1) + 'L';
    } else if (absValue >= 1000) {
      return sign + (absValue / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  }, []);

  return { abbreviateLabel, formatAxisValue };
};

export default useLabelAbbreviation;

