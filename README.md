# SMRITI — Smart Caretaking & Memory Support Platform

SMRITI is a production-ready, fully responsive, real-time healthcare application designed for dementia and Alzheimer's patients and their caregivers. It combines cognitive stimulation games, voice interaction, cloud-synchronized medication tracking, doctor & visitor appointments, live GPS tracking, and emergency distress monitoring.

---

## 🌟 Key Features

### 👤 Patient Experience
- **Adaptive Responsive UI**: Designed with high contrast, large touch targets, and accessible typography fluidly adapting across Mobile, Tablet, and Desktop.
- **Cognitive Memory Challenge**: Dynamic family photo recognition challenge with Web Speech API integration, real-time accuracy scoring, and sound effects.
- **Medication Reminders**: Daily prescription schedules with single-tap intake logging and real-time caregiver synchronization.
- **Doctor & Visitor Schedule**: Daily calendar of medical visits and family appointments.
- **Emergency SOS**: Immediate one-tap distress broadcasting with live satellite GPS transmission and direct caregiver calling.
- **Medical Vault & Album**: Secure Supabase Storage photo albums and encrypted document viewer with signed download URLs.
- **Multi-language Support**: English, Hindi, and regional North-East languages (Assamese, Bodo, Kokborok, Manipuri).

### 🩺 Caretaker Portal
- **Centralized Care Hub**: Multi-patient connection via short readable SMRITI pairing codes (e.g. SMRITI-X7K9P2).
- **Prescription Manager**: Add, update, and monitor daily doses with intake confirmation logs.
- **Appointment Scheduling**: Plan clinical visits and family appointments with real-time patient notification.
- **Live GPS & Geofence Radar**: Real-time Leaflet/OpenStreetMap telemetry stream with satellite fix coordinates.
- **Cognitive Health Analytics**: Interactive SVG-rendered memory performance curves and clinical observation notes.
- **Real-time SOS Distress Monitor**: Instant alert notifications, acknowledgement workflow, and safety resolution.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, React Router v7, React Leaflet
- **Backend & Database**: Supabase PostgreSQL with strict Row Level Security (RLS) policies
- **Storage**: Supabase Storage (`gallery` and `documents` private buckets)
- **Real-time**: Supabase Realtime WebSocket publications + MQTT fallback stream
- **Styling**: Native responsive CSS design system (fluid CSS Grid & Flexbox, no simulated device frames)

---

## 🚀 Getting Started

### 1. Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the complete schema from [`backend/schema.sql`](file:///d:/Smriti/SMRITI/backend/schema.sql).

### 2. Frontend Configuration
1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Provide your Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
5. To produce an optimized production build:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
SMRITI/
├── backend/
│   └── schema.sql              # Normalized database schema, RLS, triggers & storage policies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute and role guards
│   │   │   ├── charts/         # Responsive MemoryActivityChart
│   │   │   ├── icons/          # SVG icon system
│   │   │   ├── layout/         # AppLayout, TopBar, SidebarNav, BottomNav
│   │   │   └── ui/             # Card, Button, Input, Modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Supabase auth & profile state
│   │   │   └── ToastContext.jsx# Lightweight toast notifications
│   │   ├── hooks/              # Domain hooks (useMedications, useSos, useGallery, etc.)
│   │   ├── pages/
│   │   │   ├── patient/        # Patient portal pages (home, games, meds, sos, stats, account)
│   │   │   └── caretaker/      # Caretaker portal pages (dashboard, meds, visits, gps, analytics)
│   │   ├── routes/             # PatientRoutes and CaretakerRoutes
│   │   ├── services/           # Supabase service layer
│   │   └── styles/             # globals.css, components.css, variables.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```
