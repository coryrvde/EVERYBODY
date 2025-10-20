// Quick test script for your Telegram Bot
// Run this in your browser console or Node.js to test your bot

const BOT_TOKEN = '8368442573:AAGU1cZ6ylgFkpQ4wummVtKInbSZoc383rw';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Test 1: Get bot info
async function testBotInfo() {
    try {
        const response = await fetch(`${API_URL}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Bot Info:', data.result);
            return true;
        } else {
            console.error('❌ Bot Error:', data.description);
            return false;
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        return false;
    }
}

// Test 2: Get updates (to find your Chat ID)
async function getUpdates() {
    try {
        const response = await fetch(`${API_URL}/getUpdates`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('📨 Updates:', data.result);
            
            if (data.result.length > 0) {
                const latestUpdate = data.result[data.result.length - 1];
                if (latestUpdate.message) {
                    console.log('🔍 Your Chat ID:', latestUpdate.message.chat.id);
                    console.log('👤 From:', latestUpdate.message.from);
                }
            } else {
                console.log('📝 No messages yet. Send /start to your bot first!');
            }
            return data.result;
        } else {
            console.error('❌ Updates Error:', data.description);
            return null;
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        return null;
    }
}

// Test 3: Send a test message (replace CHAT_ID with your actual chat ID)
async function sendTestMessage(chatId) {
    try {
        const response = await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: '🤖 Hello! Your Guardian AI Bot is working perfectly!\n\nThis is a test message to verify the bot setup.'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Test message sent successfully!');
            return true;
        } else {
            console.error('❌ Send Error:', data.description);
            return false;
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🧪 Testing Telegram Bot...\n');
    
    // Test 1: Bot Info
    console.log('1️⃣ Testing Bot Info...');
    const botWorking = await testBotInfo();
    
    if (!botWorking) {
        console.log('❌ Bot is not working. Check your token.');
        return;
    }
    
    // Test 2: Get Updates
    console.log('\n2️⃣ Getting Updates (to find your Chat ID)...');
    const updates = await getUpdates();
    
    if (updates && updates.length > 0) {
        const chatId = updates[updates.length - 1].message?.chat?.id;
        if (chatId) {
            console.log('\n3️⃣ Sending Test Message...');
            await sendTestMessage(chatId);
        }
    }
    
    console.log('\n✅ Tests completed!');
}

// Run the tests
runTests();
