document.addEventListener("DOMContentLoaded", () => {
     updateSidebarUserInfo();
    const threadScrollBox   = document.getElementById("chatScrollThread");
    const communicationForm = document.getElementById("coachMessageForm");
    const userTextField     = document.getElementById("chatComposerInput");
    const interactivePills  = document.querySelectorAll(".action-pill-btn");

    function appendChatBubbleNode(rawText, identitySelector) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${identitySelector}-bubble`;
        bubble.innerHTML = rawText;
        threadScrollBox.appendChild(bubble);
        executeThreadAutoScroll();
    }

    function mountTypingIndicatorBox() {
        const uniqueKey = "indicator-" + Date.now();
        const bubble    = document.createElement("div");
        bubble.className = "chat-bubble coach-bubble typing-wrapper-node";
        bubble.id        = uniqueKey;
        bubble.innerHTML = `
            <div class="typing-container">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        threadScrollBox.appendChild(bubble);
        executeThreadAutoScroll();
        return uniqueKey;
    }

    function executeThreadAutoScroll() {
        threadScrollBox.scrollTop = threadScrollBox.scrollHeight;
    }

    async function processAutomatedCoachResponsePipeline(userMessage) {
        const indicatorKey = mountTypingIndicatorBox();

        try {
            const response = await apiFetch('/ai-coach', {
                method: 'POST',
                body:   JSON.stringify({ message: userMessage })
            });

            const indicator = document.getElementById(indicatorKey);
            if (indicator) indicator.remove();

            if (!response) return;

            const data = await response.json();

            if (!response.ok) {
                appendChatBubbleNode(
                    "Sorry, I couldn't process that. Please try again.",
                    "coach"
                );
                return;
            }

            appendChatBubbleNode(data.reply, "coach");

        } catch (error) {
            const indicator = document.getElementById(indicatorKey);
            if (indicator) indicator.remove();
            console.error('Folio AI Coach error:', error);
            appendChatBubbleNode(
                "⚠️ Could not connect to Folio server. Is it running?",
                "coach"
            );
        }
    }

    function handleUserMessageDispatch() {
        const capturedText = userTextField.value.trim();
        if (capturedText === "") return;
        appendChatBubbleNode(capturedText, "user");
        userTextField.value = "";
        userTextField.focus();
        processAutomatedCoachResponsePipeline(capturedText);
    }

    communicationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleUserMessageDispatch();
    });

    userTextField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserMessageDispatch();
        }
    });

    interactivePills.forEach(pill => {
        pill.addEventListener("click", () => {
            const prompt = pill.getAttribute("data-prompt");
            if (!prompt) return;
            appendChatBubbleNode(prompt, "user");
            processAutomatedCoachResponsePipeline(prompt);
        });
    });
});