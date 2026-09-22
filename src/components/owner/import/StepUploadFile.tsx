// src/components/owner/import/StepUploadFile.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateImportTemplateCsv, downloadFile, parseCsvContent } from "@/lib/import-members-utils";

interface StepUploadFileProps {
  onFileLoaded: (file: File, headers: string[], rows: Record<string, string>[]) => void;
  selectedFile: File | null;
  rowCount: number;
  onResetFile: () => void;
  title?: string;
  description?: string;
  templateFilename?: string;
  onDownloadTemplate?: () => void;
}

export function StepUploadFile({
  onFileLoaded,
  selectedFile,
  rowCount,
  onResetFile,
  title = "Upload member data",
  description = "Upload a CSV or Excel file containing your existing gym members.",
  templateFilename = "TrackVim_Member_Import_Template.csv",
  onDownloadTemplate,
}: StepUploadFileProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setErrorMsg(null);
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size exceeds maximum limit of 10 MB.");
        return;
      }

      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx") && !fileName.endsWith(".txt")) {
        setErrorMsg("Please upload a supported file type (.csv or .xlsx).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const { headers, rows } = parseCsvContent(content);
          if (headers.length === 0 || rows.length === 0) {
            setErrorMsg("The uploaded file appears to be empty or contains no data rows.");
            return;
          }
          onFileLoaded(file, headers, rows);
        } catch (err: any) {
          setErrorMsg("Could not parse file. Please ensure it is a valid CSV file.");
        }
      };
      reader.onerror = () => {
        setErrorMsg("Failed to read file.");
      };
      reader.readAsText(file);
    },
    [onFileLoaded],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [processFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".csv", ".txt"],
    },
  });

  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
      return;
    }
    const csvContent = generateImportTemplateCsv();
    downloadFile(templateFilename, csvContent);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>
                {description}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Import Template
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div>
              <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {isDragActive ? "Drop your file here..." : "Drag & drop your file here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to choose a file from your computer
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="font-mono text-xs">
                    CSV
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    XLSX
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10 MB
                </p>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base">
                    {selectedFile.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      {rowCount.toLocaleString()} rows detected
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetFile}
                className="gap-2 shrink-0 border-border hover:bg-muted"
              >
                <RefreshCw className="w-4 h-4" />
                Replace File
              </Button>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/40 border border-border/50 text-xs sm:text-sm text-muted-foreground flex items-start gap-3">
            <Download className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Pro-tip: </span>
              Use our downloadable template to automatically map headers like Full Name, Phone, Membership Plan, and Dates!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
