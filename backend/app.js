require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// API routes
const authRoute = require('./routes/auth.route');
app.use('/api/auth', authRoute);

const userRoute = require('./routes/user.route');
app.use('/api/user', userRoute);

const courseRoute = require('./routes/course.route');
app.use('/api/course', courseRoute);

const projectRoute = require('./routes/project.route');
app.use('/api/project', projectRoute);

const paymentRoute = require('./routes/payment.route');
app.use('/api/payment', paymentRoute);

// Serve static files from React build (PRODUCTION ONLY)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('CompanyGrow API');
  });
}

// Use process.env.PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
