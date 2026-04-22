import { useState } from "react";

const AGENT_SYSTEM_PROMPT = `You are a business intelligence agent for a boba tea shop manager. 
Your job is to research and provide actionable recommendations. 
When asked, use web search to find:
1. Current boba/bubble tea prices at nearby competitors (search for local boba shops and their menus/prices)
2. Trending boba flavors, ingredients, or news (endorsements, viral drinks, health trends)
3. Based on findings, suggest new menu items or pricing adjustments

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact structure:
{
  "pricing": {
    "summary": "1-2 sentence summary of local pricing landscape",
    "insights": ["insight 1", "insight 2", "insight 3"],
    "avgPrice": "$X.XX",
    "recommendation": "specific pricing recommendation"
  },
  "trends": {
    "summary": "1-2 sentence summary of current trends",
    "items": [
      { "title": "trend name", "description": "short description", "type": "viral|health|seasonal|celebrity" }
    ]
  },
  "menuSuggestions": [
    {
      "name": "Item Name",
      "description": "Short description of the item",
      "suggestedPrice": "$X.XX",
      "reason": "why this would do well",
      "category": "drink|food|topping|seasonal"
    }
  ],
  "lastUpdated": "ISO timestamp string"
}`;

const BADGE_STYLES = {
    viral: { bg: "#FAECE7", color: "#993C1D", label: "Viral" },
    health: { bg: "#EAF3DE", color: "#3B6D11", label: "Health" },
    seasonal: { bg: "#FAEEDA", color: "#854F0B", label: "Seasonal" },
    celebrity: { bg: "#EEEDFE", color: "#3C3489", label: "Endorsement" },
    drink: { bg: "#E6F1FB", color: "#185FA5", label: "Drink" },
    food: { bg: "#FAEEDA", color: "#854F0B", label: "Food" },
    topping: { bg: "#E1F5EE", color: "#0F6E56", label: "Topping" },
};

function Badge({ type }) {
    const style = BADGE_STYLES[type] || BADGE_STYLES.drink;
    return (
        <span style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 6,
            backgroundColor: style.bg,
            color: style.color,
            textTransform: "capitalize",
            letterSpacing: "0.02em",
        }}>
      {style.label}
    </span>
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{
            background: "#fff",
            border: "0.5px solid #e5e5e5",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            ...style,
        }}>
            {children}
        </div>
    );
}

function SectionHeader({ icon, title, subtitle }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</h3>
            </div>
            {subtitle && <p style={{ margin: 0, fontSize: 13, color: "#666", marginLeft: 24 }}>{subtitle}</p>}
        </div>
    );
}

function LoadingDots() {
    return (
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center", marginLeft: 6 }}>
      {[0, 1, 2].map(i => (
          <span key={i} style={{
              width: 5, height: 5, borderRadius: "50%", background: "#888",
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }} />
      ))}
            <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </span>
    );
}

