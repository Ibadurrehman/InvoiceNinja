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
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<(Invoice & { client: Client })[]>;
  getInvoice(id: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Invoice Items
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  // Payments
  getPayments(invoiceId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalIncome: number;
    dueAmount: number;
    recentTransactions: (Payment & { client: Client; invoiceNumber: string })[];
  }>;
}

export class DatabaseStorage implements IStorage {
  private currentInvoiceNumber: number = 1;

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount > 0;
  }

  async getInvoices(): Promise<(Invoice & { client: Client })[]> {
    const result = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id));
    
    return result.map(row => ({
      ...row.invoices,
      client: row.clients!
    }));
  }

  async getInvoice(id: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined> {
    const [invoiceWithClient] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, id));

    if (!invoiceWithClient) return undefined;

    const items = await this.getInvoiceItems(id);
    
    return {
      ...invoiceWithClient.invoices,
      client: invoiceWithClient.clients!,
      items
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();

    // Create invoice items
    for (const item of items) {
      await db
        .insert(invoiceItems)
        .values({
          ...item,
          invoiceId: invoice.id
        });
    }

    return invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceUpdate)
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    // Delete associated items and payments first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(payments).where(eq(payments.invoiceId, id));
    
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount > 0;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async getPayments(invoiceId?: number): Promise<Payment[]> {
    if (invoiceId) {
      return await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, invoiceId));
    }
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();

    // Update invoice status if fully paid
    const invoicePayments = await this.getPayments(payment.invoiceId);
    const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, payment.invoiceId));
    
    if (invoice && totalPaid >= parseFloat(invoice.total)) {
      await this.updateInvoice(payment.invoiceId, { status: "paid" });
    }

    return payment;
  }

  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting || undefined;
  }

  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    if (!existingSettings) {
      const [newSettings] = await db
        .insert(settings)
        .values({
          companyName: "Your Business Name",
          email: "business@email.com",
          currency: "USD",
          defaultTaxRate: "10",
          ...settingsUpdate
        })
        .returning();
      return newSettings;
    } else {
      const [updatedSettings] = await db
        .update(settings)
        .set(settingsUpdate)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    }
  }

  async getDashboardStats(): Promise<{
    totalIncome: number;
    dueAmount: number;
    recentTransactions: (Payment & { client: Client; invoiceNumber: string })[];
  }> {
    const allPayments = await db.select().from(payments);
    const totalIncome = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const dueInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, "sent"));
    const dueAmount = dueInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0);

    const recentTransactions = await db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(payments.paymentDate))
      .limit(10);

    const formattedTransactions = recentTransactions.map(row => ({
      ...row.payments,
      client: row.clients!,
      invoiceNumber: row.invoices?.number || ""
    }));

    return { totalIncome, dueAmount, recentTransactions: formattedTransactions };
  }

  getNextInvoiceNumber(): string {
    return `INV-${String(this.currentInvoiceNumber++).padStart(3, '0')}`;
  }
}

export const storage = new DatabaseStorage();
