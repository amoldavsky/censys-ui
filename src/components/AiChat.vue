<template>
  <div class="ai-chat" :class="{ 'mobile-hidden': $vuetify.display.smAndDown }">
    <v-card class="chat-card" variant="flat">
      <!-- Chat Header -->
      <v-card-title class="chat-header">
        <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
        <span>AI Assistant</span>
      </v-card-title>
      
      <v-divider />
      
      <!-- Messages Area -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="displayMessages.length === 0" class="welcome-screen">
          <!-- Large intro text -->
          <div class="intro-section">
            <h1 class="intro-title">Hello, I'm your AI assistant</h1>
            <p class="intro-subtitle">
              I can help you analyze this {{ assetType }} asset, explain security risks,
              and provide insights about vulnerabilities and threats.
            </p>
          </div>

          <!-- Pre-defined message cards -->
          <div class="suggestion-cards">
            <div
              v-for="suggestion in getSuggestions()"
              :key="suggestion.text"
              class="suggestion-card"
              @click="sendSuggestion(suggestion.text)"
            >
              <v-icon :icon="suggestion.icon" class="suggestion-icon" />
              <span class="suggestion-text">{{ suggestion.text }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="messages-list">
          <div
            v-for="(message, index) in displayMessages"
            :key="index"
            class="message"
            :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <v-icon v-if="message.role === 'user'" color="secondary">mdi-account</v-icon>
              <v-icon v-else color="primary">mdi-robot</v-icon>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="loading" class="message ai-message">
          <div class="message-avatar">
            <v-icon color="primary">mdi-robot</v-icon>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <v-divider />
      <div class="input-container">
        <v-textarea
          v-model="inputMessage"
          placeholder="Ask about this asset..."
          variant="plain"
          rows="1"
          auto-grow
          max-rows="4"
          hide-details
          :disabled="loading"
          class="message-input"
          @keydown.enter.prevent="handleEnter"
        />
        <v-btn
          icon
          variant="flat"
          color="primary"
          size="small"
          :disabled="!inputMessage.trim() || loading"
          @click="sendMessage"
          class="send-btn"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed, onBeforeUnmount } from 'vue'
import { apiService } from '@/services/api'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface SuggestionCard {
  text: string
  icon: string
}

interface Props {
  assetType: 'host' | 'web'
  assetData?: any
  suggestions?: SuggestionCard[]
  summaryId?: string
}

const props = defineProps<Props>()

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const isUnmounting = ref(false)

// No system context needed - asset data passed separately

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value || isUnmounting.value) return
  
  const userMessage: ChatMessage = {
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  inputMessage.value = ''
  loading.value = true
  
  await scrollToBottom()
  
  try {
    // Send all messages with asset context to the API
    const data = await apiService.sendChatMessage(
      messages.value.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      props.assetData?.id, // asset_id
      props.assetType,     // asset_type
      props.summaryId      // summary_id
    )
    
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: data.message || 'Sorry, I encountered an error processing your request.',
      timestamp: new Date()
    }
    
    if (!isUnmounting.value) {
      messages.value.push(aiMessage)
    }
  } catch (error) {
    console.error('Chat API error:', error)

    if (!isUnmounting.value) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }

      messages.value.push(errorMessage)
    }
  } finally {
    if (!isUnmounting.value) {
      loading.value = false
      await scrollToBottom()
    }
  }
}

function handleEnter(event: KeyboardEvent) {
  if (!event.shiftKey) {
    sendMessage()
  }
}

async function scrollToBottom() {
  if (isUnmounting.value) return
  await nextTick()
  if (messagesContainer.value && !isUnmounting.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getSuggestions() {
  return props.suggestions || []
}

function sendSuggestion(text: string) {
  inputMessage.value = text
  sendMessage()
}

// All messages are displayed (no system messages)
const displayMessages = computed(() => messages.value)

onBeforeUnmount(() => {
  // Set flag to prevent any async operations from updating state
  isUnmounting.value = true
})
</script>

<style scoped>
.ai-chat {
  width: 320px;
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px; /* Position to align nicely */
  right: 0;
  z-index: 1000;
}

/* Hide on mobile and tablet */
@media (max-width: 960px) {
  .mobile-hidden {
    display: none !important;
  }
}

/* Adjust for mobile nav bar height */
@media (max-width: 600px) {
  .ai-chat {
    top: 56px; /* Mobile nav bar is shorter */
    height: calc(100vh - 56px);
  }
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--edge);
  background: var(--bg-1);
  border-radius: 0;
  margin: 0;
  padding: 0;
}

.chat-header {
  padding: 16px;
  background: var(--bg-0);
  border-bottom: 1px solid var(--edge);
  flex-shrink: 0;
  height: 64px; /* Exact match to app bar height */
  display: flex;
  align-items: center;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 24px;
}

.intro-section {
  text-align: left;
  margin-bottom: 48px;
}

.intro-title {
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--txt);
  margin-bottom: 16px;
  line-height: 1.2;
}

.intro-subtitle {
  font-size: 1.125rem;
  color: #8aa1b5;
  line-height: 1.5;
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-0);
  border: 1px solid var(--edge);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-card:hover {
  background: rgba(0, 229, 168, 0.05);
  border-color: var(--pri);
  transform: translateY(-1px);
}

.suggestion-icon {
  color: var(--pri);
  font-size: 20px;
  flex-shrink: 0;
}

.suggestion-text {
  color: var(--txt);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-0);
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: var(--bg-0);
  padding: 12px 16px;
  border-radius: 18px;
  color: var(--txt);
  word-wrap: break-word;
  line-height: 1.4;
  white-space: pre-wrap; /* Preserve newlines and whitespace */
}

.user-message .message-text {
  background: var(--pri);
  color: #000;
  margin-left: auto;
}

.user-message {
  flex-direction: row-reverse;
}

.message-time {
  font-size: 0.75rem;
  color: #8aa1b5;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.typing-indicator {
  background: var(--bg-0);
  padding: 16px 20px;
  border-radius: 18px;
  display: inline-block;
}

.typing-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pri);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
.typing-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.input-container {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: var(--bg-0);
  border-top: 1px solid var(--edge);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
}

.send-btn {
  margin-bottom: 4px;
}

/* Custom scrollbar for messages */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #263241;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}
</style>
