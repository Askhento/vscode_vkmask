export function jsonPrettyArray(json : any, space : string = "\t") {
  // todo 
  // need to keep decimal places 
  
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  const output = JSON.stringify(json, function(k,v) {
    if((v instanceof Array) && ( v.length > 0 ) && (typeof(v[0]) === "number" ))
      return JSON.stringify(v).replace(/(?<![.])\b\d+\b(?!\.[0-9])/g, '$&.0'); // add deciaml trailling zero
    return v;
  }, space)
        .replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}')
        .replace(/\d,/g, '$& '); // add space in arrays with digit


  return output;
}

export function padTo2Digits(num : number, count : number = 2) {
  return num.toString().padStart(count, '0');
}
