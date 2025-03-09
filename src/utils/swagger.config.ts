export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "User API",
    version: "1.0.0",
    description: "API for user management",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development Server",
    },
    {
      url: "https://authbackend.ombaji124-d31.workers.dev",
      description: "Production Server",
    },
  ],
  tags: [{ name: "User", description: "Operations related to users" }],
  components: {
    schemas: {
      UserRegistration: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "securepassword123",
          },
        },
        required: ["name", "email", "password"],
      },
      UserLogin: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "securepassword123",
          },
        },
        required: ["email", "password"],
      },
      UserUpdate: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Updated" },
          email: {
            type: "string",
            format: "email",
            example: "johnupdated@example.com",
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "clh6xr3o200013k5j1234abcd" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          success: { type: "boolean", example: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          success: { type: "boolean", example: false },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/v1/register": {
      post: {
        tags: ["User"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserRegistration",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User registered!" },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid input data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/login": {
      post: {
        tags: ["User"],
        summary: "Authenticate a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserLogin",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful!" },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid input data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user": {
      get: {
        tags: ["User"],
        summary: "Get user by ID",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "User ID",
            example: "clh6xr3o200013k5j1234abcd",
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User found!" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing ID parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["User"],
        summary: "Update user information",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "User ID",
            example: "clh6xr3o200013k5j1234abcd",
          },
        ],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User updated!" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid input data or missing ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "Email already in use by another user",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["User"],
        summary: "Delete a user",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "User ID",
            example: "clh6xr3o200013k5j1234abcd",
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User deleted!" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing ID parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/user/{email}": {
      get: {
        tags: ["User"],
        summary: "Get user by email",
        parameters: [
          {
            name: "email",
            in: "path",
            required: true,
            schema: { type: "string", format: "email" },
            description: "User email",
            example: "john@example.com",
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User found!" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing email parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/me": {
      get: {
        tags: ["User"],
        summary: "Get current user info",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User data retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "User data retrieved!",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/logout": {
      post: {
        tags: ["User"],
        summary: "Logout a user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/refresh": {
      get: {
        tags: ["User"],
        summary: "Refresh access token",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Refresh token",
          },
        ],
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token refreshed successfully!",
                    },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing refresh token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
};
