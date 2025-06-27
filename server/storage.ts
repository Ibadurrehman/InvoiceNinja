import { 
  clients, 
  invoices, 
  invoiceItems, 
  payments, 
  settings,
  type Client, 
  type InsertClient,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Payment,
  type InsertPayment,
  type Settings,
  type InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, sum, isNull, and } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(companyId: number): Promise<Client[]>;
  getClient(id: number, companyId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, companyId: number): Promise<Client | undefined>;
  deleteClient(id: number, companyId: number): Promise<boolean>;

  // Invoices
  getInvoices(companyId: number): Promise<(Invoice & { client: Client })[]>;
  getInvoice(id: number, companyId: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>, companyId: number): Promise<Invoice | undefined>;
  deleteInvoice(id: number, companyId: number): Promise<boolean>;

  // Invoice Items
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  // Payments
  getPayments(companyId: number, invoiceId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Settings
  getSettings(companyId: number): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>, companyId: number): Promise<Settings>;

  // Dashboard
  getDashboardStats(companyId: number): Promise<{
    totalIncome: number;
    dueAmount: number;
    dueInvoicesCount: number;
    recentTransactions: (Payment & { client: Client; invoiceNumber: string })[];
  }>;

  // Invoice number generation
  getNextInvoiceNumber(companyId: number): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  private currentInvoiceNumber: number = 1;

  async getClients(companyId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.companyId, companyId));
  }

  async getClient(id: number, companyId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(
      and(eq(clients.id, id), eq(clients.companyId, companyId))
    );
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>, companyId: number): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientUpdate)
      .where(and(eq(clients.id, id), eq(clients.companyId, companyId)))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number, companyId: number): Promise<boolean> {
    const result = await db.delete(clients).where(
      and(eq(clients.id, id), eq(clients.companyId, companyId))
    );
    return (result.rowCount || 0) > 0;
  }

  async getInvoices(companyId: number): Promise<(Invoice & { client: Client })[]> {
    const result = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.companyId, companyId));
    
    return result.map(row => ({
      ...row.invoices,
      client: row.clients!
    }));
  }

  async getInvoice(id: number, companyId: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined> {
    const [invoiceWithClient] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, id), eq(invoices.companyId, companyId)));

    if (!invoiceWithClient) return undefined;

    const items = await this.getInvoiceItems(id);
    
    return {
      ...invoiceWithClient.invoices,
      client: invoiceWithClient.clients!,
      items
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    try {
      const [invoice] = await db
        .insert(invoices)
        .values({
          ...insertInvoice,
          status: "sent" // Automatically set new invoices as "sent" so they appear in due amounts
        })
        .returning();

      // Create invoice items
      for (const item of items) {
        await db
          .insert(invoiceItems)
          .values({
            ...item,
            invoiceId: invoice.id,
          });
      }

      return invoice;
    } catch (error) {
      console.error("Database error in createInvoice:", error);
      throw error;
    }
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>, companyId: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceUpdate)
      .where(and(eq(invoices.id, id), eq(invoices.companyId, companyId)))
      .returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: number, companyId: number): Promise<boolean> {
    // First verify invoice belongs to company
    const invoice = await this.getInvoice(id, companyId);
    if (!invoice) return false;
    
    // Delete associated items and payments first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(payments).where(eq(payments.invoiceId, id));
    
    const result = await db.delete(invoices).where(
      and(eq(invoices.id, id), eq(invoices.companyId, companyId))
    );
    return (result.rowCount || 0) > 0;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async getPayments(companyId: number, invoiceId?: number): Promise<Payment[]> {
    if (invoiceId) {
      return await db
        .select()
        .from(payments)
        .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(and(eq(payments.invoiceId, invoiceId), eq(invoices.companyId, companyId)))
        .then(rows => rows.map(row => row.payments));
    }
    
    return await db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.companyId, companyId))
      .then(rows => rows.map(row => row.payments));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();

    // Update invoice status if fully paid - we need companyId context
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, payment.invoiceId));
    
    if (invoice) {
      const invoicePayments = await this.getPayments(invoice.companyId, payment.invoiceId);
      const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      if (totalPaid >= parseFloat(invoice.total)) {
        await this.updateInvoice(payment.invoiceId, { status: "paid" }, invoice.companyId);
      }
    }

    return payment;
  }

  async getSettings(companyId: number): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.companyId, companyId))
      .limit(1);
    
    // Create default settings if none exist
    if (!setting) {
      return await this.updateSettings({
        companyName: 'Your Company Name',
        email: 'contact@yourcompany.com',
        phone: '+91 98765 43210',
        address: '123 Business Street, City, State, India',
        currency: 'INR',
        defaultTaxRate: '18.00'
      }, companyId);
    }
    
    return setting;
  }

  async updateSettings(settingsUpdate: Partial<InsertSettings>, companyId: number): Promise<Settings> {
    const existingSettings = await this.getSettings(companyId);
    
    if (!existingSettings) {
      const [newSettings] = await db
        .insert(settings)
        .values({
          companyId,
          companyName: "Your Business Name",
          email: "business@email.com",
          currency: "INR",
          defaultTaxRate: "18.00",
          ...settingsUpdate
        })
        .returning();
      return newSettings;
    } else {
      const [updatedSettings] = await db
        .update(settings)
        .set(settingsUpdate)
        .where(and(eq(settings.id, existingSettings.id), eq(settings.companyId, companyId)))
        .returning();
      return updatedSettings;
    }
  }

  async getDashboardStats(companyId: number): Promise<{
    totalIncome: number;
    dueAmount: number;
    dueInvoicesCount: number;
    recentTransactions: (Payment & { client: Client; invoiceNumber: string })[];
  }> {
    const allPayments = await db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.companyId, companyId))
      .then(rows => rows.map(row => row.payments));
    
    const totalIncome = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get due invoices (sent but not fully paid)
    const sentInvoices = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.status, "sent"), eq(invoices.companyId, companyId)));
    
    let dueAmount = 0;
    let dueInvoicesCount = 0;
    
    for (const invoice of sentInvoices) {
      // Get payments for this invoice
      const invoicePayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, invoice.id));
      
      const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const remainingAmount = parseFloat(invoice.total) - totalPaid;
      
      if (remainingAmount > 0) {
        dueAmount += remainingAmount;
        dueInvoicesCount++;
      }
    }

    const recentTransactions = await db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.companyId, companyId))
      .orderBy(desc(payments.paymentDate))
      .limit(10);

    const formattedTransactions = recentTransactions.map(row => ({
      ...row.payments,
      client: row.clients!,
      invoiceNumber: row.invoices?.number || ""
    }));

    return { 
      totalIncome, 
      dueAmount, 
      dueInvoicesCount,
      recentTransactions: formattedTransactions 
    };
  }

  async getNextInvoiceNumber(companyId: number): Promise<string> {
    // Get all invoice numbers that follow the pattern INV-DIGITS for this company
    const allInvoices = await db
      .select({ number: invoices.number })
      .from(invoices)
      .where(eq(invoices.companyId, companyId));

    // Find the highest numeric invoice number (supports both INV-001 and INV-1 formats)
    let maxNumber = 0;
    for (const invoice of allInvoices) {
      const match = invoice.number.match(/^INV-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return `INV-${String(nextNumber).padStart(3, '0')}`;
  }
}

export const storage = new DatabaseStorage();
