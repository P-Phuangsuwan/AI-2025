document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle Logic
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        sidebarBackdrop.classList.toggle('active');
    };

    menuBtn.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    sidebarBackdrop.addEventListener('click', toggleSidebar);

    // Chatbot Toggle Logic
    const chatbotBtn = document.getElementById('chatbotBtn');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle Chat Window
    chatbotBtn.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Handle sending message
    const handleSendMessage = () => {
        const text = chatInput.value.trim();
        if (text === '') return;

        // User message
        appendMessage(text, 'user-message');
        chatInput.value = '';

        // Simulate AI thinking and responding
        setTimeout(() => {
            const responses = [
                "รับทราบครับ ขอวิเคราะห์ข้อมูลสักครู่นะครับ...",
                "จากข้อมูลล่าสุด ปริมาณน้ำในดินเพียงพอในช่วง 3 วันนี้ครับ",
                "แนวโน้มราคาข้าวเปลือกเจ้าสัปดาห์หน้าอาจจะทรงตัว แนะนำให้ติดตามประกาศอีกครั้งครับ"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            appendMessage(randomResponse, 'ai-message');
        }, 1000);
    };

    sendMessageBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);

        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
