import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { verifyToken, generateToken, createUserPayload } from './jwt.util.js';

describe('jwt.util.js tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        mock.restoreAll();
    });

    describe('generateToken', () => {
        it('should throw Error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;
            assert.throws(() => generateToken({ id: 1 }), /JWT_SECRET is not defined/);
        });

        it('should generate a token with payload and secret', () => {
            process.env.JWT_SECRET = 'test-secret';
            const payload = { id: 1 };
            const result = generateToken(payload);
            assert.ok(typeof result === 'string');
        });
    });

    describe('verifyToken', () => {
        it('should throw Error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;
            assert.throws(() => verifyToken('some-token'), /JWT_SECRET is not defined/);
        });

        it('should throw Error if token is invalid or expired', () => {
            process.env.JWT_SECRET = 'test-secret';
            assert.throws(() => verifyToken('invalid-token'), /Invalid or expired token/);
        });

        it('should verify valid token', () => {
            process.env.JWT_SECRET = 'test-secret';
            const token = generateToken({ id: 1 });
            const result = verifyToken(token);
            assert.strictEqual(result.id, 1);
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

            assert.deepStrictEqual(result, {
                _id: 'user123',
                username: 'test@example.com'
            });
        });
    });
});
