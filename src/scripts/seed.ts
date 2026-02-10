import { DataSource } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../common/interfaces/tenant-context.interface';
import { Assistant, LLMProvider } from '../database/entities/assistant.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { TenantSettings } from '../database/entities/tenant.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433'),
  username: process.env.DATABASE_USERNAME || 'aisle',
  password: process.env.DATABASE_PASSWORD || 'aisle_secret',
  database: process.env.DATABASE_NAME || 'aisle_db',
  entities: [Tenant, User, Assistant],
  synchronize: false, 
});

async function seed() {
  await dataSource.initialize();
  console.log('Data Source initialized');

  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(User);
  const assistantRepo = dataSource.getRepository(Assistant);

  // 1. Create Tenant
  const tenantName = 'Acme Corp';
  const tenantSlug = 'acme';
  
  let tenant = await tenantRepo.findOne({ where: { slug: tenantSlug } });
  if (!tenant) {
    const settings: TenantSettings = {
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
  } else {
    console.log(`Tenant ${tenantName} already exists`);
  }

  // 2. Create Admin User
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
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepo.save(user);
    console.log(`Created User: ${user.email} (Password: ${adminPassword})`);
  } else {
    console.log(`User ${adminEmail} already exists`);
  }

  // 3. Create Sample Assistant
  const assistantName = 'Research Assistant';
  let assistant = await assistantRepo.findOne({ where: { name: assistantName, tenantId: tenant.id } });
  if (!assistant) {
    assistant = assistantRepo.create({
      tenantId: tenant.id,
      name: assistantName,
      description: 'A helpful assistant for researching documents.',
      systemPrompt: 'You are a helpful research assistant. Use the provided context to answer questions.',
      provider: LLMProvider.OPENAI,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      ragEnabled: true,
      isActive: true,
    });
    await assistantRepo.save(assistant);
    console.log(`Created Assistant: ${assistant.name}`);
  } else {
    console.log(`Assistant ${assistantName} already exists`);
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
