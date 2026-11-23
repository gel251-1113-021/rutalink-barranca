const l = require('./frontend/node_modules/lucide-react');
['X', 'Check', 'AlertCircle', 'Send', 'CheckCircle2', 'Car', 'Users', 'Volume2', 'Save', 'Radio'].forEach(k => {
  if (!l[k]) console.error('MISSING ICON:', k);
});
console.log('Icons checked successfully');
