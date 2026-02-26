"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../database/entities/tenant.entity");
const user_entity_1 = require("../database/entities/user.entity");
const tenant_context_interface_1 = require("../common/interfaces/tenant-context.interface");
const assistant_entity_1 = require("../database/entities/assistant.entity");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433'),
    username: process.env.DATABASE_USERNAME || 'aisle',
    password: process.env.DATABASE_PASSWORD || 'aisle_secret',
    database: process.env.DATABASE_NAME || 'aisle_db',
    entities: [tenant_entity_1.Tenant, user_entity_1.User, assistant_entity_1.Assistant],
    synchronize: false,
});
async function seed() {
    await dataSource.initialize();
    console.log('Data Source initialized');
    const tenantRepo = dataSource.getRepository(tenant_entity_1.Tenant);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const assistantRepo = dataSource.getRepository(assistant_entity_1.Assistant);
    const tenantName = 'Acme Corp';
    const tenantSlug = 'acme';
    let tenant = await tenantRepo.findOne({ where: { slug: tenantSlug } });
    if (!tenant) {
        const settings = {
            maxAssistants: 5,
            monthlyTokenLimit: 100000,
        };
        tenant = tenantRepo.create({
            name: tenantName,
            slug: tenantSlug,
            settings: settings,
            isActive: true,
        });
        await tenantRepo.save(tenant);
        console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);
    }
    else {
        console.log(`Tenant ${tenantName} already exists`);
    }
    const adminEmail = 'admin@acme.com';
    const adminPassword = 'password123';
    let user = await userRepo.findOne({ where: { email: adminEmail, tenantId: tenant.id } });
    if (!user) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        user = userRepo.create({
            tenantId: tenant.id,
            email: adminEmail,
            name: 'Admin User',
            passwordHash,
            role: tenant_context_interface_1.UserRole.ADMIN,
            isActive: true,
        });
        await userRepo.save(user);
        console.log(`Created User: ${user.email} (Password: ${adminPassword})`);
    }
    else {
        console.log(`User ${adminEmail} already exists`);
    }
    const assistantName = 'Research Assistant';
    let assistant = await assistantRepo.findOne({ where: { name: assistantName, tenantId: tenant.id } });
    if (!assistant) {
        assistant = assistantRepo.create({
            tenantId: tenant.id,
            name: assistantName,
            description: 'A helpful assistant for researching documents.',
            systemPrompt: 'You are a helpful research assistant. Use the provided context to answer questions.',
            provider: assistant_entity_1.LLMProvider.OPENAI,
            model: 'gpt-4o-mini',
            temperature: 0.7,
            ragEnabled: true,
            isActive: true,
        });
        await assistantRepo.save(assistant);
        console.log(`Created Assistant: ${assistant.name}`);
    }
    else {
        console.log(`Assistant ${assistantName} already exists`);
    }
    const systemTenantSlug = 'system';
    let systemTenant = await tenantRepo.findOne({ where: { slug: systemTenantSlug } });
    if (!systemTenant) {
        systemTenant = tenantRepo.create({
            name: 'System Administration',
            slug: systemTenantSlug,
            settings: {},
            isActive: true,
        });
        await tenantRepo.save(systemTenant);
        console.log(`Created System Tenant: ${systemTenant.name} (${systemTenant.id})`);
    }
    const superAdminEmail = 'superadmin@system.com';
    let superAdminUser = await userRepo.findOne({ where: { email: superAdminEmail } });
    if (!superAdminUser) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('superadmin123', salt);
        superAdminUser = userRepo.create({
            tenantId: systemTenant.id,
            email: superAdminEmail,
            name: 'Super Admin',
            passwordHash,
            role: tenant_context_interface_1.UserRole.SUPER_ADMIN,
            isActive: true,
        });
        await userRepo.save(superAdminUser);
        console.log(`Created Super Admin: ${superAdminUser.email} (Password: superadmin123)`);
    }
    else {
        console.log(`Super Admin ${superAdminEmail} already exists`);
    }
    await dataSource.destroy();
}
seed().catch((error) => {
    console.error('Error seeding data:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map