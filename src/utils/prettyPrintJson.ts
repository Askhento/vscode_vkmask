export function prettyPrintArray(json : any) {
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  const output = JSON.stringify(json, function(k,v) {
    if(v instanceof Array)
      return JSON.stringify(v);
    return v;
  }, 2).replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}');

  return output;
}