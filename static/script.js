document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('messageArea');
    const userInput = document.getElementById('text');
    const sendButton = document.getElementById('send');
    const chatMessages = document.getElementById('messageFormeight');
    const chatHistory = document.getElementById('chatHistory');
    const suggestionsContainer = document.getElementById('suggestions');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.querySelector('.new-chat-btn');
    const botAvatar = document.getElementById('botAvatar');
    const userAvatar = document.getElementById('userAvatar');
    const botStatusText = document.querySelector('.status-text');

    const suggestionTemplates = [
        "How do I {action} in {language}?",
        "Explain {concept} in simple terms",
        "What are the best practices for {topic}?",
        "Compare {thing1} and {thing2}",
        "Give me a brief history of {subject}"
    ];

    const actions = ["create a function", "implement a loop", "handle errors", "work with arrays", "use classes"];
    const languages = ["Python", "JavaScript", "Java", "C++", "Ruby"];
    const concepts = ["machine learning", "blockchain", "cloud computing", "data structures", "algorithms"];
    const topics = ["web development", "mobile app design", "database management", "cybersecurity", "AI ethics"];
    const things = ["SQL and NoSQL", "React and Angular", "Python and JavaScript", "Docker and Kubernetes", "REST and GraphQL"];
    const subjects = ["artificial intelligence", "the internet", "programming languages", "computer graphics", "quantum computing"];

    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function generateRandomSuggestion() {
        const template = getRandomElement(suggestionTemplates);
        return template
            .replace('{action}', getRandomElement(actions))
            .replace('{language}', getRandomElement(languages))
            .replace('{concept}', getRandomElement(concepts))
            .replace('{topic}', getRandomElement(topics))
            .replace('{thing1}', getRandomElement(things).split(' and ')[0])
            .replace('{thing2}', getRandomElement(things).split(' and ')[1])
            .replace('{subject}', getRandomElement(subjects));
    }

    function displaySuggestions() {
        suggestionsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const suggestionElement = document.createElement('span');
            suggestionElement.classList.add('suggestion');
            suggestionElement.textContent = generateRandomSuggestion();
            suggestionElement.addEventListener('click', () => loadChat(suggestionElement.textContent));
            suggestionsContainer.appendChild(suggestionElement);
        }
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('d-flex', isUser ? 'justify-content-end' : 'justify-content-start', 'mb-4');
        
        const avatarImg = document.createElement('img');
        avatarImg.src = isUser ? userAvatar.src : botAvatar.src;
        avatarImg.classList.add('user_img');
        
        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add(isUser ? 'msg_cotainer_send' : 'msg_cotainer');
        
        if (isUser) {
            messageContentDiv.textContent = content;
            messageDiv.appendChild(messageContentDiv);
            messageDiv.appendChild(avatarImg);
        } else {
            typeText(messageContentDiv, content);
            messageDiv.appendChild(avatarImg);
            messageDiv.appendChild(messageContentDiv);
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function typeText(element, text) {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50); // Adjust typing speed here
    }

    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('d-flex', 'justify-content-start', 'mb-4', 'loading-indicator');
        
        const avatarImg = document.createElement('img');
        avatarImg.src = botAvatar.src;
        avatarImg.classList.add('user_img');
        
        loadingDiv.innerHTML = `
            <img src="${botAvatar.src}" class="user_img">
            <div class="msg_cotainer">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingIndicator = chatMessages.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            addToChatHistory(message);
            userInput.value = '';
            adjustTextareaHeight();

            addLoadingIndicator();

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                });
                const data = await response.json();
                removeLoadingIndicator();
                addMessage(data.response);
                displaySuggestions(); // Update suggestions after receiving a response
            } catch (error) {
                console.error('Error:', error);
                removeLoadingIndicator();
                addMessage('Sorry, there was an error processing your request.');
            }
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('sidebar-active');
    }

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            toggleSidebar();
        }
    });

    // Prevent closing when clicking inside sidebar
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Update bot status dynamically
    function updateBotStatus() {
        const statuses = [
            "Online",
            "Ready to chat",
            "Listening...",
            "How can I help?",
            "At your service"
        ];
        setInterval(() => {
            botStatusText.textContent = getRandomElement(statuses);
        }, 5000); // Change status every 5 seconds
    }

    updateBotStatus();

    // Display suggestions initially
    displaySuggestions();

    // Event listeners for sending messages
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('input', adjustTextareaHeight);

    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // New chat button functionality
    newChatBtn.addEventListener('click', function() {
        chatMessages.innerHTML = '';
        userInput.value = '';
        adjustTextareaHeight();
        displaySuggestions();
    });

    // Function to load chat from history
    function loadChat(message) {
        userInput.value = message;
        adjustTextareaHeight();
        sendMessage();
    }

    // Function to adjust textarea height
    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    // Function to add messages to chat history
    function addToChatHistory(message) {
        const li = document.createElement('li');
        li.textContent = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        li.addEventListener('click', () => loadChat(message));
        chatHistory.insertBefore(li, chatHistory.firstChild);
    }
});
