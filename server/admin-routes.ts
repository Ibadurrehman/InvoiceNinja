import type { Express } from "express";
import { authService } from "./auth";
import { requireAdmin } from "./session";
import { db } from "./db";
import { 
  companies, 
  users, 
  adminUsers,
  settings,
  clients,
  invoices,
  invoiceItems,
  payments,
  loginSchema, 
  adminLoginSchema, 
  createCompanySchema,
  type Company,
  type User
} from "@shared/schema";
import { eq, desc, inArray, count } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      
      const admin = await authService.authenticateAdmin(email, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.admin = admin;
      res.json({ admin });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.admin = undefined;
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/admin/me", requireAdmin, (req, res) => {
    res.json({ admin: req.session.admin });
  });

  // Company management routes
  app.get("/api/admin/companies", requireAdmin, async (req, res) => {
    try {
      const companiesList = await db
        .select({
          id: companies.id,
          name: companies.name,
          email: companies.email,
          phone: companies.phone,
          address: companies.address,
          isActive: companies.isActive,
          createdAt: companies.createdAt,
          userCount: users.id,
        })
        .from(companies)
        .leftJoin(users, eq(companies.id, users.companyId))
        .orderBy(desc(companies.createdAt));

      // Group by company and count users
      const companiesMap = new Map();
      companiesList.forEach(row => {
        if (!companiesMap.has(row.id)) {
          companiesMap.set(row.id, {
            ...row,
            userCount: 0,
          });
        }
        if (row.userCount) {
          companiesMap.get(row.id).userCount++;
        }
      });

      res.json(Array.from(companiesMap.values()));
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/admin/companies", requireAdmin, async (req, res) => {
    try {
      const { name, email, phone, address, adminFirstName, adminLastName, adminPassword } = createCompanySchema.parse(req.body);

      // Create company
      const [company] = await db
        .insert(companies)
        .values({ name, email, phone, address })
        .returning();

      // Create admin user for the company
      const user = await authService.createUser(
        company.id,
        email, // Use company email as admin email
        adminPassword,
        adminFirstName,
        adminLastName,
        'admin'
      );

      // Create default settings for the company
      await db
        .insert(settings)
        .values({
          companyId: company.id,
          companyName: name,
          email,
          phone,
          address,
          currency: 'INR',
          defaultTaxRate: '18.00',
        });

      res.status(201).json({ 
        company, 
        adminUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/admin/companies/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, email, phone, address, isActive } = req.body;

      const [company] = await db
        .update(companies)
        .set({ name, email, phone, address, isActive })
        .where(eq(companies.id, id))
        .returning();

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/admin/companies/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Get all invoices for this company to cascade delete related data
      const companyInvoices = await db
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.companyId, id));

      const invoiceIds = companyInvoices.map(inv => inv.id);

      // Delete invoice items for all company invoices
      if (invoiceIds.length > 0) {
        await db
          .delete(invoiceItems)
          .where(inArray(invoiceItems.invoiceId, invoiceIds));
        
        // Delete payments for all company invoices
        await db
          .delete(payments)
          .where(inArray(payments.invoiceId, invoiceIds));
      }

      // Delete all invoices for the company
      await db
        .delete(invoices)
        .where(eq(invoices.companyId, id));

      // Delete all clients for the company
      await db
        .delete(clients)
        .where(eq(clients.companyId, id));

      // Delete all users associated with the company
      await db
        .delete(users)
        .where(eq(users.companyId, id));

      // Delete company settings
      await db
        .delete(settings)
        .where(eq(settings.companyId, id));

      // Finally delete the company
      const [company] = await db
        .delete(companies)
        .where(eq(companies.id, id))
        .returning();

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json({ message: "Company and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Company users management
  app.get("/api/admin/companies/:id/users", requireAdmin, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);

      const usersList = await db
        .select()
        .from(users)
        .where(eq(users.companyId, companyId))
        .orderBy(desc(users.createdAt));

      // Remove password from response
      const safeUsers = usersList.map(({ password, ...user }) => user);

      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [totalCompanies] = await db
        .select({ count: count() })
        .from(companies);

      const [activeCompanies] = await db
        .select({ count: count() })
        .from(companies)
        .where(eq(companies.isActive, true));

      const [totalUsers] = await db
        .select({ count: count() })
        .from(users);

      const [activeUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.isActive, true));

      res.json({
        totalCompanies: totalCompanies.count || 0,
        activeCompanies: activeCompanies.count || 0,
        totalUsers: totalUsers.count || 0,
        activeUsers: activeUsers.count || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
}