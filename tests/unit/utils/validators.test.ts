import { describe, it, expect } from 'vitest';
import {
  validators,
  authSchemas,
  userSchemas,
  paginationSchema,
  searchSchema,
  apiResponseSchemas,
  fileUploadSchema,
  contactFormSchema,
} from '@/lib/utils/validators';
import { z } from 'zod';

describe('Validators', () => {
  describe('email validator', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(() => validators.email.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
      ];

      invalidEmails.forEach((email) => {
        expect(() => validators.email.parse(email)).toThrow();
      });
    });
  });

  describe('password validator', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123!',
        'Test@1234',
        'Secure$Pass99',
        'MyP@ssw0rd',
      ];

      validPasswords.forEach((password) => {
        expect(() => validators.password.parse(password)).not.toThrow();
      });
    });

    it('should reject passwords without uppercase letters', () => {
      expect(() => validators.password.parse('password123!')).toThrow();
    });

    it('should reject passwords without lowercase letters', () => {
      expect(() => validators.password.parse('PASSWORD123!')).toThrow();
    });

    it('should reject passwords without numbers', () => {
      expect(() => validators.password.parse('Password!')).toThrow();
    });

    it('should reject passwords without special characters', () => {
      expect(() => validators.password.parse('Password123')).toThrow();
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(() => validators.password.parse('Pass1!')).toThrow();
    });
  });

  describe('phone validator', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '+447911123456',
        '+12025551234',
      ];

      validPhones.forEach((phone) => {
        expect(() => validators.phone.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc',
        '+',
        '123-456-7890',
      ];

      invalidPhones.forEach((phone) => {
        expect(() => validators.phone.parse(phone)).toThrow();
      });
    });
  });

  describe('url validator', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.com/path',
        'https://sub.domain.com/path?query=value',
        '', // Empty string is allowed
      ];

      validUrls.forEach((url) => {
        expect(() => validators.url.parse(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'example.com',
      ];

      invalidUrls.forEach((url) => {
        expect(() => validators.url.parse(url)).toThrow();
      });
    });
  });

  describe('uuid validator', () => {
    it('should accept valid UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
      ];

      validUuids.forEach((uuid) => {
        expect(() => validators.uuid.parse(uuid)).not.toThrow();
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        '123',
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
      ];

      invalidUuids.forEach((uuid) => {
        expect(() => validators.uuid.parse(uuid)).toThrow();
      });
    });
  });

  describe('name validator', () => {
    it('should accept valid names', () => {
      const validNames = ['John Doe', 'A', 'X'.repeat(100)];

      validNames.forEach((name) => {
        expect(() => validators.name.parse(name)).not.toThrow();
      });
    });

    it('should reject empty names', () => {
      expect(() => validators.name.parse('')).toThrow();
    });

    it('should reject names longer than 100 characters', () => {
      expect(() => validators.name.parse('X'.repeat(101))).toThrow();
    });
  });

  describe('username validator', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'john_doe',
        'user123',
        'test-user',
        'ABC',
      ];

      validUsernames.forEach((username) => {
        expect(() => validators.username.parse(username)).not.toThrow();
      });
    });

    it('should reject usernames shorter than 3 characters', () => {
      expect(() => validators.username.parse('ab')).toThrow();
    });

    it('should reject usernames longer than 30 characters', () => {
      expect(() => validators.username.parse('a'.repeat(31))).toThrow();
    });

    it('should reject usernames with invalid characters', () => {
      const invalidUsernames = [
        'user name',
        'user@123',
        'user#123',
      ];

      invalidUsernames.forEach((username) => {
        expect(() => validators.username.parse(username)).toThrow();
      });
    });
  });

  describe('slug validator', () => {
    it('should accept valid slugs', () => {
      const validSlugs = [
        'my-post',
        'post-123',
        'test',
      ];

      validSlugs.forEach((slug) => {
        expect(() => validators.slug.parse(slug)).not.toThrow();
      });
    });

    it('should reject slugs with uppercase letters', () => {
      expect(() => validators.slug.parse('My-Post')).toThrow();
    });

    it('should reject slugs with spaces', () => {
      expect(() => validators.slug.parse('my post')).toThrow();
    });

    it('should reject slugs with special characters', () => {
      expect(() => validators.slug.parse('my_post')).toThrow();
    });
  });
});

