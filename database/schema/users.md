# Collection: users

> Stores all system actors — ticket creators, assignees, and comment authors.

---

## Collection Name

`users`

## Model File

`server/src/models/user.model.js`

---

## Fields

| Field | BSON Type | Required | Default | Constraints |
|-------|-----------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | Primary key |
| `name` | String | yes | — | trim, minlength 1, maxlength 100 |
| `email` | String | yes | — | trim, lowercase, valid email format, unique |
| `password` | String | stretch | — | minlength 8 (pre-hash); bcrypt hash stored; `select: false` |
| `role` | String | stretch | `customer` | enum: `admin`, `manager`, `agent`, `customer` |
| `createdAt` | Date | auto | `Date.now` | Set by `timestamps: true` |
| `updatedAt` | Date | auto | `Date.now` | Set by `timestamps: true` |

---

## Role Enum

| Value | Hierarchy | Description |
|-------|-----------|-------------|
| `customer` | 1 (lowest) | Creates and views own tickets |
| `agent` | 2 | Works assigned tickets |
| `manager` | 3 | Views team tickets; can reassign |
| `admin` | 4 (highest) | Full access; user management |

**Core scope note:** `role` and `password` are used when stretch auth is implemented. For core-only demo without auth, users exist as seed data for `createdBy` and `assignedTo` references.

---

## Indexes

| Name | Definition | Options | Purpose |
|------|------------|---------|---------|
| `_id_` | `{ _id: 1 }` | default | Primary key |
| `email_unique` | `{ email: 1 }` | `unique: true` | Prevent duplicate accounts; fast login lookup |
| `role_index` | `{ role: 1 }` | — | Filter users by role (stretch admin UI) |

---

## Validation Rules

### Mongoose Schema

| Field | Validators |
|-------|-----------|
| name | `required`, `trim`, `minlength: 1`, `maxlength: 100` |
| email | `required`, `trim`, `lowercase: true`, `match: email regex`, `unique: true` |
| password | `minlength: 8` (plain text, before hash); excluded from queries via `select: false` |
| role | `enum: ['admin', 'manager', 'agent', 'customer']`, `default: 'customer'` |

### Service Layer

| Rule | Error |
|------|-------|
| Email must not already exist on create | 400 `DUPLICATE_EMAIL` |
| Password hashed with bcrypt (10 rounds) before save | — |
| Password never returned in API responses | — |
| Only admin can create users (stretch) | 403 |

### API Response Shape

Password is **never** included in serialized user objects. Use `.select('-password')` or schema `toJSON` transform.

```json
{
  "_id": "...",
  "name": "Jane Agent",
  "email": "agent@demo.com",
  "role": "agent",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Relationships

| Direction | Relationship | Field |
|-----------|-------------|-------|
| User → Ticket | One user creates many tickets | `tickets.createdBy` |
| User → Ticket | One user assigned to many tickets | `tickets.assignedTo` |
| User → Comment | One user authors many comments | `comments.authorId` |

---

## Query Patterns

| Use Case | Query | Index |
|----------|-------|-------|
| Login (stretch) | `{ email: email }` + select password | `email_unique` |
| List for assignee dropdown | `{}` project name, email, role | — |
| Find by ID | `{ _id: id }` | `_id_` |

---

## Design Notes

- **Email as natural key for seed upserts** — seed script uses email to identify existing users
- **No username field** — email is the login identifier (stretch)
- **No soft delete** — user deletion out of core scope
- **No profile fields** — name and email are sufficient for assessment
