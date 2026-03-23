const key = 'AIzaSyA7d2cUvqfF1NTkrk-OTu-L2OUlOOV0S1A';
const model = 'gemini-2.5-flash';
fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
  method: 'POST', 
  headers: {'content-type': 'application/json'}, 
  body: JSON.stringify({contents: [{parts: [{text: 'Hello'}]}]})
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
