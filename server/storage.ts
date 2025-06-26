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

export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private payments: Map<number, Payment>;
  private settings: Settings | undefined;
  private currentClientId: number;
  private currentInvoiceId: number;
  private currentInvoiceItemId: number;
  private currentPaymentId: number;
  private currentInvoiceNumber: number;

  constructor() {
    this.clients = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.payments = new Map();
    this.currentClientId = 1;
    this.currentInvoiceId = 1;
    this.currentInvoiceItemId = 1;
    this.currentPaymentId = 1;
    this.currentInvoiceNumber = 1;

    // Initialize with default settings
    this.settings = {
      id: 1,
      companyName: "Your Business Name",
      email: "business@email.com",
      phone: null,
      address: null,
      currency: "USD",
      defaultTaxRate: "10",
      logoUrl: null,
    };
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      id,
      name: insertClient.name,
      email: insertClient.email,
      phone: insertClient.phone || null,
      address: insertClient.address || null
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...clientUpdate };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getInvoices(): Promise<(Invoice & { client: Client })[]> {
    const invoicesWithClients = [];
    for (const invoice of Array.from(this.invoices.values())) {
      const client = this.clients.get(invoice.clientId);
      if (client) {
        invoicesWithClients.push({ ...invoice, client });
      }
    }
    return invoicesWithClients;
  }

  async getInvoice(id: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const client = this.clients.get(invoice.clientId);
    if (!client) return undefined;

    const items = await this.getInvoiceItems(id);
    return { ...invoice, client, items };
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = { 
      id,
      number: insertInvoice.number,
      clientId: insertInvoice.clientId,
      status: insertInvoice.status || "draft",
      subtotal: insertInvoice.subtotal,
      taxRate: insertInvoice.taxRate || "0",
      taxAmount: insertInvoice.taxAmount || "0",
      total: insertInvoice.total,
      dueDate: insertInvoice.dueDate,
      createdAt: new Date()
    };
    this.invoices.set(id, invoice);

    // Create invoice items
    for (const item of items) {
      const itemId = this.currentInvoiceItemId++;
      const invoiceItem: InvoiceItem = { ...item, id: itemId, invoiceId: id };
      this.invoiceItems.set(itemId, invoiceItem);
    }

    return invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...invoiceUpdate };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    // Delete associated items
    for (const [itemId, item] of Array.from(this.invoiceItems.entries())) {
      if (item.invoiceId === id) {
        this.invoiceItems.delete(itemId);
      }
    }
    
    // Delete associated payments
    for (const [paymentId, payment] of Array.from(this.payments.entries())) {
      if (payment.invoiceId === id) {
        this.payments.delete(paymentId);
      }
    }

    return this.invoices.delete(id);
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async getPayments(invoiceId?: number): Promise<Payment[]> {
    const payments = Array.from(this.payments.values());
    return invoiceId ? payments.filter(p => p.invoiceId === invoiceId) : payments;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      paymentDate: new Date()
    };
    this.payments.set(id, payment);

    // Update invoice status if fully paid
    const invoice = this.invoices.get(payment.invoiceId);
    if (invoice) {
      const invoicePayments = await this.getPayments(payment.invoiceId);
      const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const invoiceTotal = parseFloat(invoice.total);
      
      if (totalPaid >= invoiceTotal) {
        await this.updateInvoice(payment.invoiceId, { status: "paid" });
      }
    }

    return payment;
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        companyName: "Your Business Name",
        email: "business@email.com",
        phone: null,
        address: null,
        currency: "USD",
        defaultTaxRate: "10",
        logoUrl: null,
        ...settingsUpdate
      };
    } else {
      this.settings = { ...this.settings, ...settingsUpdate };
    }
    return this.settings;
  }

  async getDashboardStats(): Promise<{
    totalIncome: number;
    dueAmount: number;
    recentTransactions: (Payment & { client: Client; invoiceNumber: string })[];
  }> {
    const payments = Array.from(this.payments.values());
    const totalIncome = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const dueInvoices = Array.from(this.invoices.values()).filter(i => i.status === "sent" || i.status === "overdue");
    const dueAmount = dueInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0);

    const recentTransactions = payments
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 10)
      .map(payment => {
        const invoice = this.invoices.get(payment.invoiceId);
        const client = invoice ? this.clients.get(invoice.clientId) : undefined;
        return {
          ...payment,
          client: client!,
          invoiceNumber: invoice?.number || ""
        };
      })
      .filter(t => t.client);

    return { totalIncome, dueAmount, recentTransactions };
  }

  getNextInvoiceNumber(): string {
    return `INV-${String(this.currentInvoiceNumber++).padStart(3, '0')}`;
  }
}

export const storage = new MemStorage();
