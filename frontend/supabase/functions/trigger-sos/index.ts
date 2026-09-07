/// <reference types="npm:@supabase/functions-js/edge-runtime.d.ts" />

// Supabase Edge Function: trigger-sos
// Validates distress signals, creates sos_alerts records, queries linked caregivers,
// and delivers real Web Push notifications with VAPID authentication.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SosRequestPayload {
  patientId: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
}

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Supabase environment configuration (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) missing.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Parse & Validate Payload
    const body: SosRequestPayload = await req.json();
    const { patientId, latitude, longitude } = body;

    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: patientId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Spam / Anti-Duplicate Prevention (15s sliding window)
    const fifteenSecsAgo = new Date(Date.now() - 15000).toISOString();
    const { data: recentAlerts } = await supabaseAdmin
      .from("sos_alerts")
      .select("id, status, triggered_at, latitude, longitude")
      .eq("patient_id", patientId)
      .eq("status", "active")
      .gte("triggered_at", fifteenSecsAgo)
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyActive: true,
          alert: recentAlerts[0],
          message: "An active emergency signal is already broadcasting.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Save SOS Alert into Postgres DB
    const { data: alertRecord, error: insertError } = await supabaseAdmin
      .from("sos_alerts")
      .insert([
        {
          patient_id: patientId,
          status: "active",
          latitude: latitude != null ? Number(latitude) : null,
          longitude: longitude != null ? Number(longitude) : null,
          triggered_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("[trigger-sos] Database insert error:", insertError);
      throw insertError;
    }

    // 5. Fetch Patient Info & Associated Caregivers
    const { data: patientRecord } = await supabaseAdmin
      .from("patients")
      .select("id, profile_id, profiles(full_name)")
      .eq("id", patientId)
      .maybeSingle();

    const patientName =
      (patientRecord?.profiles as any)?.full_name || "Your monitored patient";

    const { data: linkedCaretakers } = await supabaseAdmin
      .from("caretaker_patient")
      .select("caretaker_id")
      .eq("patient_id", patientId);

    const caretakerIds = (linkedCaretakers || []).map((c: any) => c.caretaker_id);

    // 6. Query Active Caregiver Device Subscriptions
    let devices: any[] = [];
    if (caretakerIds.length > 0) {
      const { data: deviceRows, error: deviceError } = await supabaseAdmin
        .from("caregiver_devices")
        .select("id, caretaker_id, endpoint, p256dh, auth")
        .in("caretaker_id", caretakerIds)
        .eq("is_active", true);

      if (!deviceError && deviceRows) {
        devices = deviceRows;
      }
    }

    // 7. Dispatch Real Web Push Notifications via VAPID
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:emergency@smriti.app";

    const pushStats = {
      totalDevices: devices.length,
      delivered: 0,
      expired: 0,
      failed: 0,
      vapidConfigured: Boolean(vapidPublicKey && vapidPrivateKey),
    };

    if (pushStats.vapidConfigured && devices.length > 0) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey!, vapidPrivateKey!);

      const pushPayload = JSON.stringify({
        title: "🚨 EMERGENCY SOS ALERT",
        body: `${patientName} triggered an emergency distress signal! Open SMRITI to monitor location & acknowledge.`,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        data: {
          url: "/caretaker/sos",
          alertId: alertRecord.id,
          patientId: patientId,
          triggeredAt: alertRecord.triggered_at,
          latitude: alertRecord.latitude,
          longitude: alertRecord.longitude,
        },
      });

      const pushPromises = devices.map(async (dev) => {
        const pushSubscription = {
          endpoint: dev.endpoint,
          keys: {
            p256dh: dev.p256dh,
            auth: dev.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, pushPayload, {
            TTL: 60,
            urgency: "high",
          });
          pushStats.delivered += 1;
        } catch (pushErr: any) {
          console.error(`[trigger-sos] Push delivery failed for device ${dev.id}:`, pushErr);

          // If subscription has expired or is invalid (410 Gone / 404 Not Found), deactivate it
          const statusCode = pushErr.statusCode || pushErr.status;
          if (statusCode === 410 || statusCode === 404) {
            pushStats.expired += 1;
            await supabaseAdmin
              .from("caregiver_devices")
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq("id", dev.id);
          } else {
            pushStats.failed += 1;
          }
        }
      });

      await Promise.allSettled(pushPromises);
    } else if (!pushStats.vapidConfigured) {
      console.warn("[trigger-sos] VAPID keys not configured in Supabase secrets. Push notifications skipped.");
    }

    // 8. Return Response
    return new Response(
      JSON.stringify({
        success: true,
        alert: alertRecord,
        patientName,
        pushStats,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("[trigger-sos] Function exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error triggering SOS" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
