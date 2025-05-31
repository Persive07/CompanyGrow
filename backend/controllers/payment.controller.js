const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model'); // Adjust path as needed

// POST /api/payment/approve-badges
const approveBadges = async (req, res) => {
  try {
    const { managerId,employeeId, badgeIds } = req.body;
    
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark selected badges as approved
    user.performanceMetrics.forEach(metric => {
      metric.badgesEarned.forEach(badge => {
         const badgeId = `${metric.period}-${badge.type}-${badge.title}-${badge.dateEarned.toISOString()}`;
        if (badgeIds.includes(badgeId)) {
          badge.approved = true;
        }
      });
    });

    await user.save();
    res.json({ message: 'Badges approved successfully' });
    
  } catch (error) {
    console.error('Error approving badges:', error);
    res.status(500).json({ error: error.message });
  }
};



const createBonusSession = async (req, res) => {
  try {
    const { employeeId, employeeName, badges, badgeIds, totalAmount, managerId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Performance Bonus for ${employeeName}`,
            description: `Bonus payment for ${badges.length} badges earned`,
          },
          unit_amount: totalAmount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/manager/bonus-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/manager/bonus-failed`,
      metadata: {
        employeeId,
        employeeName,
        managerId,
        badgeCount: badges.length.toString(),
        totalAmount: totalAmount.toString(),
        badgeIds: JSON.stringify(badgeIds) // Store badge IDs
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating bonus session:', error);
    res.status(500).json({ error: error.message });
  }
};


const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  approveBadges,
  createBonusSession,
  getSessionDetails
};
