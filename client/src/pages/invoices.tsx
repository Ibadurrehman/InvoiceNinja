import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateInvoiceModal } from "@/components/create-invoice-modal";
import { PaymentModal } from "@/components/payment-modal";
import { Plus, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Invoice, Client } from "@shared/schema";

type InvoiceWithClient = Invoice & { client: Client };

type FilterType = "all" | "paid" | "sent" | "overdue";

export default function Invoices() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithClient | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: invoices, isLoading } = useQuery<InvoiceWithClient[]>({
    queryKey: ["/api/invoices"],
  });

  const filteredInvoices = invoices?.filter(invoice => {
    if (filter === "all") return true;
    return invoice.status === filter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 dark:text-green-400";
      case "sent":
        return "text-orange-600 dark:text-orange-400";
      case "overdue":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-muted rounded-lg h-12 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Invoices</h2>
        <Button size="sm" onClick={() => setShowCreateInvoice(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {(["all", "paid", "sent", "overdue"] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
              filter === filterType
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices?.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">
                {filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices?.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{invoice.number}</p>
                    <p className="text-muted-foreground text-sm">{invoice.client.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>Created: {formatDate(invoice.createdAt)}</span>
                  <span>Due: {formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.status !== "paid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowPaymentModal(true);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateInvoiceModal
        open={showCreateInvoice}
        onOpenChange={setShowCreateInvoice}
      />

      {selectedInvoice && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.number}
          totalAmount={selectedInvoice.total}
        />
      )}
    </div>
  );
}
