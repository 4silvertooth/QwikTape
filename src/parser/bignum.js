const BigNum = BigDecimal || parseFloat;
const BigNumEnv = BigFloatEnv || {prec: 115}; //fall to 128bit precision if in RangeError

const groupMatcher = (grouping)=>{
  return new RegExp(`(?<!\\.\\d+)(?<=\\d)(?=(?:\\d{${grouping}})*\\d{${grouping ? 3 : 0}}(?:\\.|\$))`, 'g');
}

const locale = {
  thousandSeperator: '',
  decimalSeperator: '.',
  grouping: 0,
  decimalDigits: 2,
  groupMatcher: groupMatcher(0),
  numeralMatcher: /-?\d+(\.\d*)?|-?(\.\d+)/y,
};

BigNum.prototype.toLocaleString = function( decimalDigits = locale.decimalDigits){
  decimalDigits = Math.max(locale.decimalDigits, decimalDigits);
  const value = this.toFixed(decimalDigits);
  const groups = locale.groupMatcher;
  const splitVal = value.split(groups);
  splitVal[splitVal.length-1] = splitVal[splitVal.length-1].split('.').join(locale.decimalSeperator);
  return splitVal.join(locale.thousandSeperator);
}

//static function
BigNum.parseString = function(string){
  let unformat = locale.thousandSeperator ? string.replaceAll(locale.thousandSeperator, '') : string;
  unformat = unformat.replace(locale.decimalSeperator, '.');
  try{
    return BigNum(unformat);
  }
  catch(e){
    throw e;
  }
}

BigNum.prototype.toFixedDecimal = function(decimalDigits = locale.decimalDigits){
  return this.toFixed(decimalDigits);
}

BigNum.prototype.canTrimZeros = function(decimalDigits){
  const withGivenPrecision = this.toFixedDecimal(decimalDigits);
  const withFixedPrecision = this.toFixedDecimal();
  return BigNum(withGivenPrecision) == BigNum(withFixedPrecision);
}


BigNumEnv.initLocale = function(format){
  const match = /^\d{1,2}[^\d]?(\d{2,3})([^\d])?\d{3}([^\d])(\d+)$/m.exec(format);
  if(!match) {
    return locale; //falling to default locale if can't match the locale
  }
  const [_, grouping, thousandSeperator, decimalSeperator, decimalDigits] = match;
  locale.grouping = thousandSeperator ? grouping.length : 0;
  locale.thousandSeperator = thousandSeperator ?? '';
  locale.decimalSeperator = decimalSeperator;
  locale.decimalDigits = decimalDigits.length;
  locale.groupMatcher = groupMatcher(locale.grouping);
  if(locale.thousandSeperator === '') {
    locale.numeralMatcher = new RegExp(`-?(?:(?:\\d+)+(\\${locale.decimalSeperator}\\d*)?|(\\${locale.decimalSeperator}\\d+))`, 'y');
  }
  else {
    locale.numeralMatcher = new RegExp(`-?(?:(?:\\d+\\${locale.thousandSeperator}?)+(\\${locale.decimalSeperator}\\d*)?|(\\${locale.decimalSeperator}\\d+))`, 'y');
  }
  return locale;
}

BigNumEnv.getNumeralMatcher = function(){
  return locale.numeralMatcher;
}

BigNumEnv.setDecimalDigits = function(digits){
  locale.decimalDigits = digits;
}

BigNumEnv.getDecimalDigits = function(){
  return locale.decimalDigits;
}

export function withLocale(locale){
  BigNumEnv.initLocale(locale);
  return { BigNum, BigNumEnv };
}