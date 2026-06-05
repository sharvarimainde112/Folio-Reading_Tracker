/**
 * --- SMART COVERSATION CONTEXT DATABASE LOGIC FRAMEWORK ---
 * Hardcoded, clean localized simulation controller routes
 */
const coachReplyRepository = {
    recommend: "For your current mood, Sharvari, I highly recommend checking out *Babel* by R.F. Kuang. It's a gorgeous dark academia narrative that interweaves historical fantasy with deep philosophical musings on translation and colonial frameworks. It perfectly matches your reading patterns!",
    book: "If you are focusing on expanding your library catalog this week, consider looking into *The Midnight Library* by Matt Haig. It provides a phenomenal, compassionate thematic lens through which to track existential growth parameters.",
    quote: "Here is your literary spark for today, Sharvari: *'The reading of all good books is like a conversation with the finest minds of past centuries.'* — René Descartes. Keep that 7-day streak blazing bright!",
    goal: "Let's optimize your velocity parameters. Based on your historical logs, setting a structured milestone of 25 pages per evening will safely cross your upcoming quarterly checkpoint. Shall I commit this map tracking sequence to your dashboard metrics?",
    generic: "That's a fascinating perspective, Sharvari. As your literary companion, I recommend annotating your current chapter's secondary exposition layout. How does the narrative arc fit with your initial predictions for the title?"
};

document.addEventListener("DOMContentLoaded", () => {
    const threadScrollBox = document.getElementById("chatScrollThread");
    const communicationForm = document.getElementById("coachMessageForm");
    const userTextField = document.getElementById("chatComposerInput");
    const interactivePills = document.querySelectorAll(".action-pill-btn");

    /**
     * Appends modular chat nodes securely with structural formatting parameters
     * @param {string} rawText Message copy strings
     * @param {string} identitySelector Unique classification string (user/coach)
     */
    function appendChatBubbleNode(rawText, identitySelector) {
        const bubbleElement = document.createElement("div");
        bubbleElement.className = `chat-bubble ${identitySelector}-bubble`;
        bubbleElement.innerHTML = rawText;
        
        threadScrollBox.appendChild(bubbleElement);
        executeThreadAutoScroll();
    }

    /**
     * Builds and appends temporary responsive pulsing processing blocks
     * @returns {string} Unique token target tracking key identifiers
     */
    function mountTypingIndicatorBox() {
        const uniqueTokenKey = "indicator-" + Date.now();
        const structuralBubble = document.createElement("div");
        structuralBubble.className = "chat-bubble coach-bubble typing-wrapper-node";
        structuralBubble.id = uniqueTokenKey;

        structuralBubble.innerHTML = `
            <div class="typing-container">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        threadScrollBox.appendChild(structuralBubble);
        executeThreadAutoScroll();
        return uniqueTokenKey;
    }

    /**
     * Auto scrolls the viewport canvas downward following chat updates
     */
    function executeThreadAutoScroll() {
        threadScrollBox.scrollTop = threadScrollBox.scrollHeight;
    }

    /**
     * Decouples prompt tracking processing paths to mimic backend engines
     * @param {string} userString Raw normalized evaluation inputs
     */
    function processAutomatedCoachResponsePipeline(userString) {
        const standardCleanQuery = userString.toLowerCase();
        const activeTokenKey = mountTypingIndicatorBox();

        // Establish humanized processing pauses (1.5 seconds typing illusion)
        setTimeout(() => {
            // Safe removal of active loader blocks
            const targetLoaderNode = document.getElementById(activeTokenKey);
            if (targetLoaderNode) {
                targetLoaderNode.remove();
            }

            // Route execution query parameters
            let matchedResolutionReply = coachReplyRepository.generic;
            
            if (standardCleanQuery.includes("recommend")) {
                matchedResolutionReply = coachReplyRepository.recommend;
            } else if (standardCleanQuery.includes("book")) {
                matchedResolutionReply = coachReplyRepository.book;
            } else if (standardCleanQuery.includes("quote") || standardCleanQuery.includes("motivation")) {
                matchedResolutionReply = coachReplyRepository.quote;
            } else if (standardCleanQuery.includes("goal") || standardCleanQuery.includes("plan")) {
                matchedResolutionReply = coachReplyRepository.goal;
            }

            // Mount reply text bubble to layout window view
            appendChatBubbleNode(matchedResolutionReply, "coach");

        }, 1500);
    }

    /**
     * Intercepts composition actions to sanitize user payload updates
     */
    function handleUserMessageDispatch() {
        const capturedInputText = userTextField.value.trim();
        
        if (capturedInputText === "") return;

        // Render user message bubble on the right side
        appendChatBubbleNode(capturedInputText, "user");
        
        // Clear matching input composer values instantly
        userTextField.value = "";
        userTextField.focus();

        // Forward string parameters down the processing line
        processAutomatedCoachResponsePipeline(capturedInputText);
    }

    // Intercept form submissions safely
    communicationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleUserMessageDispatch();
    });

    // Capture hotkey shortcuts within input areas
    userTextField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserMessageDispatch();
        }
    });

    // Mount core handlers onto the pill component architecture
    interactivePills.forEach(pillNode => {
        pillNode.addEventListener("click", () => {
            const definedTargetPrompt = pillNode.getAttribute("data-prompt");
            if (!definedTargetPrompt) return;

            // Direct injection as user message bubble
            appendChatBubbleNode(definedTargetPrompt, "user");
            
            // Forward variables down the execution track
            processAutomatedCoachResponsePipeline(definedTargetPrompt);
        });
    });
});