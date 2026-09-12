import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/savebite"; 

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("DB connection failed");
        }

        // Create a fake user
        const fakeUserId = new mongoose.Types.ObjectId();
        await db.collection('users').insertOne({
            _id: fakeUserId,
            name: "Test Customer",
            email: "testcustomer" + Date.now() + "@example.com",
            phone: "9999999999",
            role: "user",
            isAuthenticated: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create a fake vendor application
        const fakeVendorId = new mongoose.Types.ObjectId();
        await db.collection('vendors').insertOne({
            _id: fakeVendorId,
            ownerId: fakeUserId,
            businessInfo: {
                businessName: "Dummy Restaurant",
                businessType: "Restaurant",
                place: "Test City"
            },
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create a fake order
        const fakeOrderId = new mongoose.Types.ObjectId();
        await db.collection('orders').insertOne({
            _id: fakeOrderId,
            customerId: fakeUserId,
            vendorId: fakeVendorId,
            totalAmount: 500,
            platformCommissionRate: 10,
            platformCommissionAmount: 50, // This is the platform revenue
            vendorAmount: 450,
            paymentStatus: "paid",
            orderStatus: "placed",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create an older order to populate the 7-day chart
        const olderDate = new Date();
        olderDate.setDate(olderDate.getDate() - 3);
        await db.collection('orders').insertOne({
            _id: new mongoose.Types.ObjectId(),
            customerId: fakeUserId,
            vendorId: fakeVendorId,
            totalAmount: 1000,
            platformCommissionRate: 10,
            platformCommissionAmount: 100, // Revenue
            vendorAmount: 900,
            paymentStatus: "paid",
            orderStatus: "placed",
            createdAt: olderDate,
            updatedAt: olderDate
        });

        console.log("Successfully seeded dummy data!");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
