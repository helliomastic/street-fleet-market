import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePriceSuggestion } from "@/hooks/usePriceSuggestion";
import type { QueryInput } from "@/utils/pricing/knn";
import { Info } from "lucide-react";

type Props = {
  values: QueryInput;
  onApply: (price: number) => void;
};

export default function PriceSuggestion({ values, onApply }: Props) {
  const { result, loading, error } = usePriceSuggestion(values, { k: 7, roundStep: 1000 });

  if (error) return null;

  const canShow = !!result.suggestedPrice && !loading;

  return (
    <div className="space-y-2">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Price suggestion</AlertTitle>
        <AlertDescription>
          {loading && "Analyzing similar listings..."}
          {!loading && canShow && (
            <div className="flex items-center justify-between gap-3">
              <div>
                Suggested: <span className="font-semibold">Rs {result.suggestedPrice?.toLocaleString()}</span>
                {typeof result.confidence === "number" && (
                  <span className="ml-2 text-muted-foreground">(confidence {(result.confidence * 100).toFixed(0)}%)</span>
                )}
              </div>
              <Button size="sm" variant="secondary" onClick={() => onApply(result.suggestedPrice!)}>
                Use suggestion
              </Button>
            </div>
          )}
          {!loading && !canShow && (
            <span className="text-muted-foreground">Enter make, model, and year to get a smart price suggestion.</span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
