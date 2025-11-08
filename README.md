### NOTE 
## Prisma changed its config.So you need to specifically load env variables inside prisma.config.ts 
- Example
```
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

```

## Also check each ready made prompt on homepage
