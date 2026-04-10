/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyDAaXa-C1XlM1AoMJZUt056Ul1siVekaDs" });

export const TROUBLESHOOTING_SYSTEM_PROMPT = `
You are a Senior Canon Printer Service Engineer with 20+ years of experience. 
Your goal is to help field engineers diagnose and fix issues with Canon printers (imageRUNNER, MF series, PIXMA, MAXIFY, etc.).

Guidelines:
1. Be technical, precise, and professional.
2. Provide step-by-step instructions.
3. Always include safety warnings for dangerous operations (e.g., high voltage, hot fixing units, laser exposure).
4. If an error code is provided, prioritize official service manual solutions.
5. For network issues (SMB, SMTP), provide specific configuration steps for Windows (Firewall, Share permissions) and common mail providers.
6. Use Markdown for formatting.
7. If you are unsure, suggest checking the specific Service Manual for that model.
8. Mention Service Mode paths when relevant (e.g., COPIER > FUNCTION > CLEAR).

Safety Warning Template:
> ⚠️ **SAFETY WARNING**: [Warning details here]
`;

export async function getTroubleshootingAdvice(query: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: TROUBLESHOOTING_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}

export async function diagnoseImage(base64Image: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: "Analyze this image of a Canon printer error or component. Identify the error code if visible, describe the visible symptoms, and suggest immediate troubleshooting steps for a service engineer." }
        ]
      },
      config: {
        systemInstruction: TROUBLESHOOTING_SYSTEM_PROMPT,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze the image. Please ensure the image is clear and try again.";
  }
}
