// Test client validation fix
const { z } = require("zod");

// Simulate the validation schema
const insertClientSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyId: z.number().optional(), // Made optional since it's added by the server
});

// Test data from frontend (without companyId)
const testData = {
  name: "Test Client",
  email: "test@example.com",
  phone: "123-456-7890",
  address: "123 Test St"
};

try {
  const result = insertClientSchema.parse(testData);
  console.log("✓ Validation passed:", result);
} catch (error) {
  console.log("✗ Validation failed:", error.errors);
}

// Test with companyId added by server
const dataWithCompanyId = { ...testData, companyId: 4 };
try {
  const result = insertClientSchema.parse(dataWithCompanyId);
  console.log("✓ Server validation passed:", result);
} catch (error) {
  console.log("✗ Server validation failed:", error.errors);
}