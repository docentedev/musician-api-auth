# musician-api

[![Node.js CI](https://github.com/docentedev/musician-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/docentedev/musician-api/actions/workflows/node.js.yml)

musician api

- [api url](https://musician-api-production.up.railway.app/)
- Deploy into [Raleway](https://railway.app/)

- SQL

```sql
CREATE TABLE public.account (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username varchar(255) NOT NULL,
  "password" varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

- Key Pair [sign: { algorithm: 'RS256' }]

```plain
openssl genrsa -out private.key 2048
openssl rsa -in private.key -out public.key -outform PEM -pubout
```
