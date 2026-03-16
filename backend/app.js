// Roman Urdu: Express.js backend API for food ordering
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Roman Urdu: Environment variables load karo
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Roman Urdu: Middleware
app.use(cors());
app.use(express.json());

// Roman Urdu: MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected - MongoDB connect ho gaya'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Roman Urdu: Food Item Schema
const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
    discount: { type: Number, default: 0 }
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// Roman Urdu: Order Schema
const orderSchema = new mongoose.Schema({
    items: [{
        foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    orderStatus: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// ============ API Routes ============

// Roman Urdu: Home route - API testing ke liye
app.get('/', (req, res) => {
    res.json({ 
        message: '🍕 FlavorFusion API chal raha hai!', 
        status: 'online',
        timestamp: new Date()
    });
});

// Roman Urdu: Health check for Kubernetes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Roman Urdu: Readiness check for Kubernetes
app.get('/ready', (req, res) => {
    // Roman Urdu: Check if database is connected
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(503).json({ status: 'not ready', dbState });
    }
});

// Roman Urdu: GET all food items
app.get('/api/food-items', async (req, res) => {
    try {
        const items = await FoodItem.find({ isAvailable: true });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: GET single food item by ID
app.get('/api/food-items/:id', async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item nahi mila' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: CREATE new food item (admin ke liye)
app.post('/api/food-items', async (req, res) => {
    try {
        const newItem = new FoodItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Roman Urdu: UPDATE food item
app.put('/api/food-items/:id', async (req, res) => {
    try {
        const updatedItem = await FoodItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item nahi mila' });
        }
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Roman Urdu: DELETE food item
app.delete('/api/food-items/:id', async (req, res) => {
    try {
        const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item nahi mila' });
        }
        res.json({ message: 'Item delete ho gaya' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: CREATE new order
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        
        // Roman Urdu: Order confirmation ke liye (SMS ya email bhej sakte hain)
        console.log(`📦 New order received: ${newOrder._id}`);
        
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Roman Urdu: GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.foodItem').sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: GET single order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.foodItem');
        if (!order) {
            return res.status(404).json({ message: 'Order nahi mila' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: UPDATE order status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order nahi mila' });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Roman Urdu: Get order statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        
        // Roman Urdu: Total revenue calculate karo
        const orders = await Order.find({ orderStatus: 'delivered' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        res.json({
            totalOrders,
            pendingOrders,
            deliveredOrders,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Roman Urdu: Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Kuchh error aa gaya!', error: err.message });
});

// Roman Urdu: 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route nahi mila' });
});

// Roman Urdu: Server start karo
app.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
});
