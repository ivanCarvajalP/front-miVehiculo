<template>
  <div class="floating-chat-container">
    <!-- Ventana de Chat -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-window">
        <div class="chat-header">
          <div class="header-info">
            <div class="ai-avatar groq-avatar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z" opacity="0"/>
                <!-- Logo simplificado tipo G de Groq -->
                <path d="M12 4.5A7.5 7.5 0 0 0 4.5 12a7.5 7.5 0 0 0 12.3 5.8l-1.4-1.4a5.5 5.5 0 1 1 .6-4.4H12v2h5.9a7.5 7.5 0 0 0-5.9-9.5z"/>
              </svg>
            </div>
            <div>
              <h4>Groq IA</h4>
              <span>miVehículo Expert</span>
            </div>
          </div>
          <button class="btn-close" @click="toggleChat" title="Cerrar chat">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">👋</div>
            <p>¡Hola! Soy tu asistente inteligente. Pregúntame sobre tus vehículos, mantenimientos o facturas.</p>
          </div>
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message-wrapper', msg.isUser ? 'user' : 'ai']"
          >
            <div class="message-bubble">
              {{ msg.text }}
            </div>
          </div>

          <div v-if="isLoading" class="message-wrapper ai">
            <div class="message-bubble typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <form @submit.prevent="sendMessage" class="input-form">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Escribe tu mensaje aquí..." 
              :disabled="isLoading"
            />
            <button type="submit" class="btn-send" :disabled="!newMessage.trim() || isLoading">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>

    <!-- Botón Flotante -->
    <button 
      class="floating-btn" 
      :class="{ 'is-open': isOpen }" 
      @click="toggleChat"
      title="Abrir Asistente IA"
    >
      <transition name="fade-icon" mode="out-in">
        <svg v-if="!isOpen" viewBox="0 0 24 24" width="30" height="30" fill="currentColor" class="icon-groq">
          <path d="M12 4.5A7.5 7.5 0 0 0 4.5 12a7.5 7.5 0 0 0 12.3 5.8l-1.4-1.4a5.5 5.5 0 1 1 .6-4.4H12v2h5.9a7.5 7.5 0 0 0-5.9-9.5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </transition>
      
      <!-- Indicador de pulso cuando está cerrado -->
      <span v-if="!isOpen" class="pulse-ring"></span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { iaService } from '../../services/index'

const isOpen = ref(false)
const newMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

const messages = ref([])

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && messages.value.length === 0) {
    // Foco en el input al abrir (opcional)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text) return

  // Añadir mensaje del usuario
  messages.value.push({ text, isUser: true })
  newMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const response = await iaService.chat(text)
    // Añadir respuesta de la IA
    messages.value.push({ 
      text: response.data?.respuesta || 'No entendí muy bien. ¿Puedes repetir?', 
      isUser: false 
    })
  } catch (error) {
    messages.value.push({ 
      text: 'Lo siento, hubo un problema al comunicarme con el servidor. Intenta de nuevo más tarde.', 
      isUser: false 
    })
    console.error('Error IA Chat:', error)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.floating-chat-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Inter', sans-serif;
}

/* ── Botón Flotante ── */
.floating-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--c-primary); /* Yale Blue */
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(27, 64, 121, 0.4);
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.floating-btn:hover {
  transform: scale(1.1);
}
.floating-btn.is-open {
  background: var(--c-text-muted);
  box-shadow: 0 8px 24px rgba(77, 124, 138, 0.4);
  transform: scale(0.9);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--c-primary-hover);
  animation: pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* ── Ventana de Chat ── */
.chat-window {
  position: absolute;
  bottom: 80px; /* Sobre el botón */
  right: 0;
  width: 360px;
  height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(27, 64, 121, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* ── Header ── */
.chat-header {
  padding: 16px 20px;
  background: var(--c-primary);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ai-avatar.groq-avatar {
  width: 36px;
  height: 36px;
  background: var(--c-primary-light); /* Mindaro */
  color: var(--c-primary-dark);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-info h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.header-info span {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}
.btn-close {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
.btn-close:hover {
  color: #ffffff;
}

/* ── Area de Mensajes ── */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--c-bg-surface-soft);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--c-text-muted);
  padding: 0 20px;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-state p {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.message-wrapper {
  display: flex;
  width: 100%;
}
.message-wrapper.user {
  justify-content: flex-end;
}
.message-wrapper.ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.user .message-bubble {
  background: var(--c-primary);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}
.ai .message-bubble {
  background: white;
  color: #1e293b;
  border: 1px solid var(--c-border);
  border-bottom-left-radius: 4px;
}

/* Typing Indicator */
.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 16px 20px;
}
.dot {
  width: 6px;
  height: 6px;
  background: var(--c-text-light);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ── Input Area ── */
.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid var(--c-bg-surface-soft);
}
.input-form {
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(--c-bg-surface-soft);
  padding: 6px 6px 6px 16px;
  border-radius: 30px;
  border: 1px solid var(--c-border);
}
.input-form input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: #1e293b;
}
.input-form input::placeholder {
  color: var(--c-text-light);
}
.btn-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-send:not(:disabled):hover {
  background: var(--c-primary-hover);
  transform: translateY(-1px);
}
.btn-send:disabled {
  background: var(--c-border-hover);
  cursor: not-allowed;
}

/* Ajustes Responsivos */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 40px);
    height: 60vh;
  }
}
</style>
