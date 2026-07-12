"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload, CheckCircle2, XCircle } from "lucide-react";
import { csvToObjects, objectsToCsv } from "@/lib/csv";
import { bulkImportProducts, type BulkRowResult } from "@/server/admin/products";
import { Button, Panel } from "@/components/ui";

const TEMPLATE_HEADER = [
  "name",
  "model",
  "category",
  "brand",
  "price",
  "compareAt",
  "condition",
  "warranty",
  "featured",
  "active",
  "description",
  "specs",
];

const TEMPLATE_EXAMPLE = [
  "HP ProBook 440",
  "440-G9",
  "Laptops",
  "HP",
  "54999",
  "",
  "NEW",
  "1 year",
  "false",
  "true",
  "14-inch business laptop.",
  "RAM:16GB|Storage:512GB SSD|Display:14\" FHD",
];

function downloadTemplate() {
  const csv = objectsToCsv(TEMPLATE_HEADER, [TEMPLATE_EXAMPLE]);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "esquire-products-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkImport({ onDone }: { onDone: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState<Record<string, string>[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkRowResult[] | null>(null);
  const [created, setCreated] = useState(0);
  const [pending, startTransition] = useTransition();

  async function onFileChosen(file: File) {
    setParseError(null);
    setResults(null);
    setFileName(file.name);

    const text = await file.text();
    const parsed = csvToObjects(text);

    if (parsed.length === 0) {
      setRows(null);
      setRowCount(0);
      setParseError("That file has no data rows.");
      return;
    }
    if (!("name" in parsed[0]) || !("price" in parsed[0])) {
      setRows(null);
      setRowCount(0);
      setParseError('The header row must include at least "name" and "price" columns.');
      return;
    }

    setRows(parsed);
    setRowCount(parsed.length);
  }

  function runImport() {
    if (!rows) return;
    startTransition(async () => {
      const result = await bulkImportProducts(rows);
      setResults(result.results);
      setCreated(result.created);
    });
  }

  function reset() {
    setFileName(null);
    setRows(null);
    setRowCount(0);
    setResults(null);
    setCreated(0);
    setParseError(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  const failures = results?.filter((r) => !r.ok) ?? [];

  return (
    <Panel glow className="p-6 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Bulk import products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV to create many products at once. This only adds new products — it never
            edits or removes existing ones.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Download size={13} aria-hidden />
          Download template
        </button>
      </div>

      {!results ? (
        <div className="space-y-4">
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFileChosen(file);
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
              <Upload size={14} aria-hidden />
              Choose CSV file
            </Button>
            {fileName ? (
              <span className="text-sm text-muted-foreground">
                {fileName}
                {rowCount > 0 ? ` — ${rowCount} row${rowCount === 1 ? "" : "s"}` : ""}
              </span>
            ) : null}
          </div>

          {parseError ? <p className="text-sm text-danger">{parseError}</p> : null}

          <p className="text-xs text-muted-foreground">
            Required columns: <code className="font-mono">name</code>,{" "}
            <code className="font-mono">price</code>. Category and brand are matched by name and
            created automatically if they don&apos;t exist yet.{" "}
            <code className="font-mono">specs</code> uses{" "}
            <code className="font-mono">Key:Value</code> pairs separated by{" "}
            <code className="font-mono">|</code>, e.g.{" "}
            <code className="font-mono">RAM:8GB|Storage:512GB SSD</code>.
          </p>

          <div className="flex gap-2 border-t border-border pt-5">
            <Button type="button" onClick={runImport} disabled={!rows || pending}>
              {pending ? "Importing…" : `Import ${rowCount || ""} products`.trim()}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-success" aria-hidden />
            <span>
              {created} of {results.length} row{results.length === 1 ? "" : "s"} imported.
            </span>
          </div>

          {failures.length > 0 ? (
            <div className="chamfer-sm max-h-64 overflow-y-auto bg-muted p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-danger">
                <XCircle size={15} aria-hidden />
                {failures.length} row{failures.length === 1 ? "" : "s"} skipped
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {failures.map((f) => (
                  <li key={f.row}>
                    Row {f.row} ({f.name}): {f.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex gap-2 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={reset}>
              Import another file
            </Button>
            <Button type="button" onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
