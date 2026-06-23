export interface PromptTemplate {
  title: string;
  prompt: string;
}

export interface TemplateCategory {
  name: string;
  templates: PromptTemplate[];
}

export const EXECUTIVE_TEMPLATES: TemplateCategory[] = [
  {
    name: "Strategic Analysis",
    templates: [
      {
        title: "Competitor Analysis",
        prompt: "Analyze the competitive landscape for [Industry/Company]. Identify the top 3 competitors, their key strengths/weaknesses, and suggest strategic differentiators for us."
      },
      {
        title: "SWOT Analysis",
        prompt: "Perform a detailed SWOT analysis for [Company/Product] based on current market trends in 2024. Focus on potential risks from AI disruption."
      },
      {
        title: "Market Entry Strategy",
        prompt: "Outline a go-to-market strategy for launching a [Product Type] in [Region]. Include key channels, pricing models, and potential regulatory hurdles."
      }
    ]
  },
  {
    name: "Communication",
    templates: [
      {
        title: "Layoff/Restructuring Memo",
        prompt: "Draft an empathetic but clear internal memo announcing a strategic restructuring that involves a 10% workforce reduction. Focus on the long-term vision and support for affected employees."
      },
      {
        title: "Investor Update",
        prompt: "Write a quarterly investor update email summarizing: 1. Record revenue growth, 2. Product delays due to technical debt, 3. Revised Q4 guidance. Keep the tone confident but transparent."
      },
      {
        title: "Crisis Response",
        prompt: "Draft a public statement addressing a recent data breach. Acknowledge the issue, explain immediate mitigation steps, and reassure customers about data safety without admitting legal liability."
      }
    ]
  },
  {
    name: "Operational & HR",
    templates: [
      {
        title: "Risk Assessment",
        prompt: "Identify the top 5 operational risks for a remote-first global SaaS company scaling from Series B to C. Propose mitigation strategies for each."
      },
      {
        title: "AI Policy Drafting",
        prompt: "Draft a 'Responsible AI Use' policy for employees, covering data privacy, copyright issues, and acceptable use cases. Keep it concise and actionable."
      },
      {
        title: "OKRs Generation",
        prompt: "Generate 3 ambitious but achievable OKRs (Objectives and Key Results) for a Marketing VP focusing on brand awareness and lead generation for Q3."
      }
    ]
  }
];
