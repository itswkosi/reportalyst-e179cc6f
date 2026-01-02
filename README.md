# Reportalyst

Clarifying ambiguity in pancreatic cancer radiology reports

# *Problem*

Radiology reports for suspected pancreatic ductal adenocarcinoma (PDAC) are intentionally cautious.
They rely on hedged language such as “suspicious for,” “cannot exclude,” or “likely consistent with.”

For clinicians, the challenge is not missing information, but correctly interpreting uncertainty under time pressure.
Important signals, implied concerns, and legal hedging are often blended together in dense text, increasing cognitive load and the risk of misinterpretation.

This problem shows up daily and is rarely addressed because it does not involve prediction or diagnosis, just clarity.

# *What this project does*

Reportalyst takes a PDAC-related radiology report excerpt and separates the language into three fixed categories:

- Explicit findings: Facts directly stated or observed in the report.

- Implied concerns: Reasonable concerns suggested by wording, without certainty.

- Hedging / non-actionable language: Cautious or legal phrasing that does not state a clinical finding.

The tool does not add new information, recommend actions, or provide medical advice.
It restructures existing text to reduce mental effort during interpretation.

This is a language clarification tool, not a clinical decision system.
In pancreatic cancer care, uncertainty is unavoidable.
What is avoidable is the repeated cognitive work of mentally disentangling what a report definitively says from what it cautiously implies.

Reportalyst externalizes that interpretation step so clinicians can spend less time parsing language and more time making informed decisions.

*Example*

Input (radiology report excerpt):

“There is a 2.1 cm hypodense lesion in the pancreatic head suspicious for adenocarcinoma. No definite vascular involvement is identified, though early encasement cannot be excluded.”

Output:

Explicit findings: Hypodense lesion identified in the pancreatic head, Lesion measures 2.1 cm, No definite vascular involvement observed

Implied concerns: Suspicion of malignancy, Possible early vascular involvement

Hedging / non-actionable language: “Suspicious for”, “Cannot be excluded”

Deployment: Hosted through the builder platform

The UI and workflow are built in a managed environment, so the core logic is documented through prompts and examples rather than a traditional frontend codebase.
Built as a solo project during a 48-hour hackathon, aligned with the Biological Computing track, with a focus on AI-assisted clarity in pancreatic cancer workflows.
Future directions (out of scope for this hackathon)
Support for additional report types (pathology, guideline excerpts)
Highlighting uncertainty density across reports
Integration into existing clinical documentation workflows
No diagnostic or treatment functionality is planned.

# This project is built with Lovable using:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
