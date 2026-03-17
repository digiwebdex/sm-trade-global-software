const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertGroup(n % 100) : '');
}

export function numberToWords(amount: number | string): string {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!parsed || isNaN(parsed) || parsed === 0) return 'Zero Taka Only';
  
  const num = Math.floor(parsed);
  const decimal = Math.round((parsed - num) * 100);
  
  let result = '';
  
  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    result += convertGroup(crore) + ' Crore ';
  }
  const lakh = Math.floor((num % 10000000) / 100000);
  if (lakh > 0) {
    result += convertGroup(lakh) + ' Lakh ';
  }
  const thousand = Math.floor((num % 100000) / 1000);
  if (thousand > 0) {
    result += convertGroup(thousand) + ' Thousand ';
  }
  const hundred = Math.floor((num % 1000) / 100);
  if (hundred > 0) {
    result += convertGroup(hundred) + ' Hundred ';
  }
  const remainder = num % 100;
  if (remainder > 0) {
    result += convertGroup(remainder) + ' ';
  }
  
  result = result.trim() + ' Taka';
  
  if (decimal > 0) {
    result += ' and ' + convertGroup(decimal) + ' Paisa';
  }
  
  return result + ' Only';
}
