const express=require('express');
require('dotenv').config();
const connectToDb = require('./db/connect.db.js');
const authRouter=require('./routes/auth.route.js');
const productRouter=require('./routes/products.route.js');
const userRouter=require('./routes/users.route.js');
const cartRouter=require('./routes/carts.route.js');
const orderRouter=require('./routes/orders.route.js');
const paymentRouter=require('./routes/payments.route.js');
const cookieParser=require('cookie-parser');
const checkUserToken=require('./middlewares/checkUserToken.middleware.js');


const app=express();
const PORT=3000;

//? The Middlewares Priority
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth',authRouter);
app.use(checkUserToken);
app.use('/api/product',productRouter);
app.use('/api/user',userRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/payment',paymentRouter);


//? Listening The Server
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectToDb();
});