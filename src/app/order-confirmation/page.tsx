import { Suspense } from 'react';
import OrderConfirmationDetails from '@/components/order-confirmation-details';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

function OrderConfirmationSkeleton() {
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CheckCircle2 className="h-10 w-10 text-gray-400" />
            </div>
            <Skeleton className="h-9 w-3/4 mx-auto mt-4" />
            <Skeleton className="h-7 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full mb-8" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-11 w-full sm:w-auto sm:px-12" />
              <Skeleton className="h-11 w-full sm:w-auto sm:px-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmationDetails />
    </Suspense>
  );
}