describe('Auth Schemas', () => {
  describe('login schema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password',
      };

      expect(() => authSchemas.login.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password',
      };

      expect(() => authSchemas.login.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      expect(() => authSchemas.login.parse(invalidData)).toThrow();
    });
  });

  describe('register schema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password123!',
      };

      expect(() => authSchemas.register.parse(validData)).not.toThrow();
    });

    it('should reject weak passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'weak',
      };

      expect(() => authSchemas.register.parse(invalidData)).toThrow();
    });
  });

  describe('resetPassword schema', () => {
    it('should accept matching passwords', () => {
      const validData = {
        token: 'valid-token',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      expect(() => authSchemas.resetPassword.parse(validData)).not.toThrow();
    });

    it('should reject non-matching passwords', () => {
      const invalidData = {
        token: 'valid-token',
        password: 'Password123!',
        confirmPassword: 'Different123!',
      };

      expect(() => authSchemas.resetPassword.parse(invalidData)).toThrow();
    });
  });

  describe('changePassword schema', () => {
    it('should accept valid password change data', () => {
      const validData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      expect(() => authSchemas.changePassword.parse(validData)).not.toThrow();
    });

    it('should reject non-matching new passwords', () => {
      const invalidData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'Different123!',
      };

      expect(() => authSchemas.changePassword.parse(invalidData)).toThrow();
    });
  });

  describe('updateProfile schema', () => {
    it('should accept valid profile data', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        phone: '+1234567890',
        image: 'https://example.com/image.jpg',
      };

      expect(() => authSchemas.updateProfile.parse(validData)).not.toThrow();
    });

    it('should accept profile data without optional fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
      };

      expect(() => authSchemas.updateProfile.parse(validData)).not.toThrow();
    });
  });
});

describe('User Schemas', () => {
  describe('create schema', () => {
    it('should accept valid user creation data', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password123!',
      };

      expect(() => userSchemas.create.parse(validData)).not.toThrow();
    });
  });

  describe('update schema', () => {
    it('should accept partial update data', () => {
      const validData = {
        name: 'John Doe',
      };

      expect(() => userSchemas.update.parse(validData)).not.toThrow();
    });

    it('should accept empty update data', () => {
      const validData = {};

      expect(() => userSchemas.update.parse(validData)).not.toThrow();
    });
  });

  describe('id schema', () => {
    it('should accept valid UUID', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => userSchemas.id.parse(validData)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        id: 'not-a-uuid',
      };

      expect(() => userSchemas.id.parse(invalidData)).toThrow();
    });
  });
});

describe('Pagination Schema', () => {
  it('should accept valid pagination data', () => {
    const validData = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    };

    expect(() => paginationSchema.parse(validData)).not.toThrow();
  });

  it('should apply defaults for missing fields', () => {
    const result = paginationSchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe('desc');
  });

  it('should coerce string numbers to numbers', () => {
    const result = paginationSchema.parse({
      page: '2',
      limit: '50',
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it('should reject invalid page numbers', () => {
    const invalidData = {
      page: 0,
    };

    expect(() => paginationSchema.parse(invalidData)).toThrow();
  });

  it('should reject limit larger than 100', () => {
    const invalidData = {
      limit: 101,
    };

    expect(() => paginationSchema.parse(invalidData)).toThrow();
  });
});

describe('Search Schema', () => {
  it('should accept valid search data', () => {
    const validData = {
      query: 'test search',
      filters: { category: 'posts' },
      page: 1,
      limit: 20,
    };

    expect(() => searchSchema.parse(validData)).not.toThrow();
  });

  it('should reject empty query', () => {
    const invalidData = {
      query: '',
    };

    expect(() => searchSchema.parse(invalidData)).toThrow();
  });
});

describe('API Response Schemas', () => {
  describe('success schema', () => {
    it('should validate successful response with data', () => {
      const dataSchema = z.object({ id: z.string() });
      const successSchema = apiResponseSchemas.success(dataSchema);

      const validData = {
        success: true as const,
        data: { id: 'test-id' },
        message: 'Success',
      };

      expect(() => successSchema.parse(validData)).not.toThrow();
    });
  });

  describe('error schema', () => {
    it('should validate error response', () => {
      const validData = {
        success: false as const,
        error: 'Error message',
        code: 'ERROR_CODE',
      };

      expect(() => apiResponseSchemas.error.parse(validData)).not.toThrow();
    });
  });

  describe('paginated schema', () => {
    it('should validate paginated response', () => {
      const itemSchema = z.object({ id: z.string() });
      const paginatedSchema = apiResponseSchemas.paginated(itemSchema);

      const validData = {
        success: true as const,
        data: [{ id: '1' }, { id: '2' }],
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      expect(() => paginatedSchema.parse(validData)).not.toThrow();
    });
  });
});

describe('File Upload Schema', () => {
  it('should accept valid file upload data', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    const validData = {
      file,
      type: 'image' as const,
      maxSize: 10000000,
    };

    expect(() => fileUploadSchema.parse(validData)).not.toThrow();
  });

  it('should apply default type', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    const result = fileUploadSchema.parse({ file });

    expect(result.type).toBe('other');
  });
});

describe('Contact Form Schema', () => {
  it('should accept valid contact form data', () => {
    const validData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with more than 10 characters',
    };

    expect(() => contactFormSchema.parse(validData)).not.toThrow();
  });

  it('should reject message shorter than 10 characters', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Short',
    };

    expect(() => contactFormSchema.parse(invalidData)).toThrow();
  });

  it('should reject message longer than 2000 characters', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'a'.repeat(2001),
    };

    expect(() => contactFormSchema.parse(invalidData)).toThrow();
  });
});
