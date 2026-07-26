// The AI prompt users can copy to convert their data to ChartFlow JSON format

export const SCHEMA_TEMPLATE = `{
  "title": "Your Chart Title",
  "description": "Optional subtitle or description",
  "xKey": "category",
  "series": [
    { "key": "value1", "label": "Series 1 Name" },
    { "key": "value2", "label": "Series 2 Name" }
  ],
  "data": [
    { "category": "Label A", "value1": 100, "value2": 80 },
    { "category": "Label B", "value1": 150, "value2": 120 },
    { "category": "Label C", "value1": 90,  "value2": 70  }
  ]
}`;

export const AI_PROMPT_TEMPLATE = `You are a data formatting assistant. Convert the data I provide into the following JSON format for ChartFlow, a data visualization platform.

## Required JSON Format:
\`\`\`json
{
  "title": "Descriptive chart title",
  "description": "Optional subtitle",
  "xKey": "fieldNameForXAxis",
  "series": [
    { "key": "numericField1", "label": "Human Readable Label 1" },
    { "key": "numericField2", "label": "Human Readable Label 2" }
  ],
  "data": [
    { "fieldNameForXAxis": "Category Label", "numericField1": 100, "numericField2": 80 }
  ]
}
\`\`\`

## Rules:
- "xKey" must match the field name used as the category/label (X axis)
- Each item in "series" must have a "key" matching a numeric field in data rows
- All values in data rows referenced by series keys must be numbers
- "data" must be an array of flat objects (no nesting)
- Generate a meaningful "title" from the data content

## My data:
[PASTE YOUR DATA HERE — CSV, table, or description]

Return ONLY valid JSON, no explanation.`;

export const FIELD_DESCRIPTIONS = [
  { field: "title",       type: "string",   required: true,  desc: "Chart headline shown at the top" },
  { field: "description", type: "string",   required: false, desc: "Optional subtitle / context" },
  { field: "xKey",        type: "string",   required: true,  desc: "Field name used as X-axis / category label" },
  { field: "series",      type: "array",    required: true,  desc: "List of data series to plot" },
  { field: "series[].key",   type: "string", required: true, desc: "Field name in data objects (must be numeric)" },
  { field: "series[].label", type: "string", required: true, desc: "Display name in legend and tooltip" },
  { field: "series[].color", type: "hex",   required: false, desc: "Hex color — auto-assigned from palette if omitted" },
  { field: "series[].role",  type: "enum",  required: false, desc: "'bar' | 'line' | 'area' — for composed charts only" },
  { field: "data",        type: "array",    required: true,  desc: "Array of row objects. Each row must have xKey + series keys" },
];
