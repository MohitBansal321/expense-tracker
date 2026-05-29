import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => {
    return {
        default: {
            sign: jest.fn(),
            verify: jest.fn()
        }
    };
});

const { verifyToken, generateToken, createUserPayload } = await import('./jwt.util.js');
const jwt = (await import('jsonwebtoken')).default;

describe('jwt.util.js tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('generateToken', () => {
        it('should generate a token with payload and secret', () => {
            process.env.JWT_SECRET = 'test-secret';
            jwt.sign.mockReturnValue('generated-token');

            const payload = { id: 1 };
            const result = generateToken(payload);

            expect(result).toBe('generated-token');
            expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '1h' });
        });

        it('should allow custom expiration time', () => {
            process.env.JWT_SECRET = 'test-secret';
            jwt.sign.mockReturnValue('generated-token');

            const payload = { id: 1 };
            const result = generateToken(payload, '2h');

            expect(result).toBe('generated-token');
            expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '2h' });
        });

        it('should throw Error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;

            expect(() => generateToken({ id: 1 })).toThrow('JWT_SECRET is not defined in environment variables');
        });
    });

    describe('verifyToken', () => {
        it('should verify valid token', () => {
            process.env.JWT_SECRET = 'test-secret';
            jwt.verify.mockReturnValue({ id: 1 });

            const result = verifyToken('valid-token');

            expect(result).toEqual({ id: 1 });
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
        });

        it('should throw Error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;

            expect(() => verifyToken('some-token')).toThrow('JWT_SECRET is not defined in environment variables');
        });

        it('should throw Error if token is invalid or expired', () => {
            process.env.JWT_SECRET = 'test-secret';
            jwt.verify.mockImplementation(() => {
                throw new Error('jwt expired');
            });

            expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
        });
    });

    describe('createUserPayload', () => {
        it('should create payload from user object', () => {
            const user = {
                _id: 'user123',
                email: 'test@example.com',
                otherField: 'ignored'
            };

            const result = createUserPayload(user);

            expect(result).toEqual({
                _id: 'user123',
                username: 'test@example.com'
            });
        });
    });
});
