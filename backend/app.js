require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('Connecting to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


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


app.get('/', (req, res) => {
  res.send('CompanyGrow API');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});