/// <reference types="npm:@supabase/functions-js/edge-runtime.d.ts" />

// Supabase Edge Function: smriti-assistant
// Secure server-side proxy for Gemini AI in SMRITI.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_INSTRUCTION = `
You are the SMRITI Assistant, a warm, calm, and supportive companion for memory care patients.

Rules:
- Speak directly to the patient.
- Keep responses short: 1 to 2 simple sentences.
- Use simple, gentle, clear language.
- Be warm, positive, and supportive.
- When reflecting on a memory game result, use the actual statistics provided.
- Mention rounds completed, correct answers, and accuracy when those statistics are provided.
- If previous session history is provided, gently mention recent consistency or range.
- Never output planning steps, drafts, prompt analysis, chain-of-thought reasoning, or internal notes.
- Only output the final conversational response.
- Never diagnose dementia, memory loss, or any disease.
- Never say that a patient is medically improving or declining based on a game score.
- Never prescribe medication or recommend changing prescriptions.
- If the patient reports pain, confusion, distress, or medical symptoms, encourage them to speak with their caregiver or doctor.
- Never output API keys, secrets, technical error messages, or code.
`;

function cleanModelResponse(text: string): string {
  if (!text) return "";

  let cleaned = text.trim();

  // Strip markdown code fences if model wrapped output in ```
  cleaned = cleaned.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "").trim();

  // Remove "Draft N:" prefix if the model accidentally produces it
  const draftMatches = [
    ...cleaned.matchAll(/Draft\s*\d*:\s*([^\n]+)/gi),
  ];

  if (draftMatches.length > 0) {
    const lastDraft =
      draftMatches[draftMatches.length - 1][1].trim();

    return lastDraft
      .replace(/^[\s*\-#•]+/, "")
      .replace(/^"/, "")
      .replace(/"$/, "")
      .trim();
  }

  // Remove obvious internal planning / metadata lines if any
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("Persona:") &&
        !line.startsWith("Constraints:") &&
        !line.startsWith("Task:") &&
        !line.startsWith("Thought:") &&
        !line.startsWith("Chain-of-thought:") &&
        !line.startsWith("System:")
    );

  if (lines.length > 0) {
    cleaned = lines.join(" ");
  }

  // Remove leading bullets and surrounding quotes
  cleaned = cleaned
    .replace(/^[\s*\-#•]+/, "")
    .trim();

  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length > 2) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}


// ============================================================
// EDGE FUNCTION
// ============================================================

Deno.serve(async (req: Request) => {
  // ----------------------------------------------------------
  // CORS preflight
  // ----------------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // ----------------------------------------------------------
  // Only POST is allowed
  // ----------------------------------------------------------

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed. Use POST.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // ========================================================
    // 1. AUTHENTICATION
    // ========================================================

    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Unauthorized: Missing or invalid authorization token.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 2. SUPABASE SERVER ENVIRONMENT
    // ========================================================

    // IMPORTANT:
    // These are Edge Function environment variables.
    // Do NOT use VITE_ variables here.

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") || "";

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "[SMRITI] Missing SUPABASE_URL or SUPABASE_ANON_KEY"
      );

      return new Response(
        JSON.stringify({
          error:
            "Supabase Edge Function is not configured correctly.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 3. CREATE SUPABASE CLIENT
    // ========================================================

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );


    // ========================================================
    // 4. GET CURRENT USER
    // ========================================================

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "[SMRITI] Authentication error:",
        userError?.message
      );

      return new Response(
        JSON.stringify({
          error:
            "Unauthorized: Invalid or expired session.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 5. GET USER ROLE
    // ========================================================

    let role = user.user_metadata?.role;

    try {
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, role, full_name")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "[SMRITI] Profile lookup error:",
          profileError.message
        );
      }

      if (profile?.role) {
        role = profile.role;
      }
    } catch (profileCatchError) {
      console.error(
        "[SMRITI] Profile lookup exception:",
        profileCatchError
      );

      // Fall back to user metadata role.
    }


    // ========================================================
    // 6. PATIENT-ONLY ACCESS
    // ========================================================

    if (role !== "patient") {
      return new Response(
        JSON.stringify({
          error:
            "Forbidden: SMRITI Assistant is available exclusively to Patient accounts.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 7. GEMINI API KEY
    // ========================================================

    const geminiApiKey =
      Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error(
        "[SMRITI] GEMINI_API_KEY is missing."
      );

      return new Response(
        JSON.stringify({
          error:
            "AI Assistant service is currently unconfigured. Please configure GEMINI_API_KEY in Edge Function secrets.",
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 8. READ REQUEST BODY
    // ========================================================

    let body: {
      prompt?: string;
      context?: Record<string, unknown>;
    } = {};

    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error:
            "Bad Request: Invalid JSON body.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 9. VALIDATE PROMPT
    // ========================================================

    const rawPrompt =
      (body.prompt || "").trim();

    if (!rawPrompt) {
      return new Response(
        JSON.stringify({
          error:
            "Bad Request: Prompt text is required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }


    // ========================================================
    // 10. BUILD PROMPT
    // ========================================================

    const contextObj =
      body.context || {};

    let promptToSend = rawPrompt;


    // --------------------------------------------------------
    // Memory game result
    // --------------------------------------------------------

    if (
      contextObj.type ===
      "memory_game_result"
    ) {
      const accuracy =
        contextObj.accuracy ?? 0;

      const correctCount =
        contextObj.correctCount ?? 0;

      const totalRounds =
        contextObj.totalRounds ?? 5;

      const score =
        contextObj.score ?? 0;

      const history =
        Array.isArray(contextObj.history)
          ? contextObj.history.slice(0, 10)
          : [];


      let historyContextStr = "";


      if (history.length > 0) {
        const historyDetails =
          history
            .map((h: any, i: number) => {
              const dateStr =
                h.date ||
                `Session ${i + 1}`;

              const acc =
                h.accuracy != null
                  ? `${h.accuracy}%`
                  : "N/A";

              const corr =
                h.correctCount != null
                  ? `${h.correctCount}/${h.totalRounds || 5}`
                  : "";

              return `${dateStr}: ${acc} (${corr})`;
            })
            .join(", ");

        historyContextStr =
          `\n[Recent Previous Sessions History: ${historyDetails}]`;
      }


      promptToSend =
        `[Current Memory Game Performance Data:
Rounds completed: ${totalRounds}
Correct answers: ${correctCount} of ${totalRounds}
Accuracy: ${accuracy}%
Points: +${score}]
${historyContextStr}

Write a warm, encouraging reflection in 1 to 2 short sentences for the patient.

Mention:
- completing ${totalRounds} rounds
- getting ${correctCount} of ${totalRounds} correct
- ${accuracy}% accuracy

If previous session history is provided, briefly and gently contextualize today's performance relative to recent consistency.

Do not provide medical diagnosis, clinical assessment, or prescription advice.`;
    }


    // --------------------------------------------------------
    // Generic context
    // --------------------------------------------------------

    else if (
      contextObj &&
      typeof contextObj === "object" &&
      Object.keys(contextObj).length > 0
    ) {
      const ctxSummary =
        Object.entries(contextObj)
          .filter(
            ([_, value]) =>
              value != null &&
              value !== ""
          )
          .map(
            ([key, value]) =>
              `${key}: ${value}`
          )
          .join(", ");

      if (ctxSummary) {
        promptToSend =
          `[Context: ${ctxSummary}]\n\nQuestion: ${rawPrompt}`;
      }
    }


    // ========================================================
    // 11. CALL GEMINI (3.5 FLASH WITH FALLBACKS & 35S TIMEOUT)
    // ========================================================

    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
    ];

    const abortController = new AbortController();
    const timeoutMs = 35000; // 35 second timeout
    const timeoutTimer = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    let genRes: Response | null = null;
    let usedModel = candidateModels[0];
    let genData: any = null;

    for (const modelName of candidateModels) {
      usedModel = modelName;
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

      try {
        console.log(`[SMRITI] Invoking Gemini model: ${modelName}`);

        genRes = await fetch(restUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortController.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptToSend,
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: SYSTEM_INSTRUCTION,
                },
              ],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        genData = await genRes.json();

        // If successful or client error (not 404/429/503), break
        if (genRes.ok) {
          break;
        }

        console.warn(`[SMRITI] Model ${modelName} returned status ${genRes.status}, trying next fallback...`);
      } catch (fetchErr: any) {
        if (fetchErr?.name === "AbortError" || abortController.signal.aborted) {
          console.error(`[SMRITI] Gemini request timed out after ${timeoutMs}ms`);
          return new Response(
            JSON.stringify({
              error: "Gemini API request timed out.",
              detail: `Request exceeded ${timeoutMs / 1000}s limit.`,
            }),
            {
              status: 504,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
        console.warn(`[SMRITI] Model ${modelName} fetch error:`, fetchErr.message);
      }
    }

    clearTimeout(timeoutTimer);

    // ========================================================
    // 12. READ GEMINI RESPONSE
    // ========================================================

    if (!genRes || !genRes.ok) {
      console.error(
        "[SMRITI] Gemini API error:",
        JSON.stringify(genData)
      );

      return new Response(
        JSON.stringify({
          error:
            "Gemini API request failed.",
          detail:
            genData?.error?.message ||
            (genRes ? `HTTP ${genRes.status}: ${genRes.statusText || "Upstream Error"}` : "All Gemini model endpoints failed."),
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }


    // ========================================================
    // 13. EXTRACT RESPONSE TEXT
    // ========================================================

    const candidate = genData?.candidates?.[0];
    const replyText =
      candidate?.content?.parts?.[0]?.text;


    if (!replyText) {
      console.error(
        "[SMRITI] Gemini returned no text:",
        JSON.stringify(genData)
      );

      const finishReason = candidate?.finishReason || "UNKNOWN";
      const blockReason = genData?.promptFeedback?.blockReason;
      const detailMsg = blockReason
        ? `Prompt blocked by safety filter: ${blockReason}`
        : `Candidate finished with reason: ${finishReason}`;

      return new Response(
        JSON.stringify({
          error:
            "Gemini returned an empty response.",
          detail: detailMsg,
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }


    // ========================================================
    // 14. CLEAN RESPONSE
    // ========================================================

    const cleanedReply =
      cleanModelResponse(
        replyText
      );


    // ========================================================
    // 15. RETURN SUCCESS
    // ========================================================

    return new Response(
      JSON.stringify({
        success: true,
        reply: cleanedReply,
        model: usedModel,
        timestamp:
          new Date().toISOString(),
      }),
      {
        status: 200,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );


  } catch (err: unknown) {

    // ========================================================
    // GLOBAL ERROR HANDLER
    // ========================================================

    const errorMsg =
      err instanceof Error
        ? err.message
        : "Unknown server error";

    console.error(
      "[smriti-assistant error]:",
      errorMsg
    );

    return new Response(
      JSON.stringify({
        error:
          "An unexpected error occurred while communicating with SMRITI Assistant.",
        detail: errorMsg,
      }),
      {
        status: 500,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});