import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { authService } from "./auth";
import { sessionConfig, requireAuth, requireCompanyAccess } from "./session";
import { registerAdminRoutes } from "./admin-routes";
import { PDFGenerator } from "./pdf-generator";
import { 
  insertClientSchema,
  createClientSchema,
  insertInvoiceSchema,
  createInvoiceSchema as frontendInvoiceSchema,
  insertInvoiceItemSchema,
  insertPaymentSchema,
  insertSettingsSchema,
  loginSchema
} from "@shared/schema";
import { z } from "zod";

// Extend the Request interface to include companyId
interface AuthenticatedRequest extends Express.Request {
  companyId: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session(sessionConfig));

  // Register admin routes
  registerAdminRoutes(app);

  // User authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = user;
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.user = undefined;
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.session.user });
  });

  // Clients routes
  app.get("/api/clients", requireAuth, requireCompanyAccess, async (req, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const clients = await storage.getClients(companyId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const client = await storage.getClient(id, companyId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const clientData = createClientSchema.parse(req.body);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const clientWithCompany = { ...clientData, companyId };
      const client = await storage.createClient(clientWithCompany);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, companyId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const deleted = await storage.deleteClient(id, companyId);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Generate next invoice number (must come before /:id route)
  app.get("/api/invoices/next-number", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const nextNumber = await storage.getNextInvoiceNumber(companyId);
      res.json({ number: nextNumber });
    } catch (error) {
      console.error("Error generating invoice number:", error);
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const invoices = await storage.getInvoices(companyId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const invoice = await storage.getInvoice(id, companyId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  const createInvoiceRequestSchema = z.object({
    invoice: frontendInvoiceSchema,
    items: z.array(insertInvoiceItemSchema)
  });

  app.post("/api/invoices", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const { invoice: invoiceData, items } = createInvoiceRequestSchema.parse(req.body);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      
      // Add companyId to invoice data
      const invoiceWithCompany = { ...invoiceData, companyId };
      const invoice = await storage.createInvoice(invoiceWithCompany, items);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/invoices/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData, companyId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const deleted = await storage.deleteInvoice(id, companyId);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Payments routes
  app.get("/api/payments", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const invoiceId = req.query.invoiceId ? parseInt(req.query.invoiceId as string) : undefined;
      const payments = await storage.getPayments(companyId, invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Settings routes
  app.get("/api/settings", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const settings = await storage.getSettings(companyId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const settingsData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(settingsData, companyId);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // PDF download route
  app.get("/api/invoices/:id/pdf", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const invoice = await storage.getInvoice(id, companyId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const settings = await storage.getSettings(companyId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      const pdfGenerator = new PDFGenerator();
      const doc = pdfGenerator.generateInvoicePDF(invoice, settings);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.number}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, requireCompanyAccess, async (req: any, res) => {
    try {
      const companyId = req.session?.user?.companyId;
      if (!companyId) {
        return res.status(403).json({ message: "Company access required" });
      }
      const stats = await storage.getDashboardStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // PWA Routes - serve manifest and service worker
  app.get("/manifest.json", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile("manifest.json", { root: "client/public" });
  });

  app.get("/sw.js", (req, res) => {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile("sw.js", { root: "client/public" });
  });

  // PWA Icons
  app.get("/icon-192x192.svg", (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile("icon-192x192.svg", { root: "client/public" });
  });

  app.get("/icon-512x512.svg", (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile("icon-512x512.svg", { root: "client/public" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
