import User from '../models/User.model.js';

const createStaticAdmin = async () => {
    try {
        const adminExists = await User.findOne({
            email: process.env.ADMIN_EMAIL,
            role: 'ADMIN'
        });

        if (adminExists) {
            console.log('✅ Static admin already exists');
            return;
        }

        await User.create({
            name: process.env.ADMIN_NAME || 'Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'ADMIN',
            isActive: true
        });

        console.log('🚀 Static admin created successfully');

    } catch (error) {
        console.error('❌ Error creating static admin:', error.message);
    }
};

export default createStaticAdmin;
