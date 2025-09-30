/**
 * Telegram Notifications System for Tank Tools
 * Sends notifications to admin when new users register
 */

class TelegramNotifications {
    constructor() {
        // Telegram Bot Configuration
        this.BOT_TOKEN = '8029434936:AAH6r1qwOCNXmHOfCaGe0qvMRoI1ZD_0SNk';
        this.ADMIN_CHAT_ID = '835232942'; // Your Chat ID
        this.TELEGRAM_API = `https://api.telegram.org/bot${this.BOT_TOKEN}`;
        
        // Initialize admin chat ID
        this.initializeAdminChatId();
    }

    /**
     * Initialize admin chat ID from localStorage or detect from recent messages
     */
    async initializeAdminChatId() {
        try {
            // Try to get saved admin chat ID
            const savedChatId = localStorage.getItem('telegram_admin_chat_id');
            if (savedChatId) {
                this.ADMIN_CHAT_ID = savedChatId;
                console.log('🔔 Telegram Admin Chat ID loaded:', this.ADMIN_CHAT_ID);
                return;
            }

            // If not saved, try to get from recent bot messages
            await this.detectAdminChatId();
        } catch (error) {
            console.error('❌ Error initializing Telegram Admin Chat ID:', error);
        }
    }

    /**
     * Detect admin chat ID from recent bot interactions
     */
    async detectAdminChatId() {
        try {
            const response = await fetch(`${this.TELEGRAM_API}/getUpdates`);
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                // Get the most recent chat ID (assuming admin is the one testing)
                const lastMessage = data.result[data.result.length - 1];
                const chatId = lastMessage.message.chat.id;
                
                this.ADMIN_CHAT_ID = chatId;
                localStorage.setItem('telegram_admin_chat_id', chatId);
                
                console.log('🔔 Telegram Admin Chat ID detected and saved:', chatId);
            } else {
                console.warn('⚠️ No recent Telegram messages found. Admin needs to send a message to the bot first.');
            }
        } catch (error) {
            console.error('❌ Error detecting admin chat ID:', error);
        }
    }

    /**
     * Format date for notifications (Gregorian calendar)
     */
    formatDate(date = new Date()) {
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Send notification to admin about new user registration
     */
    async sendNewUserNotification(userData) {
        if (!this.ADMIN_CHAT_ID) {
            console.warn('⚠️ Telegram Admin Chat ID not set. Skipping notification.');
            return false;
        }

        try {
            const message = this.buildNewUserMessage(userData);
            
            const response = await fetch(`${this.TELEGRAM_API}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                    disable_web_page_preview: false
                })
            });

            const data = await response.json();
            
            if (data.ok) {
                console.log('✅ Telegram notification sent successfully for user:', userData.displayName);
                return true;
            } else {
                console.error('❌ Failed to send Telegram notification:', data.description);
                return false;
            }
        } catch (error) {
            console.error('❌ Error sending Telegram notification:', error);
            return false;
        }
    }

    /**
     * Build formatted message for new user notification
     */
    buildNewUserMessage(userData) {
        const currentDate = this.formatDate();
        const adminPanelUrl = `${window.location.origin}/admin-panel.html`;

        return `🔔 <b>مستخدم جديد - Tank Tools</b>

👤 <b>الاسم:</b> ${userData.displayName || 'غير محدد'}
🏢 <b>القسم:</b> ${userData.department || 'غير محدد'}
📧 <b>الإيميل:</b> ${userData.email || 'غير محدد'}
📱 <b>الهاتف:</b> ${userData.phone || 'غير محدد'}
📅 <b>تاريخ التسجيل:</b> ${currentDate}

⚠️ <b>يحتاج تفعيل الحساب</b>

لتفعيل الحساب، ادخل على:
👉 <a href="${adminPanelUrl}">لوحة التحكم</a>

#مستخدم_جديد #تفعيل_مطلوب`;
    }

    /**
     * Send test notification
     */
    async sendTestNotification() {
        const testUser = {
            displayName: 'أحمد محمد العلي (اختبار)',
            department: 'PBCR',
            email: 'test@example.com',
            phone: '+965 1234 5678'
        };

        return await this.sendNewUserNotification(testUser);
    }

    /**
     * Verify bot connection
     */
    async verifyBot() {
        try {
            const response = await fetch(`${this.TELEGRAM_API}/getMe`);
            const data = await response.json();
            
            if (data.ok) {
                console.log('✅ Telegram Bot verified:', data.result.first_name);
                return true;
            } else {
                console.error('❌ Bot verification failed:', data.description);
                return false;
            }
        } catch (error) {
            console.error('❌ Error verifying bot:', error);
            return false;
        }
    }

    /**
     * Manually set admin chat ID
     */
    setAdminChatId(chatId) {
        this.ADMIN_CHAT_ID = chatId;
        localStorage.setItem('telegram_admin_chat_id', chatId);
        console.log('🔔 Admin Chat ID manually set:', chatId);
    }
}

// Global instance
window.telegramNotifications = new TelegramNotifications();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelegramNotifications;
}