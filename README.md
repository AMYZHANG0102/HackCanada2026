# 🍁 Maple Margin — Navigating the 2026 Tariff Shock

Welcome to **Maple Margin**, a real-time, interactive dashboard designed to visualize the sweeping ripple effects of proposed US tariff policies on Canadian exports and the broader North American supply chain. 

Built for HackCanada 2026! 🇨🇦

## 🚀 What is Maple Margin?

Maple Margin turns complex economic policies into actionable, visual insights. If a 25% tariff is slapped on Canadian lumber or automotive parts, what happens next? 

Our platform allows users to:
- **Simulate Scenarios**: Select key Canadian export sectors, adjust the tariff slider, and watch the economic impact unfold.
- **Visualize the Ripple**: Explore dynamic charts showing price escalations, supply chain disruptions, and shifting global trade routes.
- **AI-Powered Briefings**: Paste a news article link into our "Storytelling" concept page to instantly synthesize complex economic news into an interactive, ChatSlide-style presentation.
- **Accessible Insights**: Highlight any text on the page and use our premium AI-driven "Highlight Reader" to have the insights read aloud.

## 🛠️ Technologies Used

- **Frontend Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling & Design System**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Animations**: Tailwind Animate, React Lenis (smooth scrolling)
- **AI & Integrations**:
  - **Antigravity (by Google DeepMind)**: Served as the primary AI pair programmer—rapidly prototyping the UI, generating complex Recharts visualizations, modeling the mock data, and integrating third-party APIs like ElevenLabs natively into the codebase.
  - **[ElevenLabs API](https://elevenlabs.io/)** for lifelike Text-to-Speech accessibility.
  - **[OpenAI API](https://openai.com/)** & **Cheerio** (used for the conceptual article analysis engine).

## 👥 Meet the Team & Contributions

- **Jean G** - Frontend architecture, UI/UX design implementation, and Alice theme styling integration.
- **Amy Z** - Project coordination, continuous deployment, and mock-data modeling/scoping.
*(Add or update team members and exact roles here!)*

## ⚙️ How to Set It Up & Use It

**1. Clone the repository**
```bash
git clone https://github.com/AMYZHANG0102/HackCanada2026.git
cd HackCanada2026/frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env.local` file in the `frontend` directory and add your API keys:
```env
# Required for the Highlight Reader accessibility feature
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Required for the AI Article Analysis (Concept feature)
OPENAI_API_KEY=your_openai_api_key_here
```

**4. Run the development server**
```bash
npm run dev
```

**5. Explore the app**
Open [http://localhost:3000](http://localhost:3000) in your browser. 
- Try adjusting the sliders in the core visualizer to see trade effects.
- Check out `/concept` to see the AI Storytelling interactive presentation.
- Use the **Accessibility Menu** in the header to enable the Highlight Reader, then select any text!

## 🧠 How It Works Under the Hood

When a user selects a sector and adjusts the tariff rate, our custom **Tariff Simulation Engine** (`src/lib/tariff-engine.ts`) calculates the theoretical cascading effects—from immediate border friction costs to long-term consumer price indexes. It then feeds this data into our Recharts-powered dashboard for immediate visual feedback. 

For accessibility, we globally injected a bespoke **Selection Reader** component that listens for text highlights. If enabled in the Accessibility Menu, it securely pings the ElevenLabs API to stream a lifelike voice-over of the selected data, gracefully falling back to native browser speech if an API key isn't provided or goes offline.
