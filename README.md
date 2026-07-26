<div align="center">
  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #A78BFA, #7C3AED); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5); margin: 0 auto 20px;">
    📊
  </div>
  <h1 align="center">ChartFlow</h1>
  <p align="center">
    <strong>A 100% Client-Side, AI-Powered Data Extraction & Charting Platform</strong>
  </p>
  <p align="center">
    Turn any messy text, unstructured data, or CSVs into beautiful, interactive charts entirely in your browser using the LLM of your choice.
  </p>
</div>

<br />

## 🌟 What is ChartFlow?

ChartFlow solves the problem of getting messy, unstructured data into beautiful visualizations without the tedious manual cleanup. 

Simply upload a file or paste raw text, and ChartFlow's AI engine will automatically structure it into clean JSON and instantly render it into stunning charts. Because everything runs client-side in your browser, **your data never touches our servers**.

### Key Features
* **Bring Your Own AI:** Plug in your own API keys for OpenAI, Groq, OpenRouter, or even connect to local models via Ollama and LM Studio.
* **100% Client-Side:** No backends. No databases. Your API keys are kept strictly in `sessionStorage` and your data is saved in `localStorage`. Total privacy.
* **Universal Parsing:** Paste in meeting notes, messy CSVs, financial logs, or raw Markdown. The AI figures out the schema automatically.
* **Intelligent Chunking:** Automatically breaks down large documents into manageable chunks to process large datasets without hitting LLM context limits.
* **Instant Visualizations:** Powered by [Recharts](https://recharts.org/), featuring over a dozen dynamic chart types (Bar, Line, Area, Pie, Radar, Scatter, etc.).
* **Data Editor:** Edit the extracted raw JSON directly and watch your charts update in real time.

---

## 🚀 Getting Started

Running ChartFlow locally is incredibly simple. It's built on Next.js, React, and Tailwind CSS.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/chartflow.git
cd chartflow
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4. Open the App
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ How to use ChartFlow

1. **Configure your AI:** Click the Settings (⚙️) icon in the top right. Select your preferred provider (e.g., Groq for lightning-fast parsing, OpenAI for reasoning, or a local endpoint) and enter your API key.
2. **Input Data:** In the Studio, paste unstructured text into the text area, or use the file upload button to upload CSVs, text files, or JSON.
3. **Generate:** Hit "Generate Chart". ChartFlow will process the text in the background and construct a structured JSON dataset.
4. **Visualize & Edit:** Instantly view the generated charts. You can toggle to the "Raw Data" tab to manually correct any extracted data.
5. **Save:** Your charts are automatically saved locally in your browser and can be managed from the Dashboard.

## 🛠 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS + Radix UI Primitives
* **Charts:** Recharts
* **State Management:** React Hooks + LocalStorage
* **Icons:** Lucide React

## 🔒 Security & Privacy Notice
ChartFlow is a **Bring Your Own Key (BYOK)** platform. 
* **API Keys** are stored temporarily in your browser's `sessionStorage`. They are cleared when you close the tab.
* **Extracted Data** is stored persistently in your browser's `localStorage` so you can revisit your dashboard later, but it is never transmitted to any third-party database.
* Data is only transmitted to the LLM provider you explicitly configure in the settings.

## 🤝 Contributing
Contributions are always welcome! Whether it's adding new chart variants, supporting new LLM providers natively, or improving the data-chunking pipeline, feel free to open a Pull Request.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
