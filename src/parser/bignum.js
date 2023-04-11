const BigNum = BigDecimal || parseFloat;
const BigNumEnv = BigFloatEnv || {prec: 128}; //fall to 128bit precision if in RangeError
const NUMBER_LOCALE_STRING = 1234567.89.toLocaleString();

const groupMatcher = (grouping)=>{
  return new RegExp(`(?<!\\.\\d+)(?<=\\d)(?=(?:\\d{${grouping}})*\\d{${grouping ? 3 : 0}}(?:\\.|\$))`, 'g');
}

const locale = {
  thousandSeperator: '',
  decimalSeperator: '.',
  grouping: 0,
  decimalDigits: 2,
  groupMatcher: groupMatcher(0),
  formatString: '1234567.89',
  numeralMatcher: /-?\d+(\.\d*)?|-?(\.\d+)/y,
};

BigNum.prototype.toLocaleString = function(decimalDigits = locale.decimalDigits){
  decimalDigits = Math.max(locale.decimalDigits, decimalDigits);
  const value = this.toFixed(decimalDigits);
  const splitVal = value.split(locale.groupMatcher);
  splitVal[splitVal.length-1] = splitVal[splitVal.length-1].split('.').join(locale.decimalSeperator);
  return splitVal.join(locale.thousandSeperator);
}

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

BigNumEnv.initLocale = function(format = NUMBER_LOCALE_STRING){
  const newLocale = BigNumEnv.getLocale(format);

  if(newLocale == null) {
    return locale;
  }  

  Object.assign(locale, newLocale);
  return locale;
}

BigNumEnv.getLocale = function(format){
  const match = /^\d{1,2}[^\d]?(\d{2,3})([^\d])?\d{3}([^\d])(\d+)$/m.exec(format);
  if(!match) {
    return null;
  }
  const newLocale = {};
  const [_, grouping, thousandSeperator, decimalSeperator, decimalDigits] = match;
  newLocale.grouping = thousandSeperator ? grouping.length : 0;
  newLocale.thousandSeperator = thousandSeperator ?? '';
  newLocale.decimalSeperator = decimalSeperator;
  newLocale.decimalDigits = decimalDigits.length;
  newLocale.groupMatcher = groupMatcher(newLocale.grouping);
  newLocale.formatString = format;
  newLocale.numeralMatcher = (newLocale.thousandSeperator === '') ? 
    new RegExp(`-?(?:(?:\\d+)+(\\${newLocale.decimalSeperator}\\d*)?|(\\${newLocale.decimalSeperator}\\d+))`, 'y')
    : new RegExp(`-?(?:(?:\\d+\\${newLocale.thousandSeperator}?)+(\\${newLocale.decimalSeperator}\\d*)?|(\\${newLocale.decimalSeperator}\\d+))`, 'y');
  
  return newLocale;
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

BigNumEnv.getLocaleFormat = function(){
  if(locale.formatString)
    return locale.formatString;
  return null;
}

export { BigNum, BigNumEnv, locale, NUMBER_LOCALE_STRING  };