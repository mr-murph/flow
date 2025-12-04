import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        // Example RLS logic: if a tenantId is expected but not provided, throw an error.
        // This is a simplified example and would need a proper context/tenantId management system (e.g., AsyncLocalStorage).
        if (args.where && 'tenantId' in args.where && !args.where.tenantId) {
          throw new Error(`Operation on ${model} requires a tenantId but none was provided.`);
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        if (args.where && 'tenantId' in args.where && !args.where.tenantId) {
          throw new Error(`Operation on ${model} requires a tenantId but none was provided.`);
        }
        return query(args);
      },
      async findUnique({ model, operation, args, query }) {
        if (args.where && 'tenantId' in args.where && !args.where.tenantId) {
          throw new Error(`Operation on ${model} requires a tenantId but none was provided.`);
        }
        return query(args);
      },
      async create({ model, operation, args, query }) {
        if (args.data && 'tenantId' in args.data && !args.data.tenantId) {
          throw new Error(`Creation on ${model} requires a tenantId but none was provided.`);
        }
        return query(args);
      },
      async update({ model, operation, args, query }) {
        if (args.where && 'tenantId' in args.where && !args.where.tenantId) {
          throw new Error(`Update on ${model} requires a tenantId but none was provided.`);
        }
        if (args.data && 'tenantId' in args.data && !args.data.tenantId) {
          throw new Error(`Update on ${model} requires a tenantId in data but none was provided.`);
        }
        return query(args);
      },
      async delete({ model, operation, args, query }) {
        if (args.where && 'tenantId' in args.where && !args.where.tenantId) {
          throw new Error(`Deletion on ${model} requires a tenantId but none was provided.`);
        }
        return query(args);
      },
    },
  },
});

export { prisma };
