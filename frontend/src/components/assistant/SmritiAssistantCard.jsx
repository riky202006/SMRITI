import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconSparkles } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { sendPromptToAssistant } from '@/services/aiService';

const SUGGESTED_PROMPTS = [
  { label: '✨ What should I do now?', prompt: 'What should I do right now on SMRITI today?' },
  { label: '🧠 Memory Game Guide', prompt: 'Tell me how the Memory Game works and how it helps me.' },
  { label: '💊 Daily Medicines Guide', prompt: 'Tell me how to check and track my daily medicines on SMRITI.' },
  { label: '📅 Appointments Guide', prompt: 'Tell me how to view my doctor appointments on SMRITI.' },
];

export default function SmritiAssistantCard({ context = {} }) {
  const { profile } = useAuth();

  // Strict Patient-Only Guard: Never render for Caretaker or unauthenticated sessions
  if (!profile || profile.role !== 'patient') {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [customInput, setCustomInput] = useState('');

  const handleAsk = async (promptText) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setActivePrompt(trimmed);
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await sendPromptToAssistant({
        prompt: trimmed,
        context: {
          page: 'Home Dashboard',
          patientName: profile?.full_name || 'Patient',
          ...context,
        },
      });

      if (res.success && res.reply) {
        setAiResponse(res.reply);
      } else {
        console.error('[SmritiAssistantCard] Assistant response failure:', res.error);
        setErrorMsg(res.error || "I'm having trouble connecting right now. You can continue using SMRITI normally.");
      }
    } catch (err) {
      console.error('[SmritiAssistantCard] Exception:', err);
      setErrorMsg(err?.message || "I'm having trouble connecting right now. You can continue using SMRITI normally.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActivePrompt('');
    setAiResponse('');
    setErrorMsg('');
    setCustomInput('');
  };

  const displayName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <Card
      className="smriti-assistant-card"
      style={{
        padding: '24px',
        border: '2px solid var(--mint-soft)',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 20px rgba(0, 94, 83, 0.06)',
      }}
    >
      {/* Header with Title and AI Guide Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--mint-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconSparkles size={22} />
          </div>
          <div>
            <h2 className="headline-sm" style={{ fontSize: '19px', margin: 0, color: 'var(--primary)' }}>
              SMRITI Assistant
            </h2>
            <p className="body-md" style={{ color: 'var(--outline)', margin: 0, fontSize: '13px' }}>
              Your friendly daily guide
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: 'var(--mint-soft)',
            color: 'var(--primary)',
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          AI Companion
        </span>
      </div>

      {/* Greeting / Default Prompt */}
      {!aiResponse && !loading && !errorMsg && (
        <p
          className="body-md"
          style={{
            fontSize: '16px',
            lineHeight: 1.5,
            color: 'var(--on-surface)',
            marginBottom: 16,
          }}
        >
          Hello {displayName}! I am your calm SMRITI Assistant. Tap an option below or ask me how to use SMRITI today:
        </p>
      )}

      {/* Suggested Quick Guidance Actions */}
      {!aiResponse && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleAsk(item.prompt)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-container-low)',
                border: '1px solid var(--surface-container)',
                color: 'var(--on-surface)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--mint-soft)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-container-low)';
                e.currentTarget.style.borderColor = 'var(--surface-container)';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Question Input */}
      {!aiResponse && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(customInput);
          }}
          style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            className="form-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Or type a question (e.g., How do I start?)..."
            disabled={loading}
            style={{
              flex: '1 1 240px',
              padding: '10px 14px',
              fontSize: '15px',
              borderRadius: 'var(--radius-pill)',
            }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !customInput.trim()}
            style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px', minHeight: '44px' }}
          >
            {loading ? 'Asking...' : 'Ask Assistant'}
          </Button>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--mint-soft)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '15px',
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2px solid var(--primary)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          Thinking with SMRITI Assistant...
        </div>
      )}

      {/* AI Response Display */}
      {aiResponse && !loading && (
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            marginTop: 8,
          }}
        >
       <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 6, marginBottom: 8, width: '100%', color: 'var(--primary)', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
  <IconSparkles size={16} /> SMRITI Assistant says:
</div>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#14532d',
              margin: '0 0 16px',
              whiteSpace: 'pre-line',
            }}
          >
            {aiResponse}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              style={{ fontSize: '14px', padding: '8px 16px', minHeight: '38px', borderRadius: 'var(--radius-pill)' }}
            >
              Ask Another Question
            </Button>
          </div>
        </div>
      )}

      {/* Error Fallback State */}
      {errorMsg && !loading && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-md)',
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ color: 'var(--outline)', margin: 0, fontSize: '15px' }}>
            {errorMsg}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
