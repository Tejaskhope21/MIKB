import cron from 'node-cron';
import Product from '../models/Product.model';

cron.schedule('0 * * * *', async () => {
    await Product.updateMany(
        {
            'hotDeal.isApproved': true,
            'hotDeal.expiresAt': { $lte: new Date() }
        },
        {
            $set: {
                'hotDeal.isApproved': false,
                'hotDeal.priority': 0
            }
        }
    );

    console.log('Expired hot deals removed');
});
