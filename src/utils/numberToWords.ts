const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertGroup(n % 100) : '');
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Taka Only';
  
  const num = Math.floor(amount);
  const decimal = Math.round((amount - num) * 100);
  
  let result = '';
  
  if (num >= 10000000) {
    result += convertGroup(Math.floor(num / 10000000)) + ' Crore ';
  }
  if (num >= 100000) {
    result += convertGroup(Math.floor((num % 10000000) / 100000)) + ' Lakh ';
  }
  if (num >= 1000) {
    result += convertGroup(Math.floor((num % 100000) / 1000)) + ' Thousand ';
  }
  if (num >= 100) {
    result += convertGroup(Math.floor((num % 1000) / 100)) + ' Hundred ';
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
