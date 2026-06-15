import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <h3 className="font-display font-semibold">{title}</h3>
          {message && (
            <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
              {message}
            </p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default ErrorState
