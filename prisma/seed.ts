import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { PrismaClient, Role } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// __dirname isn't available in ES modules; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// CSV folder is at workspace root: two levels up from `prisma/` folder
const CSV_DIR = path.resolve(__dirname, '..', 'agencimark_multilimp_sistema.csv')

function readCsvSync(fileName: string) {
  const filePath = path.join(CSV_DIR, fileName)
  const content = fs.readFileSync(filePath, { encoding: 'utf8' })
  return parse(content, { columns: true, skip_empty_lines: true })
}

async function seedEmpresas() {
  const rows = readCsvSync('agencimark_multilimp_sistema_table_empresas.csv')
  for (const r of rows) {
    const ruc = (r.ruc || '').toString().trim()
    // Skip empresas without RUC (ruc is unique and required in schema)
    if (!ruc) continue
    const existing = await prisma.empresa.findUnique({ where: { ruc } })
    if (existing) continue

    const data: any = {}
    if (r.razon_social || r.razonSocial) data.razonSocial = (r.razon_social || r.razonSocial).toString()
    data.ruc = ruc
    if (r.direccion) data.direccion = r.direccion
    if (r.departamento) data.departamento = r.departamento
    if (r.provincia) data.provincia = r.provincia
    if (r.distrito) data.distrito = r.distrito
    if (r.logo) data.logo = r.logo
    if (r.correo || r.email) data.email = (r.correo || r.email)
    if (r.web) data.web = r.web
    if (r.direcciones) data.direcciones = r.direcciones
    if (r.telefono) data.telefono = r.telefono

    await prisma.empresa.create({ data })
  }
}

async function seedClientes() {
  const rows = readCsvSync('agencimark_multilimp_sistema_table_clientes.csv')
  for (const r of rows) {
    const ruc = (r.ruc || '').toString().trim()
    const codigoUnidadEjecutora = (r.cod_unidad || '').toString().trim()
    // Cliente requires ruc and razonSocial in schema — skip if no ruc
    if (!ruc) continue
    const existing = await prisma.cliente.findFirst({ where: { ruc, codigoUnidadEjecutora } })
    if (existing) continue

    const data: any = {}
    data.ruc = ruc
    data.razonSocial = r.razon_social || r.razonSocial || ruc
    if (r.direccion) data.direccion = r.direccion
    if (r.departamento) data.departamento = r.departamento
    if (r.provincia) data.provincia = r.provincia
    if (r.distrito) data.distrito = r.distrito
    if (r.estado) data.estado = (r.estado === '1' || r.estado === 'true' || r.estado === 't')
    if (r.cod_unidad) data.codigoUnidadEjecutora = r.cod_unidad

    await prisma.cliente.create({ data })
  }
}

async function seedProveedores() {
  const rows = readCsvSync('agencimark_multilimp_sistema_table_proveedores.csv')
  for (const r of rows) {
    const ruc = (r.ruc || '').toString().trim()
    // Proveedor requires ruc — skip if missing
    if (!ruc) continue
    const existing = await prisma.proveedor.findFirst({ where: { ruc } })
    if (existing) continue

    const data: any = {}
    data.ruc = ruc
    data.razonSocial = r.razon_social || r.razonSocial || ruc
    if (r.direccion) data.direccion = r.direccion
    if (r.departamento) data.departamento = r.departamento
    if (r.provincia) data.provincia = r.provincia
    if (r.distrito) data.distrito = r.distrito
    if (r.estado) data.estado = (r.estado === '1' || r.estado === 'true' || r.estado === 't')

    await prisma.proveedor.create({ data })
  }
}

async function seedTransportes() {
  const rows = readCsvSync('agencimark_multilimp_sistema_table_transportes.csv')
  for (const r of rows) {
    const ruc = (r.ruc || '').toString().trim()
    const departamento = (r.departamento || '').toString().trim()
    // Transporte requires ruc — skip if missing
    if (!ruc) continue
    const existing = await prisma.transporte.findFirst({ where: { ruc, departamento } })
    if (existing) continue

    const data: any = {}
    data.ruc = ruc
    data.razonSocial = r.razon_social || r.razonSocial || ruc
    if (r.direccion) data.direccion = r.direccion
    if (r.cobertura) data.cobertura = r.cobertura
    if (r.departamento) data.departamento = r.departamento
    if (r.provincia) data.provincia = r.provincia
    if (r.distrito) data.distrito = r.distrito
    if (r.estado) data.estado = (r.estado === '1' || r.estado === 'true' || r.estado === 't')

    await prisma.transporte.create({ data })
  }
}

async function main() {
  console.log('🌱 Iniciando el seed de la base de datos (CSV -> Prisma)...');

  // Mantener el seed previo del usuario admin si no existe
  const existingUser = await prisma.usuario.findUnique({ where: { email: 'jose@cimark.pe' } })
  if (!existingUser) {
    console.log('👤 Creando usuario José...')
    const userPassword = await bcrypt.hash('jose123', 10)
    const allPermissions = [
      'dashboard', 'profile', 'users', 'providers', 'sales', 'treasury', 'companies', 'transports', 'provider_orders', 'billing', 'clients', 'quotes', 'tracking', 'collections', 'jefecobranzas'
    ]
    await prisma.usuario.create({ data: { nombre: 'José Cimark', email: 'jose@cimark.pe', password: userPassword, role: Role.ADMIN, estado: true, permisos: allPermissions } })
  } else {
    console.log('✅ Usuario José ya existe, omitiendo creación.')
  }

  console.log('📥 Seed: Empresas...')
  await seedEmpresas()
  console.log('📥 Seed: Clientes...')
  await seedClientes()
  console.log('📥 Seed: Proveedores...')
  await seedProveedores()
  console.log('📥 Seed: Transportes...')
  await seedTransportes()

  console.log('✅ Seed CSV completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
