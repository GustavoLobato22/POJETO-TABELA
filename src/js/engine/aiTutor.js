// "IA Professor": explica cada questão como um tutor particular. O modo
// padrão funciona 100% offline, a partir do conteúdo autoral de cada questão
// (explicação, justificativa de cada alternativa errada, dicas e pegadinhas).
// Um modo opcional e experimental permite plugar uma chave de API própria
// (Anthropic ou OpenAI) para tirar dúvidas livres com um modelo de linguagem —
// a chave fica salva apenas no dispositivo do usuário (localStorage) e as
// chamadas são feitas diretamente do navegador para o provedor escolhido.
export function buildExplanation(question, chosenKey) {
  const correctAlt = question.alternatives.find((a) => a.key === question.correct);
  const chosenAlt = chosenKey ? question.alternatives.find((a) => a.key === chosenKey) : null;
  const wasCorrect = chosenKey === question.correct;

  const wrongBreakdown = question.alternatives
    .filter((a) => a.key !== question.correct)
    .map((a) => ({ key: a.key, text: a.text, reason: question.wrongRationale?.[a.key] || null }));

  return {
    wasCorrect,
    correctAlt,
    chosenAlt,
    mainExplanation: question.explanation,
    wrongBreakdown,
    tips: question.tips,
    trap: question.trap,
    fasterMethod: question.fasterMethod,
  };
}

export async function askFreeFormTutor(promptText, { apiKey, provider }) {
  if (!apiKey) {
    return {
      ok: false,
      message: 'Configure uma chave de API em Perfil → Configurações → IA Professor para conversar livremente com o tutor. Enquanto isso, use a explicação automática de cada questão — ela já cobre o raciocínio completo.',
    };
  }

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é um professor particular especialista em concursos de Polícia Militar (PMES). Responda de forma didática, objetiva e encorajadora, em português.' },
            { role: 'user', content: promptText },
          ],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { ok: true, message: data.choices?.[0]?.message?.content || 'Sem resposta.' };
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: 'Você é um professor particular especialista em concursos de Polícia Militar (PMES). Responda de forma didática, objetiva e encorajadora, em português.',
        messages: [{ role: 'user', content: promptText }],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, message: data.content?.[0]?.text || 'Sem resposta.' };
  } catch (err) {
    return {
      ok: false,
      message: `Não foi possível falar com a IA (${err.message}). Verifique a chave de API e sua conexão — algumas APIs bloqueiam chamadas diretas do navegador (CORS). A explicação automática desta questão continua disponível normalmente.`,
    };
  }
}
