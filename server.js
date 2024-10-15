const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

// Connect to MongoDB
const mongoURI = 'mongodb+srv://itschauhan:Chauhan5769@cluster0.4dtbb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
    username: String,
    address: String,
    phoneNumber: String,
    emailAddress: String
});

const orderSchema = new mongoose.Schema({
    orderId: Number,
    productId: Number,
    orderedOn: String,
    userId: Number
});

const productSchema = new mongoose.Schema({
    productId: Number,
    name: String,
    price: Number
});
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);

// 1. API for insert operation on user - POST /api/v1/users
app.post('/api/v1/users', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
});

// 2. API for insert operation on user Order - POST /api/v1/orders
app.post('/api/v1/orders', async (req, res) => {
    const { userId, productId, orderId, orderedOn } = req.body;

    // Check if userId exists
    const userExists = await User.findById(userId);
    if (!userExists) {
        return res.status(400).json({ error: 'User ID does not exist.' });
    }

    // Check if productId exists
    const productExists = await Product.findOne({ productId: productId });
    if (!productExists) {
        return res.status(400).json({ error: 'Product ID does not exist.' });
    }

    const newOrder = new Order({ userId, productId, orderId, orderedOn });
    await newOrder.save();
    res.status(201).json(newOrder);
});

// 3. API to create product - POST /api/v1/products
app.post('/api/v1/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

// 4. API to fetch the list of orders based on filters - GET /api/v1/orders
app.get('/api/v1/orders', async (req, res) => {
    const { address, productId, orderedOn, userId } = req.query;
    
    let filter = {};
    
    if (userId) {
        filter.userId = userId;
    }
    
    const orders = await Order.find(filter).populate('userId');
    
    const filteredOrders = orders.filter(order => {
        if (address && order.userId.address !== address) return false;
        if (productId && order.productId !== productId) return false;
        if (orderedOn && order.orderedOn !== orderedOn) return false;
        return true;
    });

    res.json(filteredOrders);
});

// Start the server
const PORT =  9000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});