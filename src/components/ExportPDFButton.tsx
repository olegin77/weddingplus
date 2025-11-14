import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2 } from "lucide-react";

interface ExportPDFButtonProps {
  planId: string;
  planName?: string;
}

const ExportPDFButton = ({ planId, planName }: ExportPDFButtonProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('export-wedding-plan-pdf', {
        body: { planId }
      });

      if (error) throw error;

      // Create blob from HTML and download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-plan-${planName || planId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Экспорт успешен",
        description: "План свадьбы экспортирован"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать план",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline">
      {exporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Экспорт...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Экспорт в HTML
        </>
      )}
    </Button>
  );
};

export default ExportPDFButton;