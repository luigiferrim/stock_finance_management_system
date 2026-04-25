type EnvVar = {
  name: string
  required: boolean
  sensitive: boolean
  description: string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: "DATABASE_URL",
    required: true,
    sensitive: true,
    description: "URL de conexão com o banco de dados PostgreSQL (Neon)",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: true,
    sensitive: true,
    description: "Chave secreta para criptografia de sessões NextAuth",
  },
  {
    name: "NEXTAUTH_URL",
    required: false,
    sensitive: false,
    description: "URL base da aplicação (automático na Vercel)",
  },
  {
    name: "MASTER_ACCESS_CODE",
    required: true,
    sensitive: true,
    description: "Código de acesso mestre para entrar no dashboard",
  },
]

export function checkEnvironmentVariables(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    if (envVar.required && !value) {
      errors.push(`Variável obrigatória não configurada: ${envVar.name}`)
    }

    if (value && isPlaceholderValue(value)) {
      errors.push(`Variável ${envVar.name} contém valor de exemplo`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function isPlaceholderValue(value: string): boolean {
  const placeholders = [
    "your-secret-key-here",
    "seu_codigo_secreto_aqui",
    "GERE_UMA_CHAVE_SEGURA",
    "CRIE_SEU_CODIGO",
    "change-this",
    "example",
    "placeholder",
    "xxx",
    "your_",
    "your-",
  ]

  const lowerValue = value.toLowerCase()
  return placeholders.some((p) => lowerValue.includes(p.toLowerCase()))
}

export function validateEnvOrThrow(varName: string): string {
  const value = process.env[varName]

  if (!value) {
    throw new Error(`Variável de ambiente ${varName} não configurada`)
  }

  if (isPlaceholderValue(value)) {
    throw new Error(`Variável de ambiente ${varName} contém valor de exemplo`)
  }

  return value
}