function PricingSection({ data }) {
    return (
        <Card>
            <SectionHeader icon="💰" title="Local Pricing Intelligence" subtitle={data.summary} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#F1EFE8", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 2 }}>Area avg. price</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: "#2C2C2A" }}>{data.avgPrice}</div>
                </div>
                <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#0F6E56", marginBottom: 2 }}>Recommendation</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#085041", lineHeight: 1.4 }}>{data.recommendation}</div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data.insights.map((insight, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#1D9E75", fontSize: 13, marginTop: 2, flexShrink: 0 }}>›</span>
                        <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{insight}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function TrendsSection({ data }) {
    return (
        <Card>
            <SectionHeader icon="📈" title="Trends & Buzz" subtitle={data.summary} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.items.map((item, i) => (
                    <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        padding: "8px 0",
                        borderBottom: i < data.items.length - 1 ? "0.5px solid #eee" : "none",
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{item.description}</div>
                        </div>
                        <Badge type={item.type} />
                    </div>
                ))}
            </div>
        </Card>
    );
}

function MenuSuggestionsSection({ data }) {
    return (
        <Card>
            <SectionHeader icon="✨" title="Menu Suggestions" subtitle="AI-generated ideas based on current trends" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.map((item, i) => (
                    <div key={i} style={{
                        border: "0.5px solid #eee",
                        borderRadius: 8,
                        padding: "10px 12px",
                        background: "#fafafa",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{item.name}</span>
                                <Badge type={item.category} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#185FA5" }}>{item.suggestedPrice}</span>
                        </div>
                        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#444", lineHeight: 1.4 }}>{item.description}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 500, color: "#1D9E75" }}>Why it works: </span>{item.reason}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function Recommendations() {
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | done | error
    const [statusMsg, setStatusMsg] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const runAgent = async () => {
        if (!location.trim()) return;
        setStatus("loading");
        setError("");
        setData(null);

        const steps = [
            "Searching for local boba shops and prices...",
            "Scanning social media trends and news...",
            "Analyzing competitor offerings...",
            "Generating personalized recommendations...",
        ];

        let stepIndex = 0;
        setStatusMsg(steps[0]);
        const stepInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % steps.length;
            setStatusMsg(steps[stepIndex]);
        }, 3500);

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: AGENT_SYSTEM_PROMPT,
                    tools: [{ type: "web_search_20250305", name: "web_search" }],
                    messages: [{
                        role: "user",
                        content: `Research boba/bubble tea market intelligence for a shop located in: ${location}. 
Search for current boba shop prices in this area, trending drinks, and any relevant news or endorsements. 
Then provide menu suggestions tailored to this market.`,
                    }],
                }),
            });

            clearInterval(stepInterval);

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const result = await response.json();
            const textBlock = result.content?.find(b => b.type === "text");
            if (!textBlock) throw new Error("No text response from agent");

            const clean = textBlock.text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            setData(parsed);
            setStatus("done");
        } catch (err) {
            clearInterval(stepInterval);
            setError(err.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 600, color: "#1a1a1a" }}>
                    AI Recommendations
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                    Search local competitors, track trends, and get personalized menu suggestions.
                </p>
            </div>

            <Card style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Enter your city or neighborhood (e.g. Austin, TX)"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && status !== "loading" && runAgent()}
                        style={{
                            flex: 1,
                            padding: "8px 12px",
                            fontSize: 14,
                            border: "0.5px solid #ddd",
                            borderRadius: 8,
                            outline: "none",
                            color: "#1a1a1a",
                            background: "#fff",
                        }}
                        disabled={status === "loading"}
                    />
                    <button
                        onClick={runAgent}
                        disabled={status === "loading" || !location.trim()}
                        style={{
                            padding: "8px 18px",
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 8,
                            border: "none",
                            cursor: status === "loading" || !location.trim() ? "not-allowed" : "pointer",
                            background: status === "loading" || !location.trim() ? "#e5e5e5" : "#1a1a1a",
                            color: status === "loading" || !location.trim() ? "#999" : "#fff",
                            transition: "background 0.15s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {status === "loading" ? "Running..." : "Run Agent"}
                    </button>
                </div>
            </Card>

            {status === "loading" && (
                <Card style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            border: "2px solid #eee", borderTopColor: "#1a1a1a",
                            animation: "spin 0.8s linear infinite", flexShrink: 0,
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{statusMsg}</div>
                            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>This may take 20–40 seconds</div>
                        </div>
                    </div>
                </Card>
            )}

            {status === "error" && (
                <Card style={{ marginBottom: 20, borderColor: "#F09595" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#A32D2D", fontSize: 16 }}>⚠</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#A32D2D" }}>Agent Error</div>
                            <div style={{ fontSize: 12, color: "#791F1F", marginTop: 2 }}>{error}</div>
                        </div>
                    </div>
                </Card>
            )}

            {status === "done" && data && (
                <>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 14, textAlign: "right" }}>
                        Last updated: {new Date(data.lastUpdated).toLocaleString()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {data.pricing && <PricingSection data={data.pricing} />}
                        {data.trends && <TrendsSection data={data.trends} />}
                        {data.menuSuggestions?.length > 0 && <MenuSuggestionsSection data={data.menuSuggestions} />}
                    </div>
                    <div style={{ marginTop: 16, textAlign: "right" }}>
                        <button
                            onClick={() => { setStatus("idle"); setData(null); }}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: 13, color: "#999", padding: 0,
                            }}
                        >
                            Clear results
                        </button>
                    </div>
                </>
            )}

            {status === "idle" && (
                <div style={{
                    textAlign: "center", padding: "40px 20px",
                    border: "0.5px dashed #ddd", borderRadius: 12, color: "#999",
                }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🧋</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "#666" }}>
                        Ready to research your market
                    </div>
                    <div style={{ fontSize: 13 }}>
                        Enter your location and run the agent to get started.
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recommendations;