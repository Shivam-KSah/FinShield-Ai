const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an AI fraud investigation report using Gemini
 * @param {Object} transactionData - transaction details + risk context
 * @returns {string} - Markdown-formatted investigation report
 */
async function generateFraudReport(transactionData) {
  const {
    amount,
    riskScore,
    riskFactors,
    status,
    location,
    senderName,
    receiverName,
    description,
    createdAt,
    velocityCount,
  } = transactionData;

  const hour = new Date(createdAt).getHours();
  const timeOfDay =
    hour >= 0 && hour < 5
      ? 'Late Night (00:00–05:00)'
      : hour < 12
      ? 'Morning'
      : hour < 17
      ? 'Afternoon'
      : 'Evening';

  const factorList = riskFactors
    .map((f) => `- ${f.rule} (+${f.score}): ${f.description}`)
    .join('\n');

  const prompt = `You are a senior fraud analyst at a major financial institution. 
Analyze the following transaction and produce a structured fraud investigation report.

TRANSACTION DATA:
- Sender: ${senderName}
- Receiver: ${receiverName}
- Amount: ₹${amount.toLocaleString('en-IN')}
- Risk Score: ${riskScore}/100
- Status: ${status.toUpperCase()}
- Time of Transfer: ${timeOfDay}
- Location: ${location}
- Description: "${description}"
- Timestamp: ${new Date(createdAt).toLocaleString('en-IN')}

TRIGGERED RISK FACTORS:
${factorList || 'None'}

Write a professional fraud investigation report with these exact sections:

## Risk Summary
A 2-3 sentence executive summary of the risk level and key concerns.

## Flagged Indicators
A bullet list of each triggered risk factor with a brief explanation of why it is suspicious.

## Behavioral Analysis
2-3 sentences analyzing the behavioral patterns of this transaction in context of known fraud typologies (e.g., structuring, account takeover, money laundering).

## Recommended Action
One of: APPROVE | ESCALATE TO COMPLIANCE | BLOCK IMMEDIATELY
Followed by a 1-2 sentence justification.

## Confidence Level
State your confidence as: LOW | MEDIUM | HIGH | VERY HIGH
And explain briefly why.

Keep the tone professional, concise, and suitable for a compliance officer at BNY Mellon or NatWest.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Fallback report if API fails
    return generateFallbackReport(transactionData);
  }
}

function generateFallbackReport({ riskScore, riskFactors, amount, status }) {
  const level =
    riskScore >= 70 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';
  return `## Risk Summary
This transaction has been automatically assessed with a risk score of **${riskScore}/100** (${level}). Manual review is recommended.

## Flagged Indicators
${riskFactors.map((f) => `- **${f.rule}**: ${f.description}`).join('\n') || '- No specific indicators triggered'}

## Behavioral Analysis
The transaction pattern warrants attention based on the triggered rules. Amount of ₹${amount.toLocaleString('en-IN')} and status of **${status.toUpperCase()}** indicate elevated risk.

## Recommended Action
**${riskScore >= 70 ? 'BLOCK IMMEDIATELY' : riskScore >= 30 ? 'ESCALATE TO COMPLIANCE' : 'APPROVE'}**
Based on automated risk scoring. Manual officer review required.

## Confidence Level
**MEDIUM** — AI report generated from automated rules. Gemini API unavailable; report is rule-based only.`;
}

module.exports = { generateFraudReport };
