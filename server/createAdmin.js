const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Assuming your model is named User and located in models/User.js
const User = require('./models/User'); 

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("Connected to MongoDB");

    try {
        const email = 'admin@sankalplr.com';
        const password = 'admin'; // You can change this to whatever initial password you want

        const existingAdmin = await User.findOne({ email });
        
        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'Admin',
            permissions: [], // Add default permissions if your schema requires format
            status: 'Active'
        });

        await newAdmin.save();
        console.log("Admin user created successfully!");

    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error("MongoDB connection error:", err);
});
