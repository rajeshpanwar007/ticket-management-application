# API Contract

## Overview

<!-- TODO: Base URL, versioning, content type -->

## Authentication

<!-- TODO: Auth headers or cookies (if implemented) -->

## Common Response Format

### Success

<!-- TODO: Example success response shape -->

### Error

<!-- TODO: Example error response shape -->

## HTTP Status Codes

<!-- TODO: 200, 201, 400, 401, 403, 404, 409, 500 usage -->

## Endpoints

### Auth (Stretch)

#### POST /api/auth/login

<!-- TODO: Request body, response, errors -->

#### POST /api/auth/logout

<!-- TODO: Request body, response, errors -->

#### GET /api/auth/me

<!-- TODO: Request body, response, errors -->

### Tickets

#### GET /api/tickets

<!-- TODO: Query params (search, status), response, errors -->

#### POST /api/tickets

<!-- TODO: Request body, response, errors -->

#### GET /api/tickets/:id

<!-- TODO: Path params, response, errors -->

#### PATCH /api/tickets/:id

<!-- TODO: Request body (update, reassign, status), response, errors -->

### Comments

#### POST /api/tickets/:id/comments

<!-- TODO: Request body, response, errors -->

### Users (Stretch)

#### GET /api/users

<!-- TODO: Request body, response, errors -->

## Validation Rules

<!-- TODO: Field-level validation per endpoint -->

## Permission Matrix

<!-- TODO: Which roles can call which endpoints -->
