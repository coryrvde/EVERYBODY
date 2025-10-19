const express = require('express');
const router = express.Router();
const { telegramBotService } = require('../../app/services/telegramBotService');

/**
 * Telegram Webhook Endpoint
 * This endpoint receives real-time updates from Telegram
 */
router.post('/telegram-webhook', async (req, res) => {
  try {
    console.log('📱 Received Telegram webhook:', req.body);

    const update = req.body;

    // Handle different types of updates
    if (update.message) {
      await telegramBotService.processMessage(update.message);
    } else if (update.edited_message) {
      await telegramBotService.processMessage(update.edited_message);
    } else if (update.callback_query) {
      // Handle callback queries (button presses)
      console.log('🔘 Callback query received:', update.callback_query);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Error processing Telegram webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Health check endpoint
 */
router.get('/telegram-health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'telegram-webhook',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
