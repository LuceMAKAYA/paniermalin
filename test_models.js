const key = 'AIzaSyA--P7DRqYjd77FgCyv85G3nMDkseRxJMI';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(r => r.json())
  .then(j => {
    const models = j.models.map(m => m.name).join('\n');
    require('fs').writeFileSync('models.txt', models);
  })
  .catch(console.error);
