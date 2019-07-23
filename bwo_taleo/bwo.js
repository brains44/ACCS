var libxmljs = require("libxmljs");
var xml = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">',
  '  <soap:Body>',
  '    <Response xmlns="http://tempuri.org/">',
  '      <Result>',
  '        <client xmlns="">',
  '          <msg>SEARCH OK.</msg>',
  '          <code>0</code>',
  '        </client>',
  '      </Result>',
  '    </Response>',
  '  </soap:Body>',
  '</soap:Envelope>'
].join('');
 
 
var doc = libxmljs.parseXml(xml);

console.log('-->soap:Envelope', doc.get('/soap:Envelope'));
// does not find element
 
console.log('-->soap:Envelope', doc.get('/soap:Envelope', {'soap':'http://schemas.xmlsoap.org/soap/envelope/'}));
// finds element

console.log('-->soap:Body', doc.get('//soap:Body', {'soap':'http://schemas.xmlsoap.org/soap/envelope/'}));
// finds element
 
console.log('-->Response', doc.get('//xmlns:Response', 'http://tempuri.org/'));
// finds element
 
console.log('-->Response', doc.get('//Response'));
// does not find element
 
console.log('-->Result', doc.get('//Result'));
// does not find element
 
console.log('-->client', doc.get('//client'));
// finds element
 
console.log('-->msg', doc.get('//msg'));
// finds element
 
console.log('-->xmlns:Result', doc.get('//xmlns:Result', 'http://tempuri.org/').get('//msg'));
// finds element