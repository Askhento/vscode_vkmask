export function jsonPrettyArray(json : any, space : number = 2) {
  // todo 
  // need to keep decimal places 
  
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  const output = JSON.stringify(json, function(k,v) {
    if((v instanceof Array) && ( v.length > 0 ) && (typeof(v[0]) === "number" ))
      return JSON.stringify(v);
    return v;
  }, space).replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}')
        .replace(/\d,/g, '$& '); // add space in arrays with digits

  return output;
}