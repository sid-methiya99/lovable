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
## Add better UX if message somehow fails
## Also in code view make sure to display all files of next
## Make sure to not cut credits if somehow AI fails to respond
## Also improve prompt a little bit
## Also fix deducting of credits despite being an error
## Also add error boundarys for failign messages
## Also fix agent not able to get last messages
