const express = require('express');
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Set the directory for your EJS templates
app.set('views', 'views');

app.get('/', (req, res) => {
  res.render('index', { name: 'Alice', age: 30 });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
