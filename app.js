const express = require("express")
const app = express();
const PORT = 8000;
const router = require('./routes/routes');

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Routes
app.use('', router);

app.listen(PORT, console.log(`Server is listening on port ${PORT}...`));