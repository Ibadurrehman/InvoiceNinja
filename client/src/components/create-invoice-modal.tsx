import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client, Settings } from "@shared/schema";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceModal({ open, onOpenChange }: CreateInvoiceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: nextNumber } = useQuery<{ number: string }>({
    queryKey: ["/api/invoices/next-number"],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: "",
      dueDate: "",
      taxRate: "0",
      items: [{ description: "", quantity: "1", rate: "" }],
    },
  });

  // Update tax rate when settings load
  useEffect(() => {
    if (settings?.defaultTaxRate) {
      form.setValue("taxRate", settings.defaultTaxRate);
    }
  }, [settings, form]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceForm) => {
      const items = data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: (parseFloat(item.quantity) * parseFloat(item.rate)).toString(),
      }));

      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const taxRate = parseFloat(data.taxRate || "0");
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const invoiceData = {
        number: nextNumber?.number || "INV-001",
        clientId: parseInt(data.clientId),
        status: "draft",
        subtotal: subtotal.toString(),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        dueDate: new Date(data.dueDate),
      };

      const response = await apiRequest("POST", "/api/invoices", {
        invoice: invoiceData,
        items,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Invoice creation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { description: "", quantity: "1", rate: "" }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (data: CreateInvoiceForm) => {
    console.log("Form submission data:", data);
    console.log("Form errors:", form.formState.errors);
    createInvoiceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>Invoice #</FormLabel>
                <Input value={nextNumber?.number || "INV-001"} disabled />
              </div>
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Items</FormLabel>
              <div className="space-y-3 mt-2">
                {form.watch("items").map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="col-span-5">
                          <FormControl>
                            <Input placeholder="Item description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="text-sm">
                        ${((parseFloat(form.watch(`items.${index}.quantity`) || "0") * 
                           parseFloat(form.watch(`items.${index}.rate`) || "0"))).toFixed(2)}
                      </span>
                      {form.watch("items").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={createInvoiceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createInvoiceMutation.isPending}
              >
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
